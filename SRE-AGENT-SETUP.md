# Azure SRE Agent Setup Guide — Three Rivers Bank Demo

> **Goal**: Deploy Azure SRE Agent to monitor the Three Rivers Bank application (backend + frontend on Azure Container Apps), connect to GitHub for code-aware root cause analysis, and enable the full agentic loop: **detect → diagnose → create issue → auto-fix**.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Deploy the Application](#2-deploy-the-application)  
3. [Deploy the SRE Agent](#3-deploy-the-sre-agent)
4. [Configure the SRE Agent (Post-Provision)](#4-configure-the-sre-agent-post-provision)
5. [Verify Setup](#5-verify-setup)
6. [Enable Copilot Coding Agent Auto-Fix](#6-enable-copilot-coding-agent-auto-fix)
7. [Chaos Engineering Scenarios](#7-chaos-engineering-scenarios)
8. [Demo Walkthrough](#8-demo-walkthrough)
9. [Troubleshooting](#9-troubleshooting)
10. [Reference Links](#10-reference-links)

---

## 1. Prerequisites

### Azure Requirements

| Requirement | Details |
|---|---|
| **Azure Subscription** | Active subscription with billing enabled |
| **Owner Role** | Required on the subscription for RBAC role assignments |
| **SRE Agent Region** | `eastus2`, `swedencentral`, or `australiaeast` |
| **Resource Provider** | `Microsoft.App` registered: `az provider register -n Microsoft.App --wait` |
| **Deployed Application** | Three Rivers Bank backend + frontend on Azure Container Apps (see Section 2) |

### Tools Required

| Tool | Install |
|---|---|
| **Azure CLI** 2.60+ | `winget install Microsoft.AzureCLI` |
| **Azure Developer CLI** 1.9+ | `winget install Microsoft.Azd` |
| **jq** | `winget install jqlang.jq` |
| **Git** | `winget install Git.Git` |
| **gh CLI** *(optional)* | `winget install GitHub.cli` |

### GitHub Requirements

| Requirement | Details |
|---|---|
| **Repository Access** | Push access to `agentic-devops-demo` repository |
| **Copilot License** | GitHub Copilot Enterprise or Business (for Copilot Coding Agent) |
| **Actions PR Permission** | "Allow GitHub Actions to create and approve pull requests" (see below) |

#### Enable GitHub Actions PR Creation

```bash
gh api repos/<owner>/<repo>/actions/permissions/workflow \
  -X PUT \
  -f default_workflow_permissions=read \
  -F can_approve_pull_request_reviews=true
```

Or via UI: **Settings → Actions → General → Workflow permissions** → check **"Allow GitHub Actions to create and approve pull requests"**.

---

## 2. Deploy the Application

The application is deployed from the **repository root** using the existing Terraform infrastructure:

```bash
# From the repository root
az login
azd auth login
azd up
```

After deployment, export the required environment variables for the SRE Agent:

```bash
# Get the app resource group name from the deployment
APP_RESOURCE_GROUP=$(azd env get-value AZURE_RESOURCE_GROUP)
echo "App Resource Group: $APP_RESOURCE_GROUP"
```

> **Note**: The application deployment creates the backend/frontend Container Apps, Container Registry, Log Analytics Workspace, and Container App Environment. The SRE Agent deployment (next section) creates only the agent itself in a **separate** resource group.

---

## 3. Deploy the SRE Agent

The SRE Agent is deployed from the `sre/` directory using its own `azd` project with Bicep infrastructure.

### What Gets Deployed

| Resource | Type | Purpose |
|---|---|---|
| SRE Agent | `Microsoft.App/agents` | AI agent for incident investigation |
| User-Assigned Managed Identity | `Microsoft.ManagedIdentity` | Agent identity for Azure access |
| Action Group | `Microsoft.Insights/actionGroups` | Alert notification target |
| Alert: HTTP 5xx Spike | `Microsoft.Insights/metricAlerts` | Severity 2 — backend error rate |
| Alert: Container Restart | `Microsoft.Insights/metricAlerts` | Severity 1 — OOM/crash detection |
| Alert: High Response Time | `Microsoft.Insights/metricAlerts` | Severity 3 — latency monitoring |

### RBAC Roles Assigned (Subscription Scope)

| Role | Purpose |
|---|---|
| Reader | Agent can read all resources |
| Monitoring Reader | Agent can read metrics and alerts |
| Monitoring Contributor | Agent can manage alert rules |
| Log Analytics Reader | Agent can query logs via KQL |
| Container Apps Contributor | Agent can manage container apps |

### Deploy

```bash
# Navigate to the SRE directory
cd sre

# Create a new azd environment
azd env new sre-three-rivers

# Set the application resource group (from Step 2)
azd env set APP_RESOURCE_GROUP "$APP_RESOURCE_GROUP"

# Deploy — select your subscription and eastus2 as region
azd up
```

Deployment takes ~3-5 minutes. The output will include:
- `SRE_AGENT_NAME` — the agent resource name
- `SRE_AGENT_ENDPOINT` — the agent's data plane API URL
- `AGENT_PORTAL_URL` — link to https://sre.azure.com

---

## 4. Configure the SRE Agent (Post-Provision)

After `azd up` completes, run the post-provision script to configure knowledge base, subagents, incident response plan, and GitHub integration:

```bash
# Still in the sre/ directory
bash scripts/post-provision.sh
```

### What the Script Configures

| Step | Component | Method |
|---|---|---|
| 1 | **Knowledge Base** — HTTP errors runbook + app architecture docs | Data plane API: `POST /api/v1/AgentMemory/upload` |
| 2 | **Subagents** — `incident-handler` + `code-analyzer` | Data plane API: `PUT /api/v2/extendedAgent/agents/{name}` |
| 3 | **Azure Monitor** — Incident platform + response plan routing to `incident-handler` | ARM PATCH + data plane API |
| 4 | **GitHub OAuth** — Connector for code search and issue creation | Data plane + ARM API |

### GitHub Authorization (One-Time)

The script will print a GitHub OAuth URL at the end:

```
┌──────────────────────────────────────────────────────────────┐
│  Sign in to GitHub to authorize the SRE Agent:               │
│  https://...                                                 │
│  Open this URL in your browser and click 'Authorize'         │
└──────────────────────────────────────────────────────────────┘
```

Open this URL in your browser and authorize the agent. This is a **one-time** step.

### Re-running the Script

```bash
# Re-run if any step failed
bash scripts/post-provision.sh --retry

# Check current status
bash scripts/post-provision.sh --status
```

### Customizing the GitHub Repository

By default, the script uses `yortch/agentic-devops-demo`. To use a different repo:

```bash
azd env set GITHUB_REPO "<owner>/<repo>"
bash scripts/post-provision.sh
```

---

## 5. Verify Setup

### 5.1 Check the Portal

Open [sre.azure.com](https://sre.azure.com) and click **Full setup**. You should see green checkmarks on:

| Card | Expected Status |
|---|---|
| **Code** | ✅ 1 repository |
| **Incidents** | ✅ Connected to Azure Monitor |
| **Azure resources** | ✅ 1 resource group added |
| **Knowledge files** | ✅ 2 files |

### 5.2 Test the Agent

In the agent chat, ask verification questions:

```text
What subscriptions and resource groups are you managing?
```

```text
List all container apps in the monitored resource groups.
```

```text
What is the health status of the Three Rivers Bank backend container app?
```

### 5.3 Verify Alerts

```bash
# From the sre/ directory or anywhere with az login
az monitor metrics alert list \
  --resource-group "$(azd env get-value AZURE_RESOURCE_GROUP)" \
  --query "[].{Name:name, Severity:severity, Enabled:enabled}" \
  --output table
```

---

## 6. Enable Copilot Coding Agent Auto-Fix

### 6.1 Create Required Labels

```bash
gh label create "copilot:fix-this" \
  --description "Issues for Copilot Coding Agent to auto-fix" \
  --color "7057ff"

gh label create "sre-agent-detected" \
  --description "Issue detected by Azure SRE Agent" \
  --color "d73a4a"

gh label create "chaos-engineering" \
  --description "Issue introduced by chaos engineering workflow" \
  --color "fbca04"
```

### 6.2 Enable Copilot Coding Agent

1. Go to **Settings → General → Features** → ensure **Copilot** is enabled.
2. Enable **Copilot Coding Agent** under Copilot settings.

### 6.3 How It Works

When the SRE Agent creates an issue with the `copilot:fix-this` label:
1. Copilot Coding Agent is automatically assigned to the issue
2. Copilot reads the issue (including RCA and affected code)
3. Copilot creates a fix PR
4. You review and merge

---

## 7. Chaos Engineering Scenarios

The chaos engineering workflow uses [GitHub Agentic Workflows](https://github.com/github/gh-aw) to inject code-level breaking changes via PR.

### Available Scenarios

| # | Scenario | Target | Symptoms |
|---|---|---|---|
| 1 | `port-mismatch` | Backend | 503 errors, health check fails |
| 2 | `bad-api-url` | Backend | BIAN API fails, degraded data |
| 3 | `cors-broken` | Backend | Browser CORS errors, blank pages |
| 4 | `low-resources` | Backend | OOM kills, restarts, slow responses |
| 5 | `health-check-disabled` | Backend | Health probes fail, restart loop |
| 6 | `bad-image-tag` | Backend | Image pull fails, container stuck |
| 7 | `db-corruption` | Backend | Spring Boot fails, all 500 errors |
| 8 | `profile-wrong` | Backend | Wrong profile, behavioral drift |
| 9 | `circuit-breaker-disabled` | Backend | Requests hang, thread exhaustion |
| 10 | `frontend-api-broken` | Frontend | API calls fail, no card data |
| 11 | `backend-500` | Backend | GET /api/cards returns 500, NPE |
| 12 | `backend-image-tag` | Backend | Image pull fails, 503 |
| 13 | `backend-slow-response` | Backend | GET /api/cards takes 0–9s |

### Install gh-aw

```bash
gh extension install github/gh-aw
```

### Trigger via GitHub Issue

Create an issue with the `chaos-engineering` label to specify a scenario:

```bash
gh issue create \
  --title "chaos: backend-slow-response" \
  --body "Inject backend-slow-response scenario to test SRE Agent detection" \
  --label "chaos-engineering"
```

Then trigger the workflow:

```bash
gh workflow run chaos-engineering.lock.yml
```

The agentic workflow will:
1. Find the open issue with `chaos-engineering` label
2. Extract the scenario from the issue title
3. Apply the code-level breaking change
4. Create a PR with the `chaos` prefix

If no matching issue is found, a random scenario is selected.

---

## 8. Demo Walkthrough

```
┌─────────────────────────────────────────────────────┐
│  1. Introduce Chaos                                 │
│     └─ gh issue create → gh workflow run            │
│                                                     │
│  2. Breaking Change Takes Effect                    │
│     └─ CI/CD deploys broken code from PR            │
│                                                     │
│  3. SRE Agent Detects Issue                         │
│     └─ Alert fires → agent investigates             │
│     └─ Agent queries logs + code                    │
│                                                     │
│  4. RCA + GitHub Issue Created                      │
│     └─ Labels: copilot:fix-this, sre-agent-detected │
│                                                     │
│  5. Copilot Coding Agent Fixes                      │
│     └─ Reads issue → creates fix PR                 │
│                                                     │
│  6. Fix Deployed + Health Restored                  │
└─────────────────────────────────────────────────────┘
```

### Before the Demo

1. Verify app is healthy:
   ```bash
   curl https://{backend-fqdn}/actuator/health
   curl https://{frontend-fqdn}/
   ```

2. Open these windows:
   - **Azure Portal** → SRE Agent chat ([sre.azure.com](https://sre.azure.com))
   - **GitHub** → Repository issues tab
   - **Terminal** → Ready to trigger chaos

### During the Demo

**Part 1: Show Healthy App** (~2 min)
- Open Three Rivers Bank website, show card comparison working
- In SRE Agent chat: *"What is the current health of my container apps?"*

**Part 2: Introduce Chaos** (~1 min)
```bash
gh issue create \
  --title "chaos: backend-slow-response" \
  --body "Inject backend-slow-response scenario" \
  --label "chaos-engineering"
gh workflow run chaos-engineering.lock.yml
```
- Wait for the PR to be created and merged

**Part 3: Wait for Detection** (~3-5 min)
- Azure Monitor alert fires → SRE Agent investigates automatically
- Or ask manually: *"Check the health of the Three Rivers Bank backend. Is anything wrong?"*

**Part 4: Show RCA + Issue** (~2 min)
- The agent creates a GitHub issue with root cause, code references, and fix suggestion
- Show the issue with `copilot:fix-this` label

**Part 5: Copilot Fixes** (~2-3 min)
- Copilot Coding Agent picks up the issue → creates fix PR
- Review and merge

**Part 6: Recovery** (~1 min)
- CI/CD deploys fix → verify app healthy again
- SRE Agent confirms: *"Is the application healthy now?"*

---

## 9. Troubleshooting

| Problem | Solution |
|---|---|
| `azd up` fails in `sre/` | Ensure `APP_RESOURCE_GROUP` is set: `azd env set APP_RESOURCE_GROUP <name>` |
| `Microsoft.App not registered` | Run: `az provider register -n Microsoft.App --wait` |
| Post-provision script fails on response plan | Wait 30s and run: `bash scripts/post-provision.sh --retry` |
| SRE Agent can't see Container Apps | Verify `APP_RESOURCE_GROUP` matches your app deployment's resource group |
| GitHub OAuth URL not shown | Check SRE Agent Administrator role is assigned (script does this automatically) |
| GitHub connector shows disconnected | Re-run `bash scripts/post-provision.sh --retry` and re-authorize OAuth URL |
| Copilot doesn't pick up issues | Verify `copilot:fix-this` label exists and Copilot Coding Agent is enabled |
| Alert rules not firing | Check alerts: `az monitor metrics alert list --resource-group $(azd env get-value AZURE_RESOURCE_GROUP)` |
| `roleAssignments/write` denied | Need **Owner** role on subscription |

---

## 10. Reference Links

| Resource | URL |
|---|---|
| **Azure SRE Agent Overview** | https://learn.microsoft.com/en-us/azure/sre-agent/overview |
| **SRE Agent Portal** | https://sre.azure.com |
| **SRE Agent Lab (GitHub)** | https://github.com/microsoft/sre-agent/tree/main/labs/starter-lab |
| **Data Plane API Reference (post-provision.sh)** | https://github.com/microsoft/sre-agent/blob/main/labs/starter-lab/scripts/post-provision.sh |
| **Connect Source Code** | https://learn.microsoft.com/en-us/azure/sre-agent/connect-source-code |
| **Connectors** | https://learn.microsoft.com/en-us/azure/sre-agent/connectors |
| **Incident Response** | https://learn.microsoft.com/en-us/azure/sre-agent/incident-response |
| **GitHub Copilot Coding Agent** | https://docs.github.com/en/copilot/using-github-copilot/using-copilot-coding-agent |

---

## Appendix: Directory Structure

```
sre/
├── azure.yaml                          # azd project config
├── infra/
│   ├── main.bicep                      # Entry point (subscription scope)
│   ├── resources.bicep                 # Resource orchestration
│   └── modules/
│       ├── sre-agent.bicep             # SRE Agent resource
│       ├── identity.bicep              # Managed Identity
│       ├── subscription-rbac.bicep     # RBAC role assignments
│       └── alert-rules.bicep           # Azure Monitor alerts (3 rules)
├── scripts/
│   ├── post-provision.sh               # Configures KB, subagents, response plan, GitHub
│   └── yaml-to-api-json.py             # YAML → API JSON converter
├── sre-config/
│   └── agents/
│       ├── incident-handler.yaml       # Investigates incidents, creates GitHub issues
│       └── code-analyzer.yaml          # Deep code root cause analysis
└── knowledge-base/
    ├── http-500-errors.md              # HTTP error investigation runbook
    └── app-architecture.md             # Application architecture reference
```
