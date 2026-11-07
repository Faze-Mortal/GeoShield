#!/usr/bin/env python3
"""
GeoShield Supabase Monitoring and Conditional Auto-Recovery

This script:
1. Queries the official Supabase Management API to check project health.
2. If the project is INACTIVE and auto-recovery is explicitly enabled with a valid
   restore token, requests restoration and polls until ACTIVE_HEALTHY.
3. If the project is ACTIVE_HEALTHY, verifies database connectivity and wakes up
   the Render backend via a read-only request to /grid?limit=1.
4. Ensures all tokens, secrets, and credentials are never printed or logged.
"""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from typing import Any, Dict, Optional, Tuple


# Complete set of official Supabase Management API project statuses:
# ACTIVE_HEALTHY, ACTIVE_UNHEALTHY, COMING_UP, RESTARTING, RESTORING,
# RESTORE_FAILED, PAUSING, PAUSE_FAILED, UPGRADING, RESIZING, GOING_DOWN,
# INIT_FAILED, INACTIVE, REMOVED, UNKNOWN.

STATUS_ACTIVE_HEALTHY = "ACTIVE_HEALTHY"
STATUS_ACTIVE_UNHEALTHY = "ACTIVE_UNHEALTHY"
STATUS_INACTIVE = "INACTIVE"

# Transient transition states where polling until ACTIVE_HEALTHY is appropriate
TRANSIENT_STATUSES = {
    "RESTORING",
    "COMING_UP",
    "RESTARTING",
    "UPGRADING",
    "RESIZING",
    "PAUSING",
    "GOING_DOWN",
}

# Failure or terminal states that require human intervention; restoration MUST NOT be called
FAILURE_OR_TERMINAL_STATUSES = {
    "RESTORE_FAILED",
    "PAUSE_FAILED",
    "INIT_FAILED",
    "REMOVED",
    "UNKNOWN",
}

USER_AGENT = "GeoShield-Supabase-Monitor/1.0"


class ConfigurationError(Exception):
    """Raised when required configuration or secrets are missing."""
    pass


@dataclass
class RecoveryConfig:
    project_ref: str
    status_token: str
    restore_token: Optional[str]
    enable_auto_restore: bool
    api_base_url: str
    max_restore_wait_sec: int = 900  # 15 minutes max wait
    restore_poll_interval_sec: int = 30  # Poll every 30 seconds
    backend_retry_count: int = 15  # Up to 15 retries for Render cold start
    backend_retry_delay_sec: int = 8  # 8 seconds delay between attempts (~2 min total)
    backend_timeout_sec: int = 25  # 25 seconds per request timeout

    @classmethod
    def from_env(cls) -> "RecoveryConfig":
        status_token = os.environ.get("SUPABASE_STATUS_TOKEN", "").strip()
        if not status_token:
            raise ConfigurationError(
                "Missing required GitHub secret: SUPABASE_STATUS_TOKEN. "
                "Please configure this secret in repository settings."
            )

        restore_token_raw = os.environ.get("SUPABASE_RESTORE_TOKEN", "").strip()
        restore_token = restore_token_raw if restore_token_raw else None

        project_ref = os.environ.get("SUPABASE_PROJECT_REF", "").strip() or "vkjogbutsjamlwsiotfe"
        api_base_url = (
            os.environ.get("GEOSHIELD_API_BASE_URL", "").strip()
            or "https://geoshield-api-9nl7.onrender.com"
        ).rstrip("/")

        auto_restore_raw = os.environ.get("ENABLE_SUPABASE_AUTO_RESTORE", "false").strip().lower()
        enable_auto_restore = auto_restore_raw in ("true", "1", "yes")

        return cls(
            project_ref=project_ref,
            status_token=status_token,
            restore_token=restore_token,
            enable_auto_restore=enable_auto_restore,
            api_base_url=api_base_url,
        )


class SafeLogger:
    """Logs messages while guaranteeing that sensitive tokens are redacted."""

    def __init__(self, secrets_to_mask: Optional[list[str]] = None) -> None:
        self._secrets: list[str] = [s for s in (secrets_to_mask or []) if s]

    def add_secret(self, secret: Optional[str]) -> None:
        if secret and secret not in self._secrets and len(secret) >= 4:
            self._secrets.append(secret)

    def mask(self, text: str) -> str:
        masked = text
        for secret in self._secrets:
            if secret:
                masked = masked.replace(secret, "[REDACTED]")
        return masked

    def info(self, msg: str) -> None:
        print(f"[INFO] {self.mask(msg)}", flush=True)

    def notice(self, msg: str) -> None:
        print(f"::notice::{self.mask(msg)}", flush=True)

    def warning(self, msg: str) -> None:
        print(f"::warning::{self.mask(msg)}", flush=True)

    def error(self, msg: str) -> None:
        print(f"::error::{self.mask(msg)}", flush=True)


class SupabaseApiClient:
    """Interacts with the official Supabase Management API."""

    def __init__(self, logger: SafeLogger) -> None:
        self.logger = logger

    def get_project_status(self, project_ref: str, token: str) -> Tuple[int, Optional[str], Optional[str]]:
        """
        Queries GET https://api.supabase.com/v1/projects/{ref}
        Returns: (http_status, project_status_string, error_message)
        """
        url = f"https://api.supabase.com/v1/projects/{project_ref}"
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "User-Agent": USER_AGENT,
        }
        req = urllib.request.Request(url, headers=headers, method="GET")

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                status_code = resp.status
                data = json.loads(resp.read().decode("utf-8"))
                project_status = data.get("status")
                return status_code, project_status, None
        except urllib.error.HTTPError as e:
            err_body = ""
            try:
                err_body = e.read().decode("utf-8", errors="replace")
            except Exception:
                pass

            if e.code in (401, 403):
                return e.code, None, f"Supabase API authentication/permission failure (HTTP {e.code}). Check SUPABASE_STATUS_TOKEN."
            if e.code == 404:
                return e.code, None, f"Supabase project '{project_ref}' not found (HTTP 404). Check SUPABASE_PROJECT_REF."
            return e.code, None, f"Supabase API returned HTTP {e.code}: {err_body[:200]}"
        except urllib.error.URLError as e:
            return 0, None, f"Network error contacting Supabase Management API: {e.reason}"
        except json.JSONDecodeError:
            return 200, None, "Invalid JSON response from Supabase Management API"
        except Exception as e:
            return 0, None, f"Unexpected error querying Supabase API: {str(e)}"

    def restore_project(self, project_ref: str, token: str) -> Tuple[bool, str]:
        """
        Calls POST https://api.supabase.com/v1/projects/{ref}/restore
        Returns: (success_bool, message_str)
        """
        url = f"https://api.supabase.com/v1/projects/{project_ref}/restore"
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "Content-Length": "0",
            "User-Agent": USER_AGENT,
        }
        req = urllib.request.Request(url, data=b"", headers=headers, method="POST")

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                if resp.status in (200, 201, 202):
                    return True, f"Supabase restoration request accepted (HTTP {resp.status})."
                return True, f"Restoration request returned HTTP {resp.status}."
        except urllib.error.HTTPError as e:
            err_body = ""
            try:
                err_body = e.read().decode("utf-8", errors="replace")
            except Exception:
                pass

            if e.code in (401, 403):
                return False, f"Supabase restore permission failure (HTTP {e.code}). Check SUPABASE_RESTORE_TOKEN permissions."
            if e.code == 409:
                return True, "Project is already undergoing restoration or state transition (HTTP 409)."
            return False, f"Supabase restore request failed with HTTP {e.code}: {err_body[:200]}"
        except urllib.error.URLError as e:
            return False, f"Network error sending restore request: {e.reason}"
        except Exception as e:
            return False, f"Unexpected error sending restore request: {str(e)}"


class GeoShieldVerificationClient:
    """Exercises real database read through the GeoShield Backend API."""

    def __init__(self, logger: SafeLogger) -> None:
        self.logger = logger

    def verify_grid_endpoint(
        self,
        base_url: str,
        retry_count: int,
        retry_delay_sec: int,
        timeout_sec: int,
    ) -> Tuple[bool, str]:
        """
        Calls GET {base_url}/grid?limit=1 with bounded retry logic to tolerate Render cold starts.
        Verifies:
        - HTTP 200
        - Valid JSON
        - FeatureCollection format (type == 'FeatureCollection' and isinstance(features, list))
        """
        endpoint = f"{base_url.rstrip('/')}/grid?limit=1"
        self.logger.info(f"Connecting to GeoShield verification endpoint: {endpoint}")

        headers = {
            "Accept": "application/json",
            "User-Agent": USER_AGENT,
        }

        for attempt in range(1, retry_count + 1):
            req = urllib.request.Request(endpoint, headers=headers, method="GET")
            try:
                with urllib.request.urlopen(req, timeout=timeout_sec) as resp:
                    status_code = resp.status
                    if status_code != 200:
                        self.logger.warning(
                            f"Attempt {attempt}/{retry_count}: GeoShield backend returned HTTP {status_code}. Retrying in {retry_delay_sec}s..."
                        )
                        time.sleep(retry_delay_sec)
                        continue

                    raw_body = resp.read().decode("utf-8")
                    data = json.loads(raw_body)

                    # Validate GeoJSON FeatureCollection structure
                    fc_type = data.get("type")
                    features = data.get("features")

                    if fc_type != "FeatureCollection":
                        return False, f"Invalid GeoJSON: expected type 'FeatureCollection', got '{fc_type}'"

                    if not isinstance(features, list):
                        return False, "Invalid GeoJSON: 'features' attribute is not an array"

                    feature_count = len(features)
                    return True, f"GeoShield grid verification passed (FeatureCollection with {feature_count} feature(s))."

            except urllib.error.HTTPError as e:
                # 500, 502, 503, 504 are typical during Render wake up
                self.logger.warning(
                    f"Attempt {attempt}/{retry_count}: HTTP {e.code} ({e.reason}). Backend may be waking up. Retrying in {retry_delay_sec}s..."
                )
            except urllib.error.URLError as e:
                # Timeout or connection reset during cold start
                self.logger.warning(
                    f"Attempt {attempt}/{retry_count}: Connection error ({e.reason}). Backend cold start in progress. Retrying in {retry_delay_sec}s..."
                )
            except json.JSONDecodeError:
                self.logger.warning(
                    f"Attempt {attempt}/{retry_count}: Invalid JSON response received. Retrying in {retry_delay_sec}s..."
                )
            except Exception as e:
                self.logger.warning(
                    f"Attempt {attempt}/{retry_count}: Request failed ({str(e)}). Retrying in {retry_delay_sec}s..."
                )

            if attempt < retry_count:
                time.sleep(retry_delay_sec)

        return False, f"GeoShield backend unavailable after {retry_count} attempts ({retry_count * retry_delay_sec}s elapsed)."


class SupabaseMonitorOrchestrator:
    """Coordinates monitoring, conditional restoration, and backend verification."""

    def __init__(
        self,
        config: RecoveryConfig,
        logger: SafeLogger,
        api_client: Optional[SupabaseApiClient] = None,
        verifier: Optional[GeoShieldVerificationClient] = None,
    ) -> None:
        self.config = config
        self.logger = logger
        self.api_client = api_client or SupabaseApiClient(logger)
        self.verifier = verifier or GeoShieldVerificationClient(logger)

    def run(self) -> int:
        """
        Executes the monitoring and conditional recovery process.
        Returns exit code: 0 on success, 1 on failure.
        """
        self.logger.info("=" * 65)
        self.logger.info("GEOSHIELD SUPABASE HEALTH MONITOR & RECOVERY AUDIT")
        self.logger.info("=" * 65)
        self.logger.info(f"Target Supabase Project Ref: {self.config.project_ref}")
        self.logger.info(f"Auto-Restore Setting: {self.config.enable_auto_restore}")
        self.logger.info(f"Restore Token Configured: {self.config.restore_token is not None}")
        self.logger.info(f"Target GeoShield Backend: {self.config.api_base_url}")

        # Step 1: Check Supabase Management API
        self.logger.info("Querying Supabase Management API for project status...")
        http_code, status, err_msg = self.api_client.get_project_status(
            self.config.project_ref, self.config.status_token
        )

        if err_msg or not status:
            self.logger.error(f"Failed to retrieve Supabase project status: {err_msg}")
            return 1

        self.logger.info(f"Current Supabase project status: {status}")

        # Step 2: Handle Status Branches
        if status == STATUS_ACTIVE_HEALTHY:
            self.logger.info("Supabase project is healthy (status: ACTIVE_HEALTHY). No restoration required.")

        elif status == STATUS_ACTIVE_UNHEALTHY:
            self.logger.warning(
                "Supabase project is running with degraded service health (status: ACTIVE_UNHEALTHY). "
                "Restoration cannot be requested for active projects. Proceeding to verify database read..."
            )

        elif status in TRANSIENT_STATUSES:
            self.logger.notice(
                f"Project is in transient transition state '{status}'. Polling until '{STATUS_ACTIVE_HEALTHY}'..."
            )
            healthy = self._poll_until_healthy(current_status=status)
            if not healthy:
                return 1

        elif status == STATUS_INACTIVE:
            self.logger.warning("Supabase project is paused/inactive (status: INACTIVE).")
            restored = self._handle_inactive_project()
            if not restored:
                return 1

        elif status in FAILURE_OR_TERMINAL_STATUSES:
            self.logger.error(
                f"Supabase project reports failure/terminal status: '{status}'. "
                "Manual intervention in Supabase dashboard required. Aborting recovery without restore."
            )
            return 1

        else:
            self.logger.error(
                f"Supabase project returned unexpected status '{status}'. "
                "Failing safely without attempting unverified operations."
            )
            return 1

        # Step 3: Database Read & GeoShield Backend Verification
        self.logger.info("Proceeding to GeoShield real database read verification (/grid?limit=1)...")
        grid_ok, grid_msg = self.verifier.verify_grid_endpoint(
            base_url=self.config.api_base_url,
            retry_count=self.config.backend_retry_count,
            retry_delay_sec=self.config.backend_retry_delay_sec,
            timeout_sec=self.config.backend_timeout_sec,
        )

        if grid_ok:
            self.logger.info(f"GeoShield verification succeeded: {grid_msg}")
            self.logger.info("All monitoring and verification checks PASSED successfully.")
            return 0
        else:
            self.logger.error(
                f"GeoShield grid verification failed: {grid_msg}. "
                f"(Note: Supabase reported status '{STATUS_ACTIVE_HEALTHY}'; Render backend or network failed)."
            )
            return 1

    def _handle_inactive_project(self) -> bool:
        """
        Evaluates conditional auto-restore gates and executes restoration if authorized.
        Returns True if project reached ACTIVE_HEALTHY, False otherwise.
        """
        can_auto_restore = self.config.enable_auto_restore and bool(self.config.restore_token)

        if not self.config.enable_auto_restore:
            self.logger.error(
                "Supabase project is INACTIVE, but automatic restoration is disabled "
                "(ENABLE_SUPABASE_AUTO_RESTORE is false). Manual unpause required: "
                f"https://supabase.com/dashboard/project/{self.config.project_ref}"
            )
            return False

        if not self.config.restore_token:
            self.logger.error(
                "Supabase project is INACTIVE and auto-restore is enabled, but SUPABASE_RESTORE_TOKEN "
                "secret is absent. Manual unpause required: "
                f"https://supabase.com/dashboard/project/{self.config.project_ref}"
            )
            return False

        # Both gates passed: request restoration
        self.logger.notice(
            "Auto-restoration conditions met (ENABLE_SUPABASE_AUTO_RESTORE=true and restore token present). "
            f"Issuing restore request for project '{self.config.project_ref}'..."
        )

        success, msg = self.api_client.restore_project(
            self.config.project_ref, self.config.restore_token
        )
        if not success:
            self.logger.error(f"Restoration request failed: {msg}")
            return False

        self.logger.info(f"Restoration request acknowledged: {msg}")
        return self._poll_until_healthy(current_status="RESTORING")

    def _poll_until_healthy(self, current_status: str) -> bool:
        """
        Polls the project status every interval seconds until it reaches ACTIVE_HEALTHY
        or times out / reaches terminal failure.
        """
        start_time = time.time()
        poll_interval = self.config.restore_poll_interval_sec
        max_wait = self.config.max_restore_wait_sec

        self.logger.info(f"Waiting for project to become ACTIVE_HEALTHY (max timeout: {max_wait}s)...")

        while (time.time() - start_time) < max_wait:
            time.sleep(poll_interval)
            elapsed = int(time.time() - start_time)

            _, poll_status, err = self.api_client.get_project_status(
                self.config.project_ref, self.config.status_token
            )

            if err or not poll_status:
                self.logger.warning(
                    f"[{elapsed}s / {max_wait}s] Failed to poll project status: {err}. Retrying..."
                )
                continue

            self.logger.info(f"[{elapsed}s / {max_wait}s] Polled status: {poll_status}")

            if poll_status == STATUS_ACTIVE_HEALTHY:
                self.logger.info(f"Restoration completed! Project is now {STATUS_ACTIVE_HEALTHY} (elapsed: {elapsed}s).")
                return True

            if poll_status in FAILURE_OR_TERMINAL_STATUSES:
                self.logger.error(
                    f"Project entered failure/terminal status during recovery: '{poll_status}'. Aborting."
                )
                return False

            if poll_status not in TRANSIENT_STATUSES and poll_status != STATUS_INACTIVE:
                self.logger.error(
                    f"Project entered unexpected status during recovery: '{poll_status}'. Aborting."
                )
                return False

        self.logger.error(f"Restoration timed out after {max_wait} seconds without reaching {STATUS_ACTIVE_HEALTHY}.")
        return False


def main() -> int:
    try:
        config = RecoveryConfig.from_env()
    except ConfigurationError as e:
        print(f"::error::Configuration Error: {str(e)}", file=sys.stderr, flush=True)
        return 1

    logger = SafeLogger(secrets_to_mask=[config.status_token, config.restore_token or ""])
    orchestrator = SupabaseMonitorOrchestrator(config, logger)
    return orchestrator.run()


if __name__ == "__main__":
    sys.exit(main())
