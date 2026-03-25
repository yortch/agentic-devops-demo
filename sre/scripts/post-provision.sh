#!/bin/bash
# =============================================================================
# post-provision.sh — Configure the SRE Agent after azd up
#
# Uses data plane REST APIs (no srectl dependency):
#   - Uploads knowledge base files
#   - Creates subagents via data plane v2 API
#   - Creates scheduled tasks via data plane v1 API
#   - Enables Azure Monitor incident platform
#   - Creates incident response plan
#   - Creates GitHub OAuth connector (optional)
#
# Usage:
#   bash scripts/post-provision.sh               # Full setup
#   bash scripts/post-provision.sh --retry        # Skip to agent config
#   bash scripts/post-provision.sh --status       # Show current status
#
# Source: Adapted from microsoft/sre-agent labs/starter-lab/scripts/post-provision.sh
# =============================================================================
set -uo pipefail

# jq detection
if ! command -v jq &>/dev/null; then
  echo "❌ ERROR: jq not found. Install jq (https://jqlang.github.io/jq/download/)."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

# Parse flags
RETRY_MODE=""
STATUS_ONLY=""
for arg in "$@"; do
  case "$arg" in
    --retry)       RETRY_MODE="true" ;;
    --status)      STATUS_ONLY="true" ;;
  esac
done

# ── Read azd outputs ─────────────────────────────────────────────────────────
AGENT_ENDPOINT=$(azd env get-value SRE_AGENT_ENDPOINT 2>/dev/null || echo "")
AGENT_NAME=$(azd env get-value SRE_AGENT_NAME 2>/dev/null || echo "")
RESOURCE_GROUP=$(azd env get-value AZURE_RESOURCE_GROUP 2>/dev/null || echo "")
APP_RESOURCE_GROUP=$(azd env get-value APP_RESOURCE_GROUP 2>/dev/null || echo "")
SUBSCRIPTION_ID=$(az account show --query id -o tsv 2>/dev/null || echo "")

AGENT_RESOURCE_ID="/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RESOURCE_GROUP}/providers/Microsoft.App/agents/${AGENT_NAME}"
API_VERSION="2025-05-01-preview"

# GitHub repo — override via GITHUB_REPO env var or azd env
GITHUB_REPO="${GITHUB_REPO:-$(azd env get-value GITHUB_REPO 2>/dev/null || echo "")}"
if [ -z "$GITHUB_REPO" ]; then
  GITHUB_REPO="yortch/agentic-devops-demo"
fi
export GITHUB_REPO

# ── Status mode ──────────────────────────────────────────────────────────────
if [ -n "${STATUS_ONLY:-}" ]; then
  echo ""
  echo "============================================="
  echo "  SRE Agent — Status"
  echo "============================================="
  echo ""
  echo "  🤖 Agent Portal:  https://sre.azure.com"
  echo "  📡 Agent API:     ${AGENT_ENDPOINT:-not set}"
  echo "  📦 SRE RG:        ${RESOURCE_GROUP:-not set}"
  echo "  📦 App RG:        ${APP_RESOURCE_GROUP:-not set}"
  echo "  🔗 GitHub Repo:   ${GITHUB_REPO}"
  echo ""
  echo "============================================="
  exit 0
fi

if [ -z "$AGENT_ENDPOINT" ] || [ -z "$AGENT_NAME" ]; then
  echo "❌ ERROR: Could not read agent details from azd environment."
  echo "   Run 'azd up' first, then re-run this script."
  exit 1
fi

echo ""
echo "============================================="
echo "  SRE Agent — Post-Provision Setup"
echo "============================================="
echo ""
echo "📡 Agent:     ${AGENT_ENDPOINT}"
echo "📦 SRE RG:    ${RESOURCE_GROUP}"
echo "📦 App RG:    ${APP_RESOURCE_GROUP}"
echo "🔗 GitHub:    ${GITHUB_REPO}"
echo ""

# ── Helper: Get bearer token ─────────────────────────────────────────────────
get_token() {
  az account get-access-token --resource https://azuresre.dev --query accessToken -o tsv 2>/dev/null
}

# ── Helper: Convert subagent YAML to API JSON (no Python needed) ─────────────
# Reads the fixed YAML structure and builds the v2 API JSON body using jq.
yaml_to_api_json() {
  local yaml_file="$1"
  local content
  content=$(cat "$yaml_file")

  # Extract fields using simple text parsing (structure is fixed/known)
  local name system_prompt handoff_desc
  name=$(echo "$content" | sed -n 's/^  name: *//p' | head -1)
  handoff_desc=$(echo "$content" | sed -n 's/^  handoff_description: *//p' | head -1)

  # Extract multi-line system_prompt (indented block after "system_prompt: |")
  system_prompt=$(echo "$content" | sed -n '/^  system_prompt: |/,/^  [a-z_]*:/{ /^  system_prompt:/d; /^  [a-z_]*:/d; p; }' | sed 's/^    //')

  # Substitute GITHUB_REPO_PLACEHOLDER
  system_prompt=$(echo "$system_prompt" | sed "s|GITHUB_REPO_PLACEHOLDER|${GITHUB_REPO}|g")
  handoff_desc=$(echo "$handoff_desc" | sed "s|GITHUB_REPO_PLACEHOLDER|${GITHUB_REPO}|g")

  # Extract tools list (lines starting with "    - " after "tools:")
  local tools_json
  tools_json=$(echo "$content" | sed -n '/^  tools:/,/^  [a-z_]*:\|^$/{ /^    - /p; }' | sed 's/^    - //' | jq -R . | jq -s .)

  # Build API JSON body
  jq -n \
    --arg name "$name" \
    --arg instructions "$system_prompt" \
    --arg handoff "$handoff_desc" \
    --argjson tools "$tools_json" \
    '{
      name: $name,
      type: "ExtendedAgent",
      tags: [],
      owner: "",
      properties: {
        instructions: $instructions,
        handoffDescription: $handoff,
        handoffs: [],
        tools: $tools,
        mcpTools: [],
        allowParallelToolCalls: true,
        enableSkills: true
      }
    }'
}

# ── Helper: Create subagent via data plane v2 API ────────────────────────────
create_subagent() {
  local yaml_file="$1"
  local agent_name="$2"

  local json_body
  json_body=$(yaml_to_api_json "$yaml_file" 2>&1)

  if [ -z "$json_body" ] || ! echo "$json_body" | jq . &>/dev/null; then
    echo "   ⚠️  ${agent_name}: YAML conversion failed"
    echo "   $json_body" | head -3
    return
  fi

  local token
  token=$(get_token)
  local http_code
  http_code=$(echo "$json_body" | curl -s -o /dev/null -w "%{http_code}" \
    -X PUT "${AGENT_ENDPOINT}/api/v2/extendedAgent/agents/${agent_name}" \
    -H "Authorization: Bearer ${token}" \
    -H "Content-Type: application/json" \
    -d @-)

  if [ "$http_code" = "200" ] || [ "$http_code" = "201" ] || [ "$http_code" = "204" ]; then
    echo "   ✅ Created: ${agent_name}"
  else
    echo "   ⚠️  ${agent_name} returned HTTP ${http_code}"
  fi
}

# ── Helper: Create scheduled task via data plane v1 API ──────────────────────
# Reads a task YAML file (kind: ScheduledTask), builds JSON, and POSTs to the
# scheduledtasks API. Deletes any existing task with the same name first.
# Reference: microsoft/sre-agent samples/hands-on-lab/scripts/post-provision.sh
create_scheduled_task() {
  local yaml_file="$1"
  local content
  content=$(cat "$yaml_file")

  # Extract fields from the fixed YAML structure
  local task_name description cron_expr agent_name agent_prompt
  task_name=$(echo "$content" | sed -n 's/^  name: *//p' | head -1)
  description=$(echo "$content" | sed -n 's/^  description: *//p' | head -1)
  cron_expr=$(echo "$content" | sed -n 's/^  cronExpression: *"\{0,1\}\([^"]*\)"\{0,1\}/\1/p' | head -1)
  agent_name=$(echo "$content" | sed -n 's/^  agent: *"\{0,1\}\([^"]*\)"\{0,1\}/\1/p' | head -1)

  # Extract multi-line agentPrompt (indented block after "agentPrompt: |")
  agent_prompt=$(echo "$content" | sed -n '/^  agentPrompt: |/,/^  [a-z_]*:\|^$/{ /^  agentPrompt:/d; /^  [a-z_]*:/d; /^$/d; p; }' | sed 's/^    //')

  if [ -z "$task_name" ] || [ -z "$cron_expr" ] || [ -z "$agent_prompt" ]; then
    echo "   ⚠️  Could not parse task YAML: ${yaml_file}"
    return
  fi

  local token
  token=$(get_token)

  # Delete any existing task with the same name to avoid duplicates
  EXISTING_TASKS=$(curl -s "${AGENT_ENDPOINT}/api/v1/scheduledtasks" \
    -H "Authorization: Bearer ${token}" 2>/dev/null || echo "[]")
  echo "$EXISTING_TASKS" | jq -r ".[] | select(.name==\"${task_name}\") | .id // empty" 2>/dev/null | while read -r task_id; do
    if [ -n "$task_id" ]; then
      curl -s -o /dev/null -X DELETE \
        "${AGENT_ENDPOINT}/api/v1/scheduledtasks/${task_id}" \
        -H "Authorization: Bearer ${token}" 2>/dev/null
    fi
  done

  # Build the JSON body
  local json_body
  json_body=$(jq -n \
    --arg name "$task_name" \
    --arg desc "$description" \
    --arg cron "$cron_expr" \
    --arg prompt "$agent_prompt" \
    --arg agent "$agent_name" \
    '{
      name: $name,
      description: $desc,
      cronExpression: $cron,
      agentPrompt: $prompt
    } + (if $agent != "" then {agent: $agent} else {} end)')

  local http_code
  http_code=$(echo "$json_body" | curl -s -o /dev/null -w "%{http_code}" \
    -X POST "${AGENT_ENDPOINT}/api/v1/scheduledtasks" \
    -H "Authorization: Bearer ${token}" \
    -H "Content-Type: application/json" \
    -d @-)

  if [ "$http_code" = "200" ] || [ "$http_code" = "201" ] || [ "$http_code" = "202" ]; then
    echo "   ✅ Scheduled: ${task_name} (${cron_expr})"
  else
    echo "   ⚠️  ${task_name} returned HTTP ${http_code}"
  fi
}

# ── Step 1: Upload knowledge base ────────────────────────────────────────────
echo "📚 Step 1/5: Uploading knowledge base..."
TOKEN=$(get_token)

CURL_ARGS=(-s -o /dev/null -w "%{http_code}" \
  -X POST "${AGENT_ENDPOINT}/api/v1/AgentMemory/upload" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "triggerIndexing=true")
KB_NAMES=""
for f in ./knowledge-base/*.md; do
  CURL_ARGS+=(-F "files=@${f};type=text/plain")
  KB_NAMES="${KB_NAMES} $(basename "$f")"
done

HTTP_CODE=$(curl "${CURL_ARGS[@]}")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo "   ✅ Uploaded:${KB_NAMES}"
else
  echo "   ⚠️  Upload returned HTTP ${HTTP_CODE}"
fi
echo ""

# ── Step 2: Create subagents ─────────────────────────────────────────────────
echo "🤖 Step 2/5: Creating subagents..."
create_subagent "sre-config/agents/incident-handler.yaml" "incident-handler"
create_subagent "sre-config/agents/code-analyzer.yaml" "code-analyzer"
echo ""

# ── Step 3: Create scheduled tasks ──────────────────────────────────────────
echo "⏰ Step 3/5: Creating scheduled tasks..."
for f in ./sre-config/tasks/*.yaml; do
  [ -f "$f" ] && create_scheduled_task "$f"
done
echo ""

# ── Step 4: Enable Azure Monitor + create response plan ─────────────────────
echo "🚨 Step 4/5: Enabling Azure Monitor incident platform..."

if az rest --method PATCH \
  --url "https://management.azure.com${AGENT_RESOURCE_ID}?api-version=${API_VERSION}" \
  --body '{"properties":{"incidentManagementConfiguration":{"type":"AzMonitor","connectionName":"azmonitor"},"experimentalSettings":{"EnableWorkspaceTools":true,"EnableDevOpsTools":true,"EnablePythonTools":true}}}' \
  --output none 2>&1; then
  echo "   ✅ Azure Monitor enabled + DevOps & Python tools enabled"
else
  echo "   ⚠️  Could not enable Azure Monitor"
fi

# Wait for Azure Monitor to initialize
echo "   Waiting for Azure Monitor to initialize (30s)..."
sleep 30

# Delete any existing filters from previous runs
TOKEN=$(get_token)
curl -s -o /dev/null -X DELETE \
  "${AGENT_ENDPOINT}/api/v1/incidentPlayground/filters/three-rivers-http-errors" \
  -H "Authorization: Bearer ${TOKEN}" 2>/dev/null || true

# Create response plan with retry
FILTER_CREATED=false
for attempt in 1 2 3 4 5; do
  TOKEN=$(get_token)
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X PUT "${AGENT_ENDPOINT}/api/v1/incidentPlayground/filters/three-rivers-http-errors" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    --data-binary '{
      "id": "three-rivers-http-errors",
      "name": "Three Rivers Bank HTTP Errors",
      "priorities": ["Sev0","Sev1","Sev2","Sev3","Sev4"],
      "titleContains": "",
      "handlingAgent": "incident-handler",
      "agentMode": "autonomous",
      "maxAttempts": 3
    }')

  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "409" ]; then
    echo "   ✅ Response plan → incident-handler"
    FILTER_CREATED=true
    break
  else
    echo "   ⏳ Attempt $attempt/5: HTTP ${HTTP_CODE}, retrying in 15s..."
    sleep 15
  fi
done

if [ "$FILTER_CREATED" = "false" ]; then
  echo "   ⚠️  Response plan failed after 5 attempts — run: bash scripts/post-provision.sh --retry"
fi

# Delete default quickstart handler (auto-created by Azure Monitor)
TOKEN=$(get_token)
curl -s -o /dev/null -X DELETE \
  "${AGENT_ENDPOINT}/api/v1/incidentPlayground/filters/quickstart_response_plan" \
  -H "Authorization: Bearer ${TOKEN}" 2>/dev/null || true

echo ""

# ── Step 5: GitHub OAuth connector + knowledge source ────────────────────────
echo "🔗 Step 5/5: GitHub integration..."

# Create GitHub OAuth connector (data plane)
TOKEN=$(get_token)
RESULT=$(curl -s -o /dev/null -w "%{http_code}" \
  -X PUT "${AGENT_ENDPOINT}/api/v2/extendedAgent/connectors/github" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name":"github","type":"AgentConnector","properties":{"dataConnectorType":"GitHubOAuth","dataSource":"github-oauth"}}')
if [ "$RESULT" = "200" ] || [ "$RESULT" = "201" ]; then
  echo "   ✅ GitHub OAuth connector (data plane)"
else
  echo "   ⚠️  GitHub connector returned HTTP ${RESULT}"
fi

# Also create via ARM (needed for OAuth flow)
az rest --method PUT \
  --url "https://management.azure.com${AGENT_RESOURCE_ID}/DataConnectors/github?api-version=${API_VERSION}" \
  --body '{"properties":{"dataConnectorType":"GitHubOAuth","dataSource":"github-oauth"}}' \
  -o none 2>&1 || true
echo "   ✅ GitHub OAuth connector (ARM)"

# Get OAuth URL for user authorization
TOKEN=$(get_token)
OAUTH_URL=$(curl -s "${AGENT_ENDPOINT}/api/v1/github/config" \
  -H "Authorization: Bearer ${TOKEN}" 2>/dev/null | jq -r '.oAuthUrl // .OAuthUrl // empty' 2>/dev/null)

if [ -n "$OAUTH_URL" ]; then
  echo ""
  echo "  ┌──────────────────────────────────────────────────────────┐"
  echo "  │  Sign in to GitHub to authorize the SRE Agent:          │"
  echo "  │  ${OAUTH_URL}"
  echo "  │  Open this URL in your browser and click 'Authorize'    │"
  echo "  └──────────────────────────────────────────────────────────┘"
  echo ""
  read -p "   Press Enter after you have authorized in the browser..." _unused
fi

# Add code repo AFTER OAuth so the GitHub token is active
echo "   Adding ${GITHUB_REPO} as knowledge source..."
TOKEN=$(get_token)
REPO_NAME=$(echo "$GITHUB_REPO" | cut -d'/' -f2)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X PUT "${AGENT_ENDPOINT}/api/v2/repos/${REPO_NAME}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"${REPO_NAME}\",\"type\":\"CodeRepo\",\"properties\":{\"url\":\"https://github.com/${GITHUB_REPO}\",\"authConnectorName\":\"github\"}}")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo "   ✅ Code repo: ${GITHUB_REPO}"
else
  echo "   ⚠️  Code repo returned HTTP ${HTTP_CODE} (authorize GitHub OAuth first, then re-run with --retry)"
fi

echo ""
echo "============================================="
echo "  ✅ SRE Agent Setup Complete!"
echo "============================================="
echo ""
echo "  🤖 Agent Portal:  https://sre.azure.com"
echo "  📡 Agent API:     ${AGENT_ENDPOINT}"
echo "  📦 App RG:        ${APP_RESOURCE_GROUP}"
echo "  🔗 GitHub Repo:   ${GITHUB_REPO}"
echo ""

echo "  Next steps:"
echo "  ├── Open https://sre.azure.com and verify green checkmarks"
echo "  ├── Ask the agent: 'List all container apps in my resource group'"
echo "  └── Run chaos scenario: bash sre/scripts/chaos-engineering.sh backend-500"
echo ""
echo "============================================="
