"""
Unit tests for GeoShield Supabase Monitoring and Auto-Recovery.

Validates recovery decision logic, polling, Render bounded retries,
token redaction, and configuration parsing with 100% mocked dependencies.
No real credentials or remote network connections are required.
"""

import json
import os
import unittest
import urllib.error
import urllib.request
from unittest.mock import MagicMock, patch

from scripts.supabase_recovery import (
    ConfigurationError,
    GeoShieldVerificationClient,
    RecoveryConfig,
    SafeLogger,
    SafeRenderRedirectHandler,
    StrictNoRedirectHandler,
    SupabaseApiClient,
    SupabaseMonitorOrchestrator,
    STATUS_ACTIVE_HEALTHY,
    STATUS_ACTIVE_UNHEALTHY,
    STATUS_INACTIVE,
    TRANSIENT_STATUSES,
    FAILURE_OR_TERMINAL_STATUSES,
)


class TestRecoveryConfig(unittest.TestCase):
    """Tests environment variable loading and validation."""

    def test_missing_status_token_raises_configuration_error(self):
        """Scenario: Secret missing -> clear configuration error."""
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaises(ConfigurationError) as ctx:
                RecoveryConfig.from_env()
            self.assertIn("SUPABASE_STATUS_TOKEN", str(ctx.exception))

    def test_default_values_and_token_parsing(self):
        """Verify defaults for ref, url, and false auto_restore."""
        env = {
            "SUPABASE_STATUS_TOKEN": "sb_test_status_secret_123",
            "SUPABASE_RESTORE_TOKEN": "sb_test_restore_secret_456",
        }
        with patch.dict(os.environ, env, clear=True):
            config = RecoveryConfig.from_env()
            self.assertEqual(config.project_ref, "vkjogbutsjamlwsiotfe")
            self.assertEqual(config.api_base_url, "https://geoshield-api-9nl7.onrender.com")
            self.assertEqual(config.status_token, "sb_test_status_secret_123")
            self.assertEqual(config.restore_token, "sb_test_restore_secret_456")
            self.assertFalse(config.enable_auto_restore)

    def test_explicit_auto_restore_enabled(self):
        """Verify auto-restore flag parses truthy values."""
        for val in ("true", "True", "TRUE", "1", "yes"):
            env = {
                "SUPABASE_STATUS_TOKEN": "token",
                "ENABLE_SUPABASE_AUTO_RESTORE": val,
            }
            with patch.dict(os.environ, env, clear=True):
                config = RecoveryConfig.from_env()
                self.assertTrue(config.enable_auto_restore)


class TestSafeLogger(unittest.TestCase):
    """Tests that token and secret masking works reliably."""

    def test_tokens_are_redacted_in_logs(self):
        token_a = "secret_status_token_xyz"
        token_b = "secret_restore_token_abc"
        logger = SafeLogger(secrets_to_mask=[token_a, token_b])

        message = f"Querying API with {token_a} and restore {token_b}"
        masked = logger.mask(message)

        self.assertNotIn(token_a, masked)
        self.assertNotIn(token_b, masked)
        self.assertEqual(masked, "Querying API with [REDACTED] and restore [REDACTED]")


class TestRedirectHandlers(unittest.TestCase):
    """Tests that redirect handlers prevent token forwarding and insecure traversals."""

    def test_strict_no_redirect_handler_rejects_301_302_303_307_308(self):
        handler = StrictNoRedirectHandler()
        req = urllib.request.Request(
            "https://api.supabase.com/v1/projects/test",
            headers={"Authorization": "Bearer sb_secret"},
        )

        # redirect_request must return None
        self.assertIsNone(handler.redirect_request(req, None, 301, "Moved Permanently", {}, "https://evil.com"))

        # http_error_30X must raise HTTPError
        for code in (301, 302, 303, 307, 308):
            method = getattr(handler, f"http_error_{code}")
            with self.assertRaises(urllib.error.HTTPError) as ctx:
                method(req, None, code, "Redirect", {})
            self.assertEqual(ctx.exception.code, code)
            self.assertIn("rejected for authenticated Supabase API call", str(ctx.exception))
            self.assertNotIn("sb_secret", str(ctx.exception))

    def test_safe_render_redirect_handler_rejects_http_downgrade(self):
        handler = SafeRenderRedirectHandler()
        req = urllib.request.Request("https://geoshield-api-9nl7.onrender.com/grid?limit=1")

        with self.assertRaises(urllib.error.HTTPError) as ctx:
            handler.redirect_request(req, None, 302, "Found", {}, "http://geoshield-api-9nl7.onrender.com/grid?limit=1")
        self.assertIn("Insecure redirect scheme 'http' rejected", str(ctx.exception))

    def test_safe_render_redirect_handler_rejects_cross_host(self):
        handler = SafeRenderRedirectHandler()
        req = urllib.request.Request("https://geoshield-api-9nl7.onrender.com/grid?limit=1")

        with self.assertRaises(urllib.error.HTTPError) as ctx:
            handler.redirect_request(req, None, 302, "Found", {}, "https://malicious-external-site.com/grid?limit=1")
        self.assertIn("Cross-host redirect to 'malicious-external-site.com' rejected", str(ctx.exception))

    def test_safe_render_redirect_handler_allows_same_host_https(self):
        handler = SafeRenderRedirectHandler()
        req = urllib.request.Request("https://geoshield-api-9nl7.onrender.com/grid?limit=1")

        redirected_req = handler.redirect_request(
            req, None, 302, "Found", {}, "https://geoshield-api-9nl7.onrender.com/v1/grid?limit=1"
        )
        self.assertIsNotNone(redirected_req)
        self.assertEqual(redirected_req.full_url, "https://geoshield-api-9nl7.onrender.com/v1/grid?limit=1")


class TestSupabaseApiClient(unittest.TestCase):
    """Tests Supabase Management API client calls and redirect rejection."""

    def setUp(self):
        self.logger = SafeLogger(secrets_to_mask=["sb_secret_token_123"])
        self.client = SupabaseApiClient(self.logger)

    @patch("urllib.request.OpenerDirector.open")
    def test_get_project_status_success(self, mock_open):
        mock_resp = MagicMock()
        mock_resp.status = 200
        mock_resp.read.return_value = json.dumps({"status": "ACTIVE_HEALTHY"}).encode("utf-8")
        mock_open.return_value.__enter__.return_value = mock_resp

        code, status, err = self.client.get_project_status("test_ref", "sb_secret_token_123")
        self.assertEqual(code, 200)
        self.assertEqual(status, "ACTIVE_HEALTHY")
        self.assertIsNone(err)

    @patch("urllib.request.OpenerDirector.open")
    def test_authenticated_redirect_rejected_and_token_not_leaked(self, mock_open):
        """Verify redirect error on authenticated endpoint is caught safely and token is redacted."""
        mock_open.side_effect = urllib.error.HTTPError(
            "https://api.supabase.com/v1/projects/test_ref",
            307,
            "HTTP redirect (HTTP 307) rejected for authenticated Supabase API call",
            {},
            None,
        )

        code, status, err = self.client.get_project_status("test_ref", "sb_secret_token_123")
        self.assertEqual(code, 307)
        self.assertIsNone(status)
        self.assertIn("Redirects rejected for security", err)
        self.assertNotIn("sb_secret_token_123", err)

    @patch("urllib.request.OpenerDirector.open")
    def test_restore_project_success(self, mock_open):
        mock_resp = MagicMock()
        mock_resp.status = 201
        mock_open.return_value.__enter__.return_value = mock_resp

        ok, msg = self.client.restore_project("test_ref", "sb_secret_token_123")
        self.assertTrue(ok)
        self.assertIn("Supabase restoration request accepted", msg)


class TestSupabaseMonitorOrchestrator(unittest.TestCase):
    """Tests all recovery decision paths and orchestrator workflows."""

    def setUp(self):
        self.logger = SafeLogger()
        self.mock_api_client = MagicMock(spec=SupabaseApiClient)
        self.mock_verifier = MagicMock(spec=GeoShieldVerificationClient)

        self.base_config = RecoveryConfig(
            project_ref="test_ref",
            status_token="test_status_token",
            restore_token=None,
            enable_auto_restore=False,
            api_base_url="https://api.test",
            max_restore_wait_sec=5,
            restore_poll_interval_sec=0.01,
            backend_retry_count=3,
            backend_retry_delay_sec=0.01,
        )

    def test_active_project_no_restore_call(self):
        """Scenario: Active project -> no restore call, proceeds to verify grid."""
        self.mock_api_client.get_project_status.return_value = (200, STATUS_ACTIVE_HEALTHY, None)
        self.mock_verifier.verify_grid_endpoint.return_value = (True, "Grid verified OK")

        orchestrator = SupabaseMonitorOrchestrator(
            self.base_config, self.logger, self.mock_api_client, self.mock_verifier
        )
        exit_code = orchestrator.run()

        self.assertEqual(exit_code, 0)
        self.mock_api_client.restore_project.assert_not_called()
        self.mock_verifier.verify_grid_endpoint.assert_called_once()

    def test_inactive_project_with_auto_restore_disabled_no_restore_call(self):
        """Scenario: Inactive project with auto-restore disabled -> no restore call, returns failure."""
        self.mock_api_client.get_project_status.return_value = (200, STATUS_INACTIVE, None)
        self.base_config.enable_auto_restore = False
        self.base_config.restore_token = "some_token"

        orchestrator = SupabaseMonitorOrchestrator(
            self.base_config, self.logger, self.mock_api_client, self.mock_verifier
        )
        exit_code = orchestrator.run()

        self.assertEqual(exit_code, 1)
        self.mock_api_client.restore_project.assert_not_called()
        self.mock_verifier.verify_grid_endpoint.assert_not_called()

    def test_inactive_project_without_restore_token_no_restore_call(self):
        """Scenario: Inactive project without restore token -> no restore call, returns failure."""
        self.mock_api_client.get_project_status.return_value = (200, STATUS_INACTIVE, None)
        self.base_config.enable_auto_restore = True
        self.base_config.restore_token = None

        orchestrator = SupabaseMonitorOrchestrator(
            self.base_config, self.logger, self.mock_api_client, self.mock_verifier
        )
        exit_code = orchestrator.run()

        self.assertEqual(exit_code, 1)
        self.mock_api_client.restore_project.assert_not_called()
        self.mock_verifier.verify_grid_endpoint.assert_not_called()

    def test_inactive_project_with_auto_restore_enabled_and_token_exactly_one_restore_call(self):
        """Scenario: Inactive with auto-restore & token -> exactly one restore call, polls until healthy."""
        # Initial status: INACTIVE; subsequent polls: RESTORING, then ACTIVE_HEALTHY
        self.mock_api_client.get_project_status.side_effect = [
            (200, STATUS_INACTIVE, None),
            (200, "RESTORING", None),
            (200, STATUS_ACTIVE_HEALTHY, None),
        ]
        self.mock_api_client.restore_project.return_value = (True, "Restore initiated")
        self.mock_verifier.verify_grid_endpoint.return_value = (True, "Grid verified OK")

        self.base_config.enable_auto_restore = True
        self.base_config.restore_token = "valid_restore_token"

        with patch("time.sleep", return_value=None):
            orchestrator = SupabaseMonitorOrchestrator(
                self.base_config, self.logger, self.mock_api_client, self.mock_verifier
            )
            exit_code = orchestrator.run()

        self.assertEqual(exit_code, 0)
        self.assertEqual(self.mock_api_client.restore_project.call_count, 1)
        self.mock_api_client.restore_project.assert_called_once_with("test_ref", "valid_restore_token")
        self.mock_verifier.verify_grid_endpoint.assert_called_once()

    def test_project_already_restoring_no_restore_call(self):
        """Scenario: Project already restoring -> poll, do not issue another restore call."""
        # Initial status: RESTORING; subsequent poll: ACTIVE_HEALTHY
        self.mock_api_client.get_project_status.side_effect = [
            (200, "RESTORING", None),
            (200, STATUS_ACTIVE_HEALTHY, None),
        ]
        self.mock_verifier.verify_grid_endpoint.return_value = (True, "Grid verified OK")

        self.base_config.enable_auto_restore = True
        self.base_config.restore_token = "valid_restore_token"

        with patch("time.sleep", return_value=None):
            orchestrator = SupabaseMonitorOrchestrator(
                self.base_config, self.logger, self.mock_api_client, self.mock_verifier
            )
            exit_code = orchestrator.run()

        self.assertEqual(exit_code, 0)
        self.mock_api_client.restore_project.assert_not_called()
        self.mock_verifier.verify_grid_endpoint.assert_called_once()

    def test_restore_failure_fails_safely(self):
        """Scenario: Restore API call returns error -> fail safely without crashing."""
        self.mock_api_client.get_project_status.return_value = (200, STATUS_INACTIVE, None)
        self.mock_api_client.restore_project.return_value = (False, "Supabase 403 Forbidden")

        self.base_config.enable_auto_restore = True
        self.base_config.restore_token = "valid_restore_token"

        orchestrator = SupabaseMonitorOrchestrator(
            self.base_config, self.logger, self.mock_api_client, self.mock_verifier
        )
        exit_code = orchestrator.run()

        self.assertEqual(exit_code, 1)
        self.mock_api_client.restore_project.assert_called_once()
        self.mock_verifier.verify_grid_endpoint.assert_not_called()

    def test_restore_poll_enters_terminal_failure(self):
        """Scenario: Project transitions from RESTORING to RESTORE_FAILED -> fail safely."""
        self.mock_api_client.get_project_status.side_effect = [
            (200, "RESTORING", None),
            (200, "RESTORE_FAILED", None),
        ]

        with patch("time.sleep", return_value=None):
            orchestrator = SupabaseMonitorOrchestrator(
                self.base_config, self.logger, self.mock_api_client, self.mock_verifier
            )
            exit_code = orchestrator.run()

        self.assertEqual(exit_code, 1)
        self.mock_verifier.verify_grid_endpoint.assert_not_called()

    def test_restore_poll_timeout_fails_safely(self):
        """Scenario: Project remains in RESTORING until timeout elapsed -> fail safely."""
        self.mock_api_client.get_project_status.side_effect = [
            (200, "RESTORING", None),
            (200, "RESTORING", None),
            (200, "RESTORING", None),
        ]

        # Artificially simulate clock progression beyond max_wait_sec
        time_seq = [100.0, 100.0, 101.0, 102.0, 106.0, 107.0]
        with patch("time.time", side_effect=time_seq), patch("time.sleep", return_value=None):
            orchestrator = SupabaseMonitorOrchestrator(
                self.base_config, self.logger, self.mock_api_client, self.mock_verifier
            )
            exit_code = orchestrator.run()

        self.assertEqual(exit_code, 1)
        self.mock_verifier.verify_grid_endpoint.assert_not_called()

    def test_supabase_auth_failure_reported(self):
        """Scenario: Supabase Management API returns HTTP 401/403 -> reports auth failure and exits 1."""
        self.mock_api_client.get_project_status.return_value = (
            401,
            None,
            "Supabase API authentication/permission failure (HTTP 401). Check SUPABASE_STATUS_TOKEN.",
        )

        orchestrator = SupabaseMonitorOrchestrator(
            self.base_config, self.logger, self.mock_api_client, self.mock_verifier
        )
        exit_code = orchestrator.run()

        self.assertEqual(exit_code, 1)
        self.mock_api_client.restore_project.assert_not_called()
        self.mock_verifier.verify_grid_endpoint.assert_not_called()

    def test_transient_status_coming_up_recovers(self):
        """Scenario: Project status is COMING_UP then transitions to ACTIVE_HEALTHY."""
        self.mock_api_client.get_project_status.side_effect = [
            (200, "COMING_UP", None),
            (200, STATUS_ACTIVE_HEALTHY, None),
        ]
        self.mock_verifier.verify_grid_endpoint.return_value = (True, "Grid verified OK")

        with patch("time.sleep", return_value=None):
            orchestrator = SupabaseMonitorOrchestrator(
                self.base_config, self.logger, self.mock_api_client, self.mock_verifier
            )
            exit_code = orchestrator.run()

        self.assertEqual(exit_code, 0)
        self.mock_api_client.restore_project.assert_not_called()
        self.mock_verifier.verify_grid_endpoint.assert_called_once()

    def test_active_unhealthy_no_restore_call(self):
        """Scenario: ACTIVE_UNHEALTHY -> warning logged, no restore call, proceeds to test grid."""
        self.mock_api_client.get_project_status.return_value = (200, STATUS_ACTIVE_UNHEALTHY, None)
        self.mock_verifier.verify_grid_endpoint.return_value = (True, "Grid verified OK")

        orchestrator = SupabaseMonitorOrchestrator(
            self.base_config, self.logger, self.mock_api_client, self.mock_verifier
        )
        exit_code = orchestrator.run()

        self.assertEqual(exit_code, 0)
        self.mock_api_client.restore_project.assert_not_called()
        self.mock_verifier.verify_grid_endpoint.assert_called_once()

    def test_transient_upgrading_polls_and_recovers(self):
        """Scenario: Project is UPGRADING -> poll, no restore call, transitions to ACTIVE_HEALTHY."""
        self.mock_api_client.get_project_status.side_effect = [
            (200, "UPGRADING", None),
            (200, STATUS_ACTIVE_HEALTHY, None),
        ]
        self.mock_verifier.verify_grid_endpoint.return_value = (True, "Grid verified OK")

        with patch("time.sleep", return_value=None):
            orchestrator = SupabaseMonitorOrchestrator(
                self.base_config, self.logger, self.mock_api_client, self.mock_verifier
            )
            exit_code = orchestrator.run()

        self.assertEqual(exit_code, 0)
        self.mock_api_client.restore_project.assert_not_called()
        self.mock_verifier.verify_grid_endpoint.assert_called_once()

    def test_transient_resizing_polls_and_recovers(self):
        """Scenario: Project is RESIZING -> poll, no restore call, transitions to ACTIVE_HEALTHY."""
        self.mock_api_client.get_project_status.side_effect = [
            (200, "RESIZING", None),
            (200, STATUS_ACTIVE_HEALTHY, None),
        ]
        self.mock_verifier.verify_grid_endpoint.return_value = (True, "Grid verified OK")

        with patch("time.sleep", return_value=None):
            orchestrator = SupabaseMonitorOrchestrator(
                self.base_config, self.logger, self.mock_api_client, self.mock_verifier
            )
            exit_code = orchestrator.run()

        self.assertEqual(exit_code, 0)
        self.mock_api_client.restore_project.assert_not_called()
        self.mock_verifier.verify_grid_endpoint.assert_called_once()

    def test_transient_pausing_polls_and_recovers(self):
        """Scenario: Project is PAUSING -> poll, no restore call, transitions to ACTIVE_HEALTHY."""
        self.mock_api_client.get_project_status.side_effect = [
            (200, "PAUSING", None),
            (200, STATUS_ACTIVE_HEALTHY, None),
        ]
        self.mock_verifier.verify_grid_endpoint.return_value = (True, "Grid verified OK")

        with patch("time.sleep", return_value=None):
            orchestrator = SupabaseMonitorOrchestrator(
                self.base_config, self.logger, self.mock_api_client, self.mock_verifier
            )
            exit_code = orchestrator.run()

        self.assertEqual(exit_code, 0)
        self.mock_api_client.restore_project.assert_not_called()
        self.mock_verifier.verify_grid_endpoint.assert_called_once()

    def test_transient_going_down_polls_and_recovers(self):
        """Scenario: Project is GOING_DOWN -> poll, no restore call, transitions to ACTIVE_HEALTHY."""
        self.mock_api_client.get_project_status.side_effect = [
            (200, "GOING_DOWN", None),
            (200, STATUS_ACTIVE_HEALTHY, None),
        ]
        self.mock_verifier.verify_grid_endpoint.return_value = (True, "Grid verified OK")

        with patch("time.sleep", return_value=None):
            orchestrator = SupabaseMonitorOrchestrator(
                self.base_config, self.logger, self.mock_api_client, self.mock_verifier
            )
            exit_code = orchestrator.run()

        self.assertEqual(exit_code, 0)
        self.mock_api_client.restore_project.assert_not_called()
        self.mock_verifier.verify_grid_endpoint.assert_called_once()

    def test_failure_pause_failed_fails_safely(self):
        """Scenario: Project reports PAUSE_FAILED -> fail immediately, no restore call."""
        self.mock_api_client.get_project_status.return_value = (200, "PAUSE_FAILED", None)

        orchestrator = SupabaseMonitorOrchestrator(
            self.base_config, self.logger, self.mock_api_client, self.mock_verifier
        )
        exit_code = orchestrator.run()

        self.assertEqual(exit_code, 1)
        self.mock_api_client.restore_project.assert_not_called()
        self.mock_verifier.verify_grid_endpoint.assert_not_called()

    def test_failure_unknown_fails_safely(self):
        """Scenario: Project reports UNKNOWN -> fail immediately, no restore call."""
        self.mock_api_client.get_project_status.return_value = (200, "UNKNOWN", None)

        orchestrator = SupabaseMonitorOrchestrator(
            self.base_config, self.logger, self.mock_api_client, self.mock_verifier
        )
        exit_code = orchestrator.run()

        self.assertEqual(exit_code, 1)
        self.mock_api_client.restore_project.assert_not_called()
        self.mock_verifier.verify_grid_endpoint.assert_not_called()

    def test_failure_removed_fails_safely(self):
        """Scenario: Project reports REMOVED -> fail immediately, no restore call."""
        self.mock_api_client.get_project_status.return_value = (200, "REMOVED", None)

        orchestrator = SupabaseMonitorOrchestrator(
            self.base_config, self.logger, self.mock_api_client, self.mock_verifier
        )
        exit_code = orchestrator.run()

        self.assertEqual(exit_code, 1)
        self.mock_api_client.restore_project.assert_not_called()
        self.mock_verifier.verify_grid_endpoint.assert_not_called()

    def test_initial_terminal_failure_status(self):
        """Scenario: Initial status is INIT_FAILED or REMOVED -> fail immediately."""
        self.mock_api_client.get_project_status.return_value = (200, "INIT_FAILED", None)

        orchestrator = SupabaseMonitorOrchestrator(
            self.base_config, self.logger, self.mock_api_client, self.mock_verifier
        )
        exit_code = orchestrator.run()

        self.assertEqual(exit_code, 1)
        self.mock_api_client.restore_project.assert_not_called()
        self.mock_verifier.verify_grid_endpoint.assert_not_called()

    def test_backend_failure_does_not_trigger_supabase_restore(self):
        """
        Scenario: Supabase is healthy, but Render fails.
        Confirm no restore call is ever made to Supabase when backend is down.
        """
        self.mock_api_client.get_project_status.return_value = (200, STATUS_ACTIVE_HEALTHY, None)
        self.mock_verifier.verify_grid_endpoint.return_value = (False, "Backend 502 Bad Gateway")

        self.base_config.enable_auto_restore = True
        self.base_config.restore_token = "valid_token"

        orchestrator = SupabaseMonitorOrchestrator(
            self.base_config, self.logger, self.mock_api_client, self.mock_verifier
        )
        exit_code = orchestrator.run()

        self.assertEqual(exit_code, 1)
        self.mock_api_client.restore_project.assert_not_called()

    def test_transient_pausing_transitions_to_inactive_breaks_out_immediately(self):
        """
        Scenario: Project starts in PAUSING and settles to INACTIVE.
        Orchestrator breaks out immediately without waiting full 15 minutes,
        requires manual unpause under default auto-restore=false, and exits 1.
        """
        self.mock_api_client.get_project_status.side_effect = [
            (200, "PAUSING", None),
            (200, STATUS_INACTIVE, None),
        ]
        self.base_config.enable_auto_restore = False

        with patch("time.sleep", return_value=None):
            orchestrator = SupabaseMonitorOrchestrator(
                self.base_config, self.logger, self.mock_api_client, self.mock_verifier
            )
            exit_code = orchestrator.run()

        self.assertEqual(exit_code, 1)
        self.mock_api_client.restore_project.assert_not_called()
        self.mock_verifier.verify_grid_endpoint.assert_not_called()

    def test_transient_going_down_transitions_to_inactive_breaks_out_immediately(self):
        """
        Scenario: Project starts in GOING_DOWN and settles to INACTIVE.
        Orchestrator breaks out immediately, makes 0 restore calls, and exits 1.
        """
        self.mock_api_client.get_project_status.side_effect = [
            (200, "GOING_DOWN", None),
            (200, STATUS_INACTIVE, None),
        ]
        self.base_config.enable_auto_restore = False

        with patch("time.sleep", return_value=None):
            orchestrator = SupabaseMonitorOrchestrator(
                self.base_config, self.logger, self.mock_api_client, self.mock_verifier
            )
            exit_code = orchestrator.run()

        self.assertEqual(exit_code, 1)
        self.mock_api_client.restore_project.assert_not_called()
        self.mock_verifier.verify_grid_endpoint.assert_not_called()

    def test_transient_pausing_transitions_to_inactive_triggers_restore_if_enabled(self):
        """
        Scenario: Project starts in PAUSING and settles to INACTIVE.
        Auto-restore is enabled with restore token:
        Orchestrator detects settling into INACTIVE, triggers restore exactly once,
        polls to ACTIVE_HEALTHY, verifies grid, and returns 0.
        """
        self.mock_api_client.get_project_status.side_effect = [
            (200, "PAUSING", None),
            (200, STATUS_INACTIVE, None),
            (200, "RESTORING", None),
            (200, STATUS_ACTIVE_HEALTHY, None),
        ]
        self.mock_api_client.restore_project.return_value = (True, "Restore accepted")
        self.mock_verifier.verify_grid_endpoint.return_value = (True, "Grid verified OK")

        self.base_config.enable_auto_restore = True
        self.base_config.restore_token = "valid_restore_token"

        with patch("time.sleep", return_value=None):
            orchestrator = SupabaseMonitorOrchestrator(
                self.base_config, self.logger, self.mock_api_client, self.mock_verifier
            )
            exit_code = orchestrator.run()

        self.assertEqual(exit_code, 0)
        self.assertEqual(self.mock_api_client.restore_project.call_count, 1)
        self.mock_verifier.verify_grid_endpoint.assert_called_once()

    def test_inactive_more_than_60s_then_transitions_to_restoring_and_active_healthy(self):
        """
        Scenario: Project remains INACTIVE for >60s following restore request.
        Orchestrator does not terminate prematurely, continues polling,
        transitions to RESTORING, then ACTIVE_HEALTHY, verifies grid, and returns 0.
        Verifies exactly one restore POST call occurred.
        """
        self.mock_api_client.get_project_status.side_effect = [
            (200, STATUS_INACTIVE, None),       # initial check
            (200, STATUS_INACTIVE, None),       # poll at 30s
            (200, STATUS_INACTIVE, None),       # poll at 75s (>60s)
            (200, "RESTORING", None),           # poll at 110s
            (200, STATUS_ACTIVE_HEALTHY, None), # poll at 140s
        ]
        self.mock_api_client.restore_project.return_value = (True, "Restore accepted")
        self.mock_verifier.verify_grid_endpoint.return_value = (True, "Grid verified OK")

        self.base_config.enable_auto_restore = True
        self.base_config.restore_token = "valid_restore_token"
        self.base_config.max_restore_wait_sec = 900

        time_seq = [0.0, 0.0, 30.0, 30.0, 75.0, 75.0, 110.0, 110.0, 140.0, 140.0, 150.0]
        with patch("time.time", side_effect=time_seq), patch("time.sleep", return_value=None):
            orchestrator = SupabaseMonitorOrchestrator(
                self.base_config, self.logger, self.mock_api_client, self.mock_verifier
            )
            exit_code = orchestrator.run()

        self.assertEqual(exit_code, 0)
        self.assertEqual(self.mock_api_client.restore_project.call_count, 1)
        self.mock_verifier.verify_grid_endpoint.assert_called_once()

    def test_restoring_status_remains_inactive_until_timeout_safely_exits_one(self):
        """
        Scenario: After restore request is issued, project remains INACTIVE until overall timeout.
        Orchestrator polls without terminating prematurely at 60s, hits overall timeout,
        refuses duplicate restore attempt, and safely exits 1.
        """
        self.mock_api_client.get_project_status.side_effect = [
            (200, STATUS_INACTIVE, None),  # initial check
            (200, STATUS_INACTIVE, None),  # poll 1
            (200, STATUS_INACTIVE, None),  # poll 2
            (200, STATUS_INACTIVE, None),  # poll 3
        ]
        self.mock_api_client.restore_project.return_value = (True, "Restore accepted")

        self.base_config.enable_auto_restore = True
        self.base_config.restore_token = "valid_restore_token"
        self.base_config.max_restore_wait_sec = 100

        time_seq = [0.0, 0.0, 30.0, 30.0, 70.0, 70.0, 105.0, 105.0]
        with patch("time.time", side_effect=time_seq), patch("time.sleep", return_value=None):
            orchestrator = SupabaseMonitorOrchestrator(
                self.base_config, self.logger, self.mock_api_client, self.mock_verifier
            )
            exit_code = orchestrator.run()

        self.assertEqual(exit_code, 1)
        self.assertEqual(self.mock_api_client.restore_project.call_count, 1)
        self.mock_verifier.verify_grid_endpoint.assert_not_called()


class TestGeoShieldVerificationClient(unittest.TestCase):
    """Tests the GeoShield API real database read and cold-start retry logic."""

    def setUp(self):
        self.logger = SafeLogger()
        self.client = GeoShieldVerificationClient(self.logger)

    def test_insecure_scheme_rejected(self):
        """Scenario: HTTP scheme provided for GeoShield endpoint -> immediate rejection."""
        ok, msg = self.client.verify_grid_endpoint(
            "http://insecure-backend.com", retry_count=1, retry_delay_sec=0, timeout_sec=5
        )
        self.assertFalse(ok)
        self.assertIn("Insecure scheme 'http'", msg)

    @patch("urllib.request.OpenerDirector.open")
    def test_valid_geojson_response_passes(self, mock_open):
        """Scenario: HTTP 200 with valid FeatureCollection -> pass."""
        valid_body = json.dumps({
            "type": "FeatureCollection",
            "features": [{"type": "Feature", "properties": {"cell_id": "r0142_c0087"}}],
        }).encode("utf-8")

        mock_resp = MagicMock()
        mock_resp.status = 200
        mock_resp.read.return_value = valid_body
        mock_open.return_value.__enter__.return_value = mock_resp

        ok, msg = self.client.verify_grid_endpoint("https://api.test", retry_count=1, retry_delay_sec=0, timeout_sec=5)
        self.assertTrue(ok)
        self.assertIn("FeatureCollection with 1 feature(s)", msg)

    @patch("urllib.request.OpenerDirector.open")
    def test_invalid_geojson_response_fails(self, mock_open):
        """Scenario: Invalid GeoJSON response -> verification failure."""
        invalid_body = json.dumps({
            "type": "NotAFeatureCollection",
            "features": "not_a_list",
        }).encode("utf-8")

        mock_resp = MagicMock()
        mock_resp.status = 200
        mock_resp.read.return_value = invalid_body
        mock_open.return_value.__enter__.return_value = mock_resp

        ok, msg = self.client.verify_grid_endpoint("https://api.test", retry_count=1, retry_delay_sec=0, timeout_sec=5)
        self.assertFalse(ok)
        self.assertIn("Invalid GeoJSON", msg)

    @patch("urllib.request.OpenerDirector.open")
    def test_render_cold_start_bounded_retry_eventual_success(self, mock_open):
        """Scenario: Render cold start: initial 502/503 errors followed by HTTP 200."""
        valid_body = json.dumps({
            "type": "FeatureCollection",
            "features": [{"type": "Feature"}],
        }).encode("utf-8")

        mock_resp_fail = MagicMock()
        mock_resp_fail.status = 502

        mock_resp_ok = MagicMock()
        mock_resp_ok.status = 200
        mock_resp_ok.read.return_value = valid_body

        mock_open.return_value.__enter__.side_effect = [
            mock_resp_fail,
            mock_resp_fail,
            mock_resp_ok,
        ]

        with patch("time.sleep", return_value=None):
            ok, msg = self.client.verify_grid_endpoint(
                "https://api.test", retry_count=3, retry_delay_sec=0.01, timeout_sec=5
            )

        self.assertTrue(ok)
        self.assertIn("GeoShield grid verification passed", msg)
        self.assertEqual(mock_open.call_count, 3)

    @patch("urllib.request.OpenerDirector.open")
    def test_render_cold_start_bounded_retry_exhaustion_fails(self, mock_open):
        """Scenario: Render cold start retries exhausted -> returns failure."""
        mock_resp_fail = MagicMock()
        mock_resp_fail.status = 503

        mock_open.return_value.__enter__.return_value = mock_resp_fail

        with patch("time.sleep", return_value=None):
            ok, msg = self.client.verify_grid_endpoint(
                "https://api.test", retry_count=3, retry_delay_sec=0.01, timeout_sec=5
            )

        self.assertFalse(ok)
        self.assertIn("unavailable after 3 attempts", msg)
        self.assertEqual(mock_open.call_count, 3)


if __name__ == "__main__":
    unittest.main()
