# Azure SRE Agent Setup Guide — Three Rivers Bank Demo

> **Goal**: Set up Azure SRE Agent to monitor the deployed Three Rivers Bank application (backend + frontend on Azure Container Apps), connect it to your GitHub repository for code-aware root cause analysis, and enable the full agentic loop: **detect → diagnose → create issue → auto-fix**.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Create the Azure SRE Agent](#2-create-the-azure-sre-agent)
3. [Connect Your GitHub Repository](#3-connect-your-github-repository)
4. [Configure a GitHub Subagent for Issue Creation](#4-configure-a-github-subagent-for-issue-creation)
5. [Set Up Scheduled Proactive Diagnostics](#5-set-up-scheduled-proactive-diagnostics)
6. [Configure Incident Response Plan](#6-configure-incident-response-plan)
7. [Enable Copilot Coding Agent Auto-Fix](#7-enable-copilot-coding-agent-auto-fix)
8. [Chaos Engineering Scenarios](#8-chaos-engineering-scenarios)
9. [Demo Walkthrough](#9-demo-walkthrough)
10. [Troubleshooting](#10-troubleshooting)
11. [Reference Links](#11-reference-links)

---

## 1. Prerequisites

### Azure Requirements

| Requirement | Details |
|---|---|
| **Azure Subscription** | Active subscription with billing enabled |
| **RBAC Permissions** | `Microsoft.Authorization/roleAssignments/write` — requires **Role Based Access Control Administrator** or **User Access Administrator** |
| **Firewall Allowlist** | Add `*.azuresre.ai` to your network allowlist |
| **Deployed Application** | Three Rivers Bank backend + frontend deployed to Azure Container Apps (see [README-AZURE-DEPLOYMENT.md](README-AZURE-DEPLOYMENT.md)) |

### GitHub Requirements

| Requirement | Details |
|---|---|
| **Repository Access** | Push access to `agentic-devops-demo` repository |
| **GitHub PAT** | Personal Access Token with `repo` scope (for GitHub MCP connector) |
| **Copilot License** | GitHub Copilot Enterprise or Business (for Copilot Coding Agent) |
| **Actions PR Permission** | "Allow GitHub Actions to create and approve pull requests" must be enabled (see below) |

#### Enable GitHub Actions PR Creation

The chaos engineering agentic workflow creates PRs via GitHub Actions. By default, the
`GITHUB_TOKEN` is **not** permitted to create pull requests. Enable it with:

```bash
gh api repos/<owner>/<repo>/actions/permissions/workflow \
  -X PUT \
  -f default_workflow_permissions=read \
  -F can_approve_pull_request_reviews=true
```

Or via the UI: **Settings → Actions → General → Workflow permissions** → check
**"Allow GitHub Actions to create and approve pull requests"**.
| **az CLI** | Azure CLI installed and logged in (`az login`) |
| **gh CLI + gh-aw** | *(Optional — for Option B)* GitHub CLI with `gh-aw` extension installed ([install guide](https://github.github.com/gh-aw/setup/quick-start/)) |
| **COPILOT_GITHUB_TOKEN** | *(Optional — for Option B)* GitHub Actions secret for Copilot-powered agentic workflows (see [Section 8B](#option-b-agentic-workflow-code-level-chaos)) |

### Deployed Resources to Monitor

After running `azd up`, your resource group should contain:

| Resource | Type | Purpose |
|---|---|---|
| `{env}-backend` | Container App | Spring Boot API server |
| `{env}-frontend` | Container App | React/Nginx static site |
| Container App Environment | Environment | Shared networking & logging |
| Log Analytics Workspace | Monitoring | Container logs & metrics |
| Azure Container Registry | Registry | Docker image storage |

> **Note**: Replace `{env}` with your azd environment name (e.g., `banking-demo`).

---

## 2. Create the Azure SRE Agent

### Step 2.1: Open Azure SRE Agent Portal

1. Sign in to the [Azure Portal](https://portal.azure.com).
2. Search for **Azure SRE Agent** in the search bar, or navigate directly to [https://aka.ms/sreagent/portal](https://aka.ms/sreagent/portal).
3. Click **Create**.

### Step 2.2: Configure the Agent

Fill in the **Create agent** form:

**Project Details:**

| Property | Value |
|---|---|
| **Subscription** | Select your Azure subscription |
| **Resource group** | Create new: `rg-sre-agent-threeriversbank` |

> ⚠️ Create a **separate** resource group for the SRE Agent — do not put it in the same resource group as your application.

**Agent Details:**

| Property | Value |
|---|---|
| **Agent name** | `three-rivers-bank-sre` |
| **Region** | `East US 2` (currently the recommended region) |

### Step 2.3: Link Your Application Resource Group

1. Click **Choose resource groups**.
2. Search for your application resource group (the one created by `azd up`, e.g., `banking-demo-{suffix}`).
3. Check the box next to it — a ✅ checkmark indicates Container Apps have specialized support.
4. Click **Save**.

### Step 2.4: Deploy

1. Click **Create**.
2. Wait for the deployment to complete (~2-3 minutes).
3. Click **Chat with agent** once deployment succeeds.

### Step 2.5: Verify the Agent

In the chat window, ask these verification questions:

```text
What subscriptions and resource groups are you managing?
```

```text
List all container apps in the monitored resource groups.
```

```text
What is the health status of the three-rivers-bank backend container app?
```

The agent should identify your backend and frontend Container Apps and report their health.

> **Resources auto-created**: When you create the agent, Azure automatically provisions Application Insights, a Log Analytics workspace, and a Managed Identity for the agent.

---

## 3. Connect Your GitHub Repository

Connecting source code enables the SRE Agent to perform **code-aware root cause analysis** — correlating production errors to specific files and line numbers.

### Option A: Resource Mapping (Recommended for this demo)

This approach links the repository directly to your Container App resources.

1. In your SRE Agent, select **Monitor** in the left sidebar.
2. Select **Resource mapping**.
3. Find the `{env}-backend` Container App.
4. Click on it to open the detail view.
5. Click **Add repository**.
6. Paste your repository URL: `https://github.com/{your-org}/agentic-devops-demo`
7. Sign in to GitHub if prompted.
8. Click **Add**.
9. **Repeat** for the `{env}-frontend` Container App.

### Option B: GitHub MCP Connector (Full repo access + issue creation)

This approach provides full GitHub integration including the ability to create issues.

#### Add the GitHub MCP Connector

1. Select **Builder** in the left sidebar.
2. Select **Connectors**.
3. Click **Add connector**.
4. Select **GitHub MCP server**.
5. Configure:

| Field | Value |
|---|---|
| **Name** | `github-three-rivers` |
| **Connection type** | Streamable-HTTP |
| **URL** | `https://api.githubcopilot.com/mcp/` |
| **Authentication method** | Bearer token |
| **Personal access token** | Your GitHub PAT with `repo` scope |

6. Click **Next** → **Add connector**.
7. Wait for status to show **Connected** (green checkmark).

> 💡 **Recommendation**: Use **both Option A and Option B** together. Option A gives the agent automatic code context during investigations. Option B enables issue creation and advanced GitHub operations.

---

## 4. Configure a GitHub Subagent for Issue Creation

The SRE Agent needs a subagent to create GitHub issues from its investigations.

### Step 4.1: Create the Issue Creator Subagent

1. Select **Builder** → **Subagent builder**.
2. Click **Create subagent**.
3. Configure:

| Field | Value |
|---|---|
| **Name** | `github-issue-creator` |
| **Description** | Creates GitHub issues with root cause analysis for the Three Rivers Bank application |

4. In the **Instructions** field, paste:

```text
You create GitHub issues in the agentic-devops-demo repository when production 
problems are detected. Each issue should include:

1. A clear title describing the problem (e.g., "Backend: Container app failing health checks due to port mismatch")
2. Root cause analysis with evidence (logs, metrics, code references)
3. The specific files and lines involved
4. A recommended fix
5. The label "copilot:fix-this" to trigger automatic remediation by GitHub Copilot Coding Agent

Format the issue body using this template:

## Problem
[Description of the production issue detected]

## Evidence
- **Symptoms**: [What was observed — errors, timeouts, failures]
- **Metrics**: [Relevant metrics data]
- **Logs**: [Key log entries]

## Root Cause Analysis
[Detailed analysis of what went wrong]

## Affected Code
- File: `[path/to/file]`
- Lines: [line numbers]
- Change: [What was changed and when]

## Recommended Fix
[Specific code changes needed to resolve the issue]

## SRE Agent Investigation
- **Agent**: three-rivers-bank-sre
- **Detected**: [timestamp]
- **Severity**: [Critical/High/Medium/Low]
```

5. In the **Tools** section, select these GitHub MCP tools:
   - `github-three-rivers_create_issue` (or the equivalent `create_issue` tool)
   - `github-three-rivers_search_code`
   - `github-three-rivers_get_file_contents`
   - `github-three-rivers_list_commits`
   
   Or use the wildcard: `github-three-rivers/*`

6. Click **Save**.

### Step 4.2: Create a Code Analyst Subagent

1. Create another subagent:

| Field | Value |
|---|---|
| **Name** | `code-analyst` |
| **Description** | Analyzes source code for root cause analysis in the Three Rivers Bank repo |
| **Instructions** | (see below) |

```text
You analyze the agentic-devops-demo GitHub repository to find root causes of 
production issues. When given symptoms (errors, metrics anomalies), you:

1. Search the codebase for relevant code patterns
2. Check recent commits for suspicious changes
3. Identify the specific file and line causing the issue
4. Provide detailed root cause analysis

Key areas to check:
- Backend: backend/src/main/java/com/threeriversbank/ (Spring Boot app)
- Frontend: frontend/src/ (React app)
- Infrastructure: infra/terraform/ (Terraform configs)
- Docker: docker/ (Dockerfiles)
- Config: backend/src/main/resources/application.yml
```

2. Add the same GitHub MCP tools (or wildcard `github-three-rivers/*`).
3. Click **Save**.

---

## 5. Set Up Scheduled Proactive Diagnostics

Scheduled tasks let the SRE Agent automatically check your application health on a recurring basis.

### Task 1: Container App Health Check (Every 15 minutes)

1. In your SRE Agent, select the **Schedule tasks** tab.
2. Click **Create scheduled task**.
3. Configure:

| Field | Value |
|---|---|
| **Task name** | `Three Rivers Bank Health Check` |
| **Schedule** | Every 15 minutes |

4. In the **Instructions** field:

```text
Perform a comprehensive health check of the Three Rivers Bank application:

1. Check the backend container app health:
   - Query the /actuator/health endpoint status
   - Check container restart count (alert if > 0 in last 15 min)
   - Verify HTTP 2xx success rate (alert if < 95%)
   - Check response time p95 (alert if > 2 seconds)
   - Verify memory and CPU utilization

2. Check the frontend container app health:
   - Verify the app is serving responses
   - Check HTTP error rates
   - Verify the frontend can reach the backend API

3. Check infrastructure health:
   - Container App Environment status
   - Log Analytics workspace connectivity
   - Container Registry availability

4. If ANY issues are detected:
   - Use the code-analyst subagent to check for recent code changes that may have caused the issue
   - Use the github-issue-creator subagent to create a GitHub issue with the label "copilot:fix-this"
   - Include full root cause analysis in the issue
```

5. Click **Create scheduled task**.

### Task 2: Daily Reliability Report (Every day at 8 AM)

```text
Generate a daily reliability report for the Three Rivers Bank application:

1. Summarize the past 24 hours:
   - Total request count (backend + frontend)
   - Error rate trend
   - Average and p95 response times
   - Container restart events
   - Scaling events (replicas changes)

2. Check for degradation trends:
   - Is error rate increasing over the past 7 days?
   - Are response times trending upward?
   - Any recurring container restarts?

3. Review recent deployments:
   - Check GitHub for merged PRs in the last 24 hours
   - Correlate any deployments with metric changes

4. Provide recommendations for improving reliability.
```

### Task 3: Configuration Drift Detection (Every 6 hours)

```text
Check for configuration drift in the Three Rivers Bank deployment:

1. Verify environment variables match expected values:
   - BIAN_API_BASE_URL should be: https://virtserver.swaggerhub.com/B154/BIAN/CreditCard/13.0.0
   - SPRING_PROFILES_ACTIVE should be: production
   - SPRING_H2_CONSOLE_ENABLED should be: false

2. Verify container resource limits:
   - Backend: 0.5 vCPU, 1GB memory
   - Frontend: 0.25 vCPU, 0.5GB memory

3. Check container image versions match latest deployment

4. If drift is detected, create a GitHub issue with details and recommended fixes.
```

---

## 6. Configure Incident Response Plan

Set up automatic incident handling when Azure Monitor detects problems.

### Step 6.1: Enable Azure Monitor Alerts Integration

The SRE Agent connects to Azure Monitor Alerts by default. Verify this:

1. Select the **Incident management** tab in your SRE Agent.
2. Confirm **Azure Monitor** is listed as the incident platform.

### Step 6.2: Create Alert Rules

Create an action group and three alert rules using the Azure CLI. The SRE Agent automatically
picks up Azure Monitor alerts from monitored resource groups — no extra wiring is needed.

> **Substitute** `{SUBSCRIPTION_ID}`, `{RESOURCE_GROUP}`, `{BACKEND_APP}`, and
> `{CONTAINER_ENV}` with your actual values (or set them as shell variables first).

#### Set variables

```bash
# ── Customize these ──────────────────────────────────────────────
SUB="<your-subscription-id>"
RG="<your-resource-group>"               # e.g. rg-banking-demo
BACKEND="<your-backend-container-app>"    # e.g. ca-banking-demo-backend
ENV_NAME="<your-container-app-env>"       # e.g. banking-demo-cae
# ─────────────────────────────────────────────────────────────────

BACKEND_SCOPE="/subscriptions/$SUB/resourceGroups/$RG/providers/Microsoft.App/containerapps/$BACKEND"
ENV_SCOPE="/subscriptions/$SUB/resourceGroups/$RG/providers/Microsoft.App/managedEnvironments/$ENV_NAME"
```

#### Create the Action Group

```bash
az monitor action-group create \
  --name "sre-agent-action-group" \
  --resource-group "$RG" \
  --subscription "$SUB" \
  --short-name "SREAgent" \
  --output table
```

```bash
ACTION_GROUP=$(az monitor action-group show \
  --name "sre-agent-action-group" \
  --resource-group "$RG" \
  --subscription "$SUB" \
  --query id -o tsv)
```

> **Tip**: If you later add a webhook, email, or Logic App to this action group, the SRE
> Agent will receive richer context automatically.

#### Alert 1 — Backend 5xx Error Rate Spike

Fires when the backend receives **more than 5 HTTP 5xx responses in a 5-minute window**.

| Property | Value |
|---|---|
| **Metric** | `Requests` (total) |
| **Dimension** | `statusCodeCategory` includes `5xx` |
| **Threshold** | > 5 |
| **Window** | 5 minutes |
| **Evaluation** | Every 1 minute |
| **Severity** | 2 (Warning) |

```bash
az monitor metrics alert create \
  --name "backend-5xx-error-spike" \
  --resource-group "$RG" \
  --subscription "$SUB" \
  --scopes "$BACKEND_SCOPE" \
  --condition "total Requests > 5 where statusCodeCategory includes 5xx" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --severity 2 \
  --description "Backend HTTP 5xx errors exceeded threshold. Investigate for bad deployments, misconfiguration, or upstream failures." \
  --action "$ACTION_GROUP" \
  --tags application=three-rivers-bank component=backend alert-type=error-rate
```

#### Alert 2 — Container App Restart

Fires when **any replica restart** is detected in the Container App Environment (severity 1 — Error).

| Property | Value |
|---|---|
| **Metric** | `RestartCount` |
| **Aggregation** | Total |
| **Threshold** | > 0 |
| **Window** | 5 minutes |
| **Evaluation** | Every 1 minute |
| **Severity** | 1 (Error) |

```bash
az monitor metrics alert create \
  --name "container-restart-detected" \
  --resource-group "$RG" \
  --subscription "$SUB" \
  --scopes "$BACKEND_SCOPE" \
  --condition "total RestartCount > 0" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --severity 1 \
  --description "Container app replica restarted. Likely cause: OOM kill, crash loop, or failed health probe." \
  --action "$ACTION_GROUP" \
  --tags application=three-rivers-bank component=backend alert-type=restart
```

#### Alert 3 — High Response Time

Fires when the **average response time exceeds 3 seconds** over a 5-minute window.

| Property | Value |
|---|---|
| **Metric** | `ResponseTime` (Average, in milliseconds) |
| **Threshold** | > 3000 ms |
| **Window** | 5 minutes |
| **Evaluation** | Every 1 minute |
| **Severity** | 3 (Informational) |

```bash
az monitor metrics alert create \
  --name "backend-high-response-time" \
  --resource-group "$RG" \
  --subscription "$SUB" \
  --scopes "$BACKEND_SCOPE" \
  --condition "avg ResponseTime > 3000" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --severity 3 \
  --description "Backend p95 response time elevated. May indicate resource starvation, circuit breaker issues, or slow external API." \
  --action "$ACTION_GROUP" \
  --tags application=three-rivers-bank component=backend alert-type=latency
```

#### Verify the alerts

```bash
az monitor metrics alert list \
  --resource-group "$RG" \
  --subscription "$SUB" \
  --query "[].{Name:name, Severity:severity, Enabled:enabled, Window:windowSize}" \
  --output table
```

Expected output:

```
Name                          Severity  Enabled  Window
----------------------------  --------  -------  ------
backend-5xx-error-spike       2         True     PT5M
container-restart-detected    1         True     PT5M
backend-high-response-time    3         True     PT5M
```

### Step 6.3: Create Incident Response Plan

In the SRE Agent, create an incident response plan:

```text
When an incident is received for the Three Rivers Bank application:

1. ACKNOWLEDGE the incident immediately.

2. GATHER CONTEXT:
   - Query Azure Monitor for error details
   - Check container logs for exceptions
   - Review Application Insights for request traces
   - Check recent GitHub commits for code changes

3. PERFORM ROOT CAUSE ANALYSIS:
   - Use the code-analyst subagent to search the repository for the error
   - Identify the specific code file and line causing the issue
   - Determine if this was caused by a recent deployment

4. CREATE A GITHUB ISSUE:
   - Use the github-issue-creator subagent
   - Include full RCA with code references
   - Add the label "copilot:fix-this"
   - Add the label "sre-agent-detected"

5. ATTEMPT AUTOMATED MITIGATION (if safe):
   - If the issue is a bad deployment: suggest rollback
   - If the issue is resource exhaustion: suggest scaling
   - Always request approval before taking action

6. NOTIFY:
   - Post investigation summary
   - Include link to the created GitHub issue
```

---

## 7. Enable Copilot Coding Agent Auto-Fix

### Step 7.1: Repository Settings

1. Go to your repository **Settings** → **General** → **Features**.
2. Ensure **Copilot** is enabled (requires Copilot Enterprise or Business).
3. Enable **Copilot Coding Agent** under the Copilot settings.

### Step 7.2: Create the `copilot:fix-this` Label

The label signals to Copilot Coding Agent that an issue needs automated fixing.

```bash
gh label create "copilot:fix-this" \
  --description "Issues for Copilot Coding Agent to auto-fix" \
  --color "7057ff"
```

Also create supporting labels:

```bash
gh label create "sre-agent-detected" \
  --description "Issue detected by Azure SRE Agent" \
  --color "d73a4a"

gh label create "chaos-engineering" \
  --description "Issue introduced by chaos engineering workflow" \
  --color "fbca04"
```

### Step 7.3: Configure Copilot Coding Agent

When the SRE Agent creates an issue with the `copilot:fix-this` label:

1. **Assign Copilot** to the issue (can be done in the SRE Agent's issue creation instructions or manually).
2. Copilot Coding Agent will:
   - Read the issue description (including RCA and affected code)
   - Analyze the repository
   - Create a fix PR
   - Request review

### Step 7.4: Auto-Assignment (Optional)

You can configure a GitHub Actions workflow to auto-assign issues with the `copilot:fix-this` label:

```yaml
# .github/workflows/auto-assign-copilot.yml
name: Auto-assign Copilot to SRE Issues
on:
  issues:
    types: [labeled]

jobs:
  assign:
    if: github.event.label.name == 'copilot:fix-this'
    runs-on: ubuntu-latest
    permissions:
      issues: write
    steps:
      - name: Assign Copilot
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.issues.addAssignees({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              assignees: ['copilot']
            });
```

---

## 8. Chaos Engineering Scenarios

Two methods are available for injecting chaos. Choose the one that fits your demo:

| | Option A: az CLI Script | Option B: Agentic Workflow |
|---|---|---|
| **How it works** | Modifies live Azure Container App config directly | Creates a PR with a code-level breaking change |
| **Best for** | Quick infra-level faults (env vars, ports, resources) | Demonstrating SRE Agent detecting bad *code commits* |
| **Prerequisites** | `az login` | `gh-aw` CLI + `COPILOT_GITHUB_TOKEN` secret |
| **Rollback** | `./chaos-engineering.sh rollback <scenario>` | Revert the PR |

Both options cover the same 10 scenarios:

| # | Scenario | Target | Difficulty | Symptoms |
|---|---|---|---|---|
| 1 | `port-mismatch` | Backend | Medium | 503 errors, health check fails |
| 2 | `bad-api-url` | Backend | Easy | BIAN API fails, degraded data |
| 3 | `cors-broken` | Backend | Medium | Browser CORS errors, blank pages |
| 4 | `low-resources` | Backend | Easy | OOM kills, restarts, slow responses |
| 5 | `health-check-disabled` | Backend | Medium | Health probes fail, restart loop |
| 6 | `bad-image-tag` | Backend | Easy | Image pull fails, container stuck |
| 7 | `db-corruption` | Backend | Hard | Spring Boot fails, all 500 errors |
| 8 | `profile-wrong` | Backend | Medium | Wrong profile, behavioral drift |
| 9 | `circuit-breaker-disabled` | Backend | Hard | Requests hang, thread exhaustion |
| 10 | `frontend-api-broken` | Frontend | Easy | API calls fail, no card data |
| 11 | `backend-500` | Backend | Easy | GET /api/cards returns 500, NPE in service |

---

### Option A: az CLI Script (Infrastructure-Level Chaos)

Modifies live Azure configuration instantly — no CI/CD pipeline involved.

#### A.1: Set Environment Variables

The script auto-detects values from `azd env`. Alternatively, export manually:

```bash
export AZURE_RESOURCE_GROUP="<your-resource-group>"       # e.g. rg-banking-demo
export AZURE_BACKEND_APP="<your-backend-container-app>"   # e.g. ca-banking-demo-backend
export AZURE_FRONTEND_APP="<your-frontend-container-app>" # e.g. ca-banking-demo-frontend
```

#### A.2: Inject a Fault

```bash
./chaos-engineering.sh bad-api-url
```

#### A.3: Roll Back

```bash
./chaos-engineering.sh rollback bad-api-url
```

#### A.4: Other Commands

```bash
./chaos-engineering.sh list     # show all scenarios
./chaos-engineering.sh status   # show current app configuration
```

#### A.5: Troubleshooting

| Problem | Solution |
|---|---|
| `az` not found | Install Azure CLI: `brew install azure-cli` or `winget install Microsoft.AzureCLI` |
| Permission denied on script | Run `chmod +x chaos-engineering.sh` |
| "not logged in" error | Run `az login` first |
| Revision fails to deploy | Check logs: `az containerapp logs show --name <app> --resource-group <rg>` |
| Rollback doesn't fix it | Check `./chaos-engineering.sh status` and compare against expected values in Section 5 Task 3 |

---

### Option B: Agentic Workflow (Code-Level Chaos)

Creates a PR with a realistic code-level breaking change via GitHub Agentic Workflows (`gh-aw`). This is ideal for demonstrating the SRE Agent detecting an issue introduced by a *code commit*, and having Copilot Coding Agent fix it via PR.

#### B.1: Install the gh-aw CLI Extension

```bash
gh extension install github/gh-aw
gh aw --version   # verify installation
```

#### B.2: Create a Fine-Grained PAT for Copilot

1. Open the **pre-filled token creation link**:
   [Create COPILOT_GITHUB_TOKEN PAT](https://github.com/settings/personal-access-tokens/new?name=COPILOT_GITHUB_TOKEN&description=GitHub+Agentic+Workflows+-+Copilot+engine+authentication&user_copilot_requests=read)

2. Verify these settings before generating:
   - **Resource owner**: Your **personal user account** (not an organization)
   - **Permissions → Account permissions**: `Copilot Requests` set to **Read**
   - No repository permissions are needed

3. Click **Generate token** and copy the value immediately.

#### B.3: Add the Secret to Your Repository

```bash
# Option 1 — gh-aw CLI (recommended)
gh aw secrets set COPILOT_GITHUB_TOKEN --value "<your-github-pat>"

# Option 2 — standard gh CLI
gh secret set COPILOT_GITHUB_TOKEN --body "<your-github-pat>"
```

#### B.4: Compile the Workflow

The `.md` file is the source of truth. The compiled `.lock.yml` is what GitHub Actions runs:

```bash
gh aw compile .github/workflows/chaos-engineering.md
```

> **Important**: Always commit both the `.md` source and the `.lock.yml` together.

#### B.5: Trigger the Workflow

First, create a GitHub issue with the `chaos-engineering` label specifying which scenario
to inject. The workflow reads open issues with this label and extracts the scenario name
from the issue title:

```bash
# Create an issue requesting a specific chaos scenario
gh issue create \
  --title "chaos-engineering: port-mismatch" \
  --body "Inject the port-mismatch chaos scenario for SRE Agent demo." \
  --label "chaos-engineering"
```

Valid scenario names for the title: `port-mismatch`, `bad-api-url`, `cors-broken`,
`low-resources`, `health-check-disabled`, `bad-image-tag`, `db-corruption`,
`profile-wrong`, `circuit-breaker-disabled`, `frontend-api-broken`, `backend-500`.

> **Note**: If no open issue with a valid scenario is found, the workflow picks one at
> random (avoiding scenarios that already have open PRs).

Then trigger the workflow:

```bash
gh aw run chaos-engineering
```

Monitor the run:

```bash
gh run list --workflow=chaos-engineering.lock.yml --limit 1
gh run watch
```

#### B.6: Troubleshooting

| Problem | Solution |
|---|---|
| Workflow fails at Copilot inference step | Verify the PAT owner has an **active Copilot license** |
| Secret not found error | Confirm secret name is exactly `COPILOT_GITHUB_TOKEN`. Run `gh aw secrets bootstrap` |
| `gh aw compile` fails | Ensure `.md` is in `.github/workflows/` with valid frontmatter |
| Workflow creates empty PR | Agent may have hit a rate limit — check Actions logs |
| "not permitted to create pull requests" | Enable PR creation: **Settings → Actions → General → Workflow permissions** → check "Allow GitHub Actions to create and approve pull requests". Or run: `gh api repos/<owner>/<repo>/actions/permissions/workflow -X PUT -f default_workflow_permissions=read -F can_approve_pull_request_reviews=true` |

---

## 9. Demo Walkthrough

### The Full Demo Loop

```
┌─────────────────────────────────────────────────────┐
│                    DEMO FLOW                         │
│                                                     │
│  1. Introduce Chaos (pick one)                      │
│     ├─ Option A: ./chaos-engineering.sh <scenario>  │
│     │  (modifies live Azure config directly)        │
│     └─ Option B: gh workflow run chaos-engineering   │
│        (creates PR with code-level break)           │
│                                                     │
│  2. Breaking Change Takes Effect                    │
│     ├─ A: Container App deploys new revision        │
│     └─ B: CI/CD deploys broken code from PR         │
│                                                     │
│  3. SRE Agent Detects Issue                         │
│     └─ Scheduled task or alert fires                │
│     └─ Agent investigates using logs + code         │
│                                                     │
│  4. RCA + GitHub Issue Created                      │
│     └─ Agent creates issue with full analysis       │
│     └─ Labels: copilot:fix-this, sre-agent-detected │
│                                                     │
│  5. Copilot Coding Agent Fixes                      │
│     └─ Reads issue, analyzes code, creates fix PR   │
│                                                     │
│  6. Fix Deployed                                    │
│     └─ CI/CD pipeline deploys the fix               │
│     └─ SRE Agent confirms health restored           │
└─────────────────────────────────────────────────────┘
```

### Step-by-Step Demo Script

#### Before the Demo

1. Verify application is healthy:
   ```bash
   curl https://{backend-fqdn}/actuator/health
   curl https://{frontend-fqdn}/
   ```

2. Open these windows:
   - **Azure Portal** → SRE Agent chat
   - **GitHub** → Repository issues tab
   - **Terminal** → Ready to trigger the chaos workflow

#### During the Demo

**Part 1: Show the Healthy Application** (~2 min)
1. Open the Three Rivers Bank website in a browser.
2. Show the card comparison page working normally.
3. In SRE Agent chat, ask: *"What is the current health of my container apps?"*
4. Show the healthy response.

**Part 2: Introduce Chaos** (~1 min)

*Option A — az CLI (instant infra change):*
1. Inject a chaos scenario:
   ```bash
   ./chaos-engineering.sh bad-api-url
   ```
2. Show the revision being deployed:
   ```bash
   az containerapp revision list --name "$AZURE_BACKEND_APP" --resource-group "$AZURE_RESOURCE_GROUP" -o table
   ```

*Option B — Agentic Workflow (code commit via PR):*
1. Trigger the chaos engineering workflow:
   ```bash
   gh workflow run chaos-engineering.lock.yml -f scenario=bad-api-url
   ```
2. Show the workflow running in the GitHub Actions tab.
3. Show the PR it creates with the breaking change.
4. Merge the PR to deploy the break via CI/CD.

**Part 3: Wait for Detection** (~3-5 min)
1. The CD pipeline deploys the broken code.
2. Either wait for the scheduled health check, or in SRE Agent chat, ask:
   ```text
   Check the health of the Three Rivers Bank backend. Is anything wrong?
   ```
3. The SRE Agent investigates, finds the issue, and performs RCA.

**Part 4: Show the RCA and Issue Creation** (~2 min)
1. Ask the SRE Agent:
   ```text
   Create a GitHub issue with your findings and label it "copilot:fix-this".
   ```
2. Switch to GitHub and show the newly created issue.
3. Highlight the RCA details, code references, and recommended fix.

**Part 5: Copilot Fixes the Issue** (~2-3 min)
1. Assign `@copilot` to the issue (or show auto-assignment).
2. Wait for Copilot Coding Agent to create a fix PR.
3. Show the PR with the corrected code.
4. Merge the fix.

**Part 6: Show Recovery** (~1 min)
1. After CI/CD deploys the fix, verify the app is healthy again.
2. In SRE Agent chat: *"Is the application healthy now?"*
3. Show the positive confirmation.

---

## 10. Troubleshooting

### SRE Agent Can't See My Container Apps

- Verify the application resource group is linked in **Settings** → **Managed resource groups**.
- Ensure the agent's managed identity has at least **Reader** role on the resource group.
- Check that `*.azuresre.ai` is allowlisted in any firewall/NSG rules.

### GitHub Connector Shows Disconnected

- Verify your PAT hasn't expired.
- Test the PAT: `curl -H "Authorization: token YOUR_PAT" https://api.github.com/user`
- Re-create the connector with a fresh PAT if needed.

### SRE Agent Doesn't Find Code Context

- Ensure the repository is linked via Resource Mapping (Option A).
- Verify the MCP connector shows "Connected" status.
- Ask the agent directly: *"Search the agentic-devops-demo repository for application.yml"*

### Copilot Coding Agent Doesn't Pick Up Issues

- Verify the `copilot:fix-this` label exists on the issue.
- Check that Copilot is assigned to the issue.
- Ensure Copilot Coding Agent is enabled in repository settings.
- Verify your GitHub plan includes Copilot Coding Agent access.

### Scheduled Tasks Not Running

- Check the task schedule configuration.
- Verify the agent is online (not in stopped state).
- Review the task execution history in the SRE Agent portal.

---

## 11. Reference Links

| Resource | URL |
|---|---|
| **Azure SRE Agent Overview** | https://learn.microsoft.com/en-us/azure/sre-agent/overview |
| **SRE Agent Portal** | https://aka.ms/sreagent/portal |
| **Create and Use an Agent** | https://learn.microsoft.com/en-us/azure/sre-agent/usage |
| **Connect Source Code** | https://learn.microsoft.com/en-us/azure/sre-agent/connect-source-code |
| **Connectors Setup** | https://learn.microsoft.com/en-us/azure/sre-agent/connectors |
| **Tools Reference** | https://learn.microsoft.com/en-us/azure/sre-agent/tools |
| **Incident Response** | https://learn.microsoft.com/en-us/azure/sre-agent/incident-response |
| **Workflow Automation** | https://learn.microsoft.com/en-us/azure/sre-agent/workflow-automation |
| **Troubleshoot Container Apps Tutorial** | https://learn.microsoft.com/en-us/azure/sre-agent/troubleshoot-azure-container-apps |
| **SRE Agent Samples (GitHub)** | https://github.com/microsoft/sre-agent/tree/main/samples |
| **GitHub Copilot Coding Agent** | https://docs.github.com/en/copilot/using-github-copilot/using-copilot-coding-agent |
