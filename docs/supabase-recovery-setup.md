# GeoShield — Supabase Monitoring and Conditional Auto-Recovery Setup

This document provides setup instructions, operational procedures, security considerations, and troubleshooting guides for the automated Supabase health monitoring and recovery workflow (`.github/workflows/supabase-recovery.yml`).

---

## Architecture Overview

```
                                      ┌──────────────────────────────────────────────┐
                                      │ GitHub Actions (every 4 hours: 17 */4 * * *) │
                                      └──────────────────────┬───────────────────────┘
                                                             │
                                   Step 1: Check Health      │
                ┌────────────────────────────────────────────┴─────────────────────────────┐
                ▼                                                                          ▼
┌───────────────────────────────┐                                          ┌───────────────────────────────┐
│ Supabase Management API       │                                          │ Supabase Management API       │
│ GET /v1/projects/{ref}        │                                          │ GET /v1/projects/{ref}        │
│ Status: ACTIVE_HEALTHY        │                                          │ Status: INACTIVE (Paused)     │
└───────────────┬───────────────┘                                          └───────────────┬───────────────┘
                │                                                                          │
                │                                                    Is ENABLE_SUPABASE_AUTO_RESTORE=true
                │                                                    AND SUPABASE_RESTORE_TOKEN present?
                │                                                                          │
                │                                                     ┌────────────────────┴───────────────────┐
                │                                                     ▼ (NO)                                   ▼ (YES)
                │                                      ┌───────────────────────────────┐     ┌───────────────────────────────────┐
                │                                      │ Fail Job & Alert Maintainers  │     │ POST /v1/projects/{ref}/restore   │
                │                                      │ Manual Dashboard Unpause Req. │     │ Poll until ACTIVE_HEALTHY (≤15m)  │
                │                                      └───────────────────────────────┘     └─────────────────┬─────────────────┘
                │                                                                                              │
                └──────────────────────────────────────────────┬───────────────────────────────────────────────┘
                                                               │
                                                               ▼ Step 2: Live Database Read
                                               ┌──────────────────────────────────────────────┐
                                               │ GeoShield Backend (Render)                   │
                                               │ GET /grid?limit=1                            │
                                               │ (Wakes cold backend, executes live SQL read, │
                                               │ and generates recurring DB activity)         │
                                               └──────────────────────────────────────────────┘
```

---

## 1. Monitoring-Only Mode (Default & Recommended)

In **Monitoring-Only Mode**:
- The workflow queries the official Supabase Management API every 4 hours (`17 */4 * * *` UTC) to check the project status.
- If the project is `ACTIVE_HEALTHY`, it executes a lightweight, read-only HTTP GET request to `https://geoshield-api-9nl7.onrender.com/grid?limit=1`.
  - This wakes up the Render free service if it is in cold sleep.
  - This verifies that GeoShield's PostGIS database connection and spatial queries (`func.ST_AsGeoJSON(GridRisk.geometry)`) are fully functional by executing a live SQL query (`SELECT ... FROM grid_risk ORDER BY cell_id LIMIT 1`).
  - This generates recurring database activity. Supabase indicates that a few daily database requests are typically sufficient to avoid inactivity pausing, but this threshold is not a guaranteed SLA.
- If the project is `INACTIVE` (paused):
  - The workflow emits a clear error log with a direct link to the Supabase dashboard.
  - The workflow **does not** attempt restoration.
  - No write or management tokens are needed.

---

## 2. GitHub Secrets & Variables Configuration

### Required Secret: `SUPABASE_STATUS_TOKEN`

This token is used **solely** to query project status via `GET https://api.supabase.com/v1/projects/{ref}`.

#### How to Generate the Token in Supabase:
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **Account** -> **Access Tokens** (`https://supabase.com/dashboard/account/tokens`).
3. Click **Generate New Token**.
4. Name the token: `GeoShield-Status-Monitor`.
5. If fine-grained token scopes are available for your organization:
   - Select scope: **Project Settings: Read** for project `geoshield` (`vkjogbutsjamlwsiotfe`).
   - Do **not** grant Project Settings: Write or Organization Owner privileges.
6. Copy the generated token string.

#### Adding the Secret to GitHub:
1. In the GitHub repository (`Faze-Mortal/GeoShield`), navigate to **Settings** -> **Secrets and variables** -> **Actions**.
2. Under **Repository secrets**, click **New repository secret**.
3. Name: `SUPABASE_STATUS_TOKEN`
4. Value: Paste the token.
5. Click **Add secret**.

---

### Optional Secret: `SUPABASE_RESTORE_TOKEN`

This token is used **only** if automatic unpausing / restoration is enabled. It is required to issue `POST https://api.supabase.com/v1/projects/{ref}/restore`.

> [!WARNING]
> **Security Risk Consideration**:
> A token with write permissions to project settings (`Project Settings: Write` or full Management API access) possesses high privileges. If leaked or compromised, write tokens could theoretically perform destructive actions such as altering project configurations, rotating service keys, or initiating database restarts.
>
> GeoShield follows the principle of least privilege:
> 1. `SUPABASE_RESTORE_TOKEN` is kept strictly distinct from `SUPABASE_STATUS_TOKEN`.
> 2. Auto-restoration is gated behind an explicit boolean repository variable (`ENABLE_SUPABASE_AUTO_RESTORE=true`).
> 3. If you only want alerting, **do not set** `SUPABASE_RESTORE_TOKEN` and leave `ENABLE_SUPABASE_AUTO_RESTORE` as `false`.

#### Adding the Secret to GitHub (If Auto-Restore is desired):
1. In Supabase Dashboard, generate an Access Token with write capabilities for project restoration.
2. In GitHub, go to **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.
3. Name: `SUPABASE_RESTORE_TOKEN`
4. Value: Paste the restore token.
5. Click **Add secret**.

---

### Repository Variables (Configurable Defaults)

Configure these in **Settings** -> **Secrets and variables** -> **Actions** -> **Variables**:

| Variable Name | Default Value | Description |
| :--- | :--- | :--- |
| `SUPABASE_PROJECT_REF` | `vkjogbutsjamlwsiotfe` | The Supabase unique project reference identifier. |
| `GEOSHIELD_API_BASE_URL` | `https://geoshield-api-9nl7.onrender.com` | Base URL of the deployed GeoShield backend. |
| `ENABLE_SUPABASE_AUTO_RESTORE` | `false` | Set to `true` to enable automatic unpausing when `INACTIVE`. |

---

## 3. How to Enable Automatic Restoration

Only enable automatic restoration after reviewing the permissions and security risk:

1. Ensure `SUPABASE_RESTORE_TOKEN` has been added under **Repository secrets**.
2. Go to **Settings** -> **Secrets and variables** -> **Actions** -> **Variables**.
3. Click **New repository variable** (or edit if existing):
   - Name: `ENABLE_SUPABASE_AUTO_RESTORE`
   - Value: `true`
4. Click **Save**.

When both conditions (`ENABLE_SUPABASE_AUTO_RESTORE=true` and `SUPABASE_RESTORE_TOKEN` present) hold:
- If Supabase reports status `INACTIVE`:
  1. The workflow issues `POST https://api.supabase.com/v1/projects/{ref}/restore`.
  2. The workflow polls status every 30 seconds for up to 15 minutes.
  3. Once status transitions to `ACTIVE_HEALTHY`, it executes the `/grid?limit=1` database check to confirm full recovery.

> [!CAUTION]
> **Coarse Status vs. Webhook Reason Limitation**:
> `GET /v1/projects/{ref}` returns only a coarse status string (`INACTIVE`) and does **not** disclose why the project was paused. Supabase's `v1.project.paused` webhook event includes a granular `reason` field (`inactivity`, `api_request`, or `other`), but status polling cannot distinguish between an automated inactivity pause and an intentional developer/admin pause via dashboard or API.
>
> If `ENABLE_SUPABASE_AUTO_RESTORE=true` is enabled, the workflow will attempt to restore the project regardless of whether it was paused due to inactivity or intentionally paused by a developer for maintenance or cost management. Keep `ENABLE_SUPABASE_AUTO_RESTORE=false` by default to avoid unintended restorations.

---

## 4. Manual Workflow Execution (`workflow_dispatch`)

> [!IMPORTANT]
> **Default Branch Prerequisite (Official GitHub Requirement):**
> Per [official GitHub Actions documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_dispatch), a workflow file defining `workflow_dispatch` **must exist on the repository's default branch (`main`)** before GitHub will display the workflow in the Actions tab or show the manual **Run workflow** button.
>
> If this workflow is currently only on a development branch, it cannot be manually triggered through the UI or API yet. Once merged into `main` (and after the workflow has run at least once), GitHub will allow you to manually dispatch it against any branch or tag via the web interface, the REST API, or the GitHub CLI (`gh workflow run`).

Once the workflow is merged to `main`:

1. In GitHub, navigate to the **Actions** tab of the repository.
2. In the left sidebar under **Workflows**, select **Supabase Health Monitor and Recovery**.
3. Click the **Run workflow** dropdown button on the right.
4. Select the target branch (e.g. `main` or another branch containing the workflow).
5. Click **Run workflow**.

---

## 5. Interpreting Workflow Runs and Project Statuses

The workflow explicitly categorizes and handles all 15 official Supabase Management API project statuses:

| Supabase Status | Classification | Workflow Handling | Does it Restore? |
| :--- | :--- | :--- | :---: |
| `ACTIVE_HEALTHY` | Healthy | Bypasses restoration; proceeds directly to GeoShield live database read. | **NO** |
| `ACTIVE_UNHEALTHY` | Degraded Active | Emits a warning that services are degraded; proceeds to test database read. | **NO** |
| `COMING_UP` | Transient Transition | In-flight startup; polls every 30s until `ACTIVE_HEALTHY` (up to 15m). | **NO** |
| `RESTARTING` | Transient Transition | In-flight restart; polls every 30s until `ACTIVE_HEALTHY` (up to 15m). | **NO** |
| `RESTORING` | Transient Transition | In-flight restoration; polls every 30s until `ACTIVE_HEALTHY` (up to 15m). | **NO** |
| `UPGRADING` | Transient Transition | In-flight maintenance; polls every 30s until `ACTIVE_HEALTHY` (up to 15m). | **NO** |
| `RESIZING` | Transient Transition | In-flight compute resize; polls every 30s until `ACTIVE_HEALTHY` (up to 15m). | **NO** |
| `PAUSING` | Transient Transition | In-flight pause; polls until settled into `INACTIVE` or aborts safely. | **NO** |
| `GOING_DOWN` | Transient Transition | In-flight shutdown; polls until settled into `INACTIVE` or aborts safely. | **NO** |
| `INACTIVE` | Paused | Evaluates auto-restore gates. Only calls `POST /restore` if BOTH `ENABLE_SUPABASE_AUTO_RESTORE=true` AND `SUPABASE_RESTORE_TOKEN` is set. Otherwise logs manual unpause requirement and exits 1. | **ONLY IF GATED** |
| `RESTORE_FAILED` | Terminal / Failure | Emits an error; aborts immediately to avoid thrashing. Manual dashboard action needed. | **NO** |
| `PAUSE_FAILED` | Terminal / Failure | Emits an error; aborts immediately without attempting operations. | **NO** |
| `INIT_FAILED` | Terminal / Failure | Emits an error; project initialization failed. Manual action needed. | **NO** |
| `REMOVED` | Terminal / Failure | Emits an error; project deleted. Aborts immediately. | **NO** |
| `UNKNOWN` | Terminal / Failure | Emits an error; unknown state. Fails safely without attempting operations. | **NO** |

---

## 6. Known Limitations & Operational Considerations

### 1. Default Branch Requirement for Scheduled and Dispatched Workflows
- **Scheduled Trigger (`schedule`):** GitHub Actions scheduled cron workflows (`schedule: - cron: '...'`) **only trigger automatically if the workflow file exists on the repository's default branch (`main`)**. Scheduled triggers on non-default branches are ignored by GitHub's scheduler.
- **Manual Trigger (`workflow_dispatch`):** The workflow file **must exist on the repository's default branch** before the manual **Run workflow** button appears in the GitHub Actions UI or the `workflow_dispatch` event can be triggered via API. Only after the workflow is on the default branch (and has run at least once) does GitHub allow dispatching against other branches or tags.

### 2. GitHub Scheduled Workflow Delays & Inactivity Cutoff
- **Schedule Jitter:** GitHub Actions scheduled cron triggers do not guarantee execution at the exact minute. During peak GitHub Actions load, jobs may be queued with 15–45 minutes of jitter. The `17 */4 * * *` schedule was selected at minute 17 to avoid top-of-the-hour congestion.
- **60-Day Inactivity Auto-Disable:** GitHub automatically disables scheduled workflows on repositories that have had no git commits for 60 consecutive days. If disabled, a maintainer must visit the Actions tab and click **Enable workflow**.

### 3. Supabase Free Tier Inactivity Pausing Behavior
- Supabase automatically pauses free-tier database instances when inactivity is detected (historically ~7 consecutive days without API/database interaction).
- **No Guarantee SLA:** While Supabase documentation states that a few daily database requests are typically sufficient to keep a project active, this inactivity threshold is not a guaranteed contractual SLA.
- Scheduled workflow failures, skipped runs due to GitHub downtime, or platform-side policy updates can still result in a paused project. For mission-critical zero-pause guarantees, an upgrade to Supabase Pro is required.
- The workflow generates recurring real database queries every 4 hours, which mitigates inactivity in normal operation, while the conditional auto-recovery logic provides automated remediation if a pause occurs.

### 4. Render Free Tier Spin-Down
- Render free backend instances spin down after 15 minutes of inactivity.
- First requests after spin-down experience a 30–60 second cold-start delay.
- GeoShield's verification client incorporates bounded retries (up to 15 attempts with 8-second intervals, ~2 minutes total) to allow Render to wake up before reporting failure.

### 5. Status-Only Monitoring vs. Webhook Pause Reason Limitations
- **Coarse Status via Management API:** The workflow queries `GET https://api.supabase.com/v1/projects/{ref}`, which returns coarse project statuses (`ACTIVE_HEALTHY`, `INACTIVE`, etc.). It does not report *why* a project entered that status.
- **Webhook Reason Contrast:** Supabase's event webhooks (specifically the `v1.project.paused` event) provide a granular `reason` payload:
  - `inactivity`: The project was paused due to lack of API/database traffic.
  - `api_request`: The project was paused explicitly via a Management API call.
  - `other`: The project was paused manually via the Supabase Dashboard by an admin or team member.
- **Inability to Distinguish Intentional Pauses:** Because the GitHub Actions polling workflow does not receive real-time webhooks, it cannot determine whether an `INACTIVE` status was caused by inactivity or an intentional manual pause by a developer.
- **Safety Default:** Therefore, `ENABLE_SUPABASE_AUTO_RESTORE` is set to `false` by default so that GeoShield never overrides an intentional manual pause without explicit maintainer opt-in.
