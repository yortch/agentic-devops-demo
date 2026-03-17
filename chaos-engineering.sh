#!/usr/bin/env bash
#
# Chaos Engineering — Three Rivers Bank SRE Demo
#
# Introduces controlled breaking changes to the deployed Azure Container Apps
# via az CLI. Each scenario modifies live Azure configuration so the SRE Agent
# can detect, diagnose, and trigger a fix.
#
# Usage:
#   ./chaos-engineering.sh <scenario>        # inject a specific fault
#   ./chaos-engineering.sh rollback <scenario> # revert a specific fault
#   ./chaos-engineering.sh list              # show available scenarios
#   ./chaos-engineering.sh status            # show current app configuration
#
# Prerequisites:
#   - az CLI logged in (`az login`)
#   - azd environment configured (`azd env select <env>`)
#
set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────
# Source variables from azd env if available, then allow env var overrides.
load_azd_env() {
  if command -v azd &>/dev/null; then
    local azd_vals
    azd_vals=$(azd env get-values 2>/dev/null) || return 0
    # Export each KEY="value" line from azd env into the current shell,
    # but only for the variables we care about (don't pollute the env).
    eval "$(echo "$azd_vals" | grep -E '^(AZURE_SUBSCRIPTION_ID|AZURE_RESOURCE_GROUP|backend_service_name|frontend_service_name)=')"
  fi
}
load_azd_env

SUB="${AZURE_SUBSCRIPTION_ID:-$(az account show --query id -o tsv 2>/dev/null)}"
RG="${AZURE_RESOURCE_GROUP:-}"
BACKEND="${AZURE_BACKEND_APP:-${backend_service_name:-}}"
FRONTEND="${AZURE_FRONTEND_APP:-${frontend_service_name:-}}"

# ── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

info()  { echo -e "${CYAN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
err()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# ── Validation ───────────────────────────────────────────────────────────────
validate_env() {
  local missing=0
  [[ -n "$RG" && -n "$BACKEND" && -n "$FRONTEND" ]] && \
    info "Using: RG=$RG  BACKEND=$BACKEND  FRONTEND=$FRONTEND"
  if [[ -z "$RG" ]]; then
    err "Resource group not resolved. Set AZURE_RESOURCE_GROUP or configure azd env."
    missing=1
  fi
  if [[ -z "$BACKEND" ]]; then
    err "Backend app name not resolved. Set AZURE_BACKEND_APP or configure azd env."
    missing=1
  fi
  if [[ -z "$FRONTEND" ]]; then
    err "Frontend app name not resolved. Set AZURE_FRONTEND_APP or configure azd env."
    missing=1
  fi
  if [[ $missing -eq 1 ]]; then
    echo ""
    info "Auto-detection from azd env failed. Either:"
    info "  1. Run 'azd env select <env>' to set your azd environment, or"
    info "  2. Export the variables manually:"
    info "     export AZURE_RESOURCE_GROUP=rg-banking-demo"
    info "     export AZURE_BACKEND_APP=ca-banking-demo-backend"
    info "     export AZURE_FRONTEND_APP=ca-banking-demo-frontend"
    exit 1
  fi
}

# ── Scenario Implementations ─────────────────────────────────────────────────

# 1. port-mismatch — Change backend ingress target port from 8080 to 8081
inject_port_mismatch() {
  info "Scenario: port-mismatch"
  info "Changing backend target_port from 8080 → 8081"
  info "Expected: Health checks fail, all requests return 503"
  az containerapp ingress update \
    --name "$BACKEND" --resource-group "$RG" --subscription "$SUB" \
    --target-port 8081
  ok "Backend target port changed to 8081"
}

rollback_port_mismatch() {
  info "Rolling back port-mismatch: restoring target_port to 8080"
  az containerapp ingress update \
    --name "$BACKEND" --resource-group "$RG" --subscription "$SUB" \
    --target-port 8080
  ok "Backend target port restored to 8080"
}

# 2. bad-api-url — Set BIAN_API_BASE_URL to an invalid endpoint
inject_bad_api_url() {
  info "Scenario: bad-api-url"
  info "Setting BIAN_API_BASE_URL to invalid endpoint"
  info "Expected: BIAN API calls fail, circuit breaker opens, degraded responses"
  az containerapp update \
    --name "$BACKEND" --resource-group "$RG" --subscription "$SUB" \
    --set-env-vars "BIAN_API_BASE_URL=https://invalid-api.example.com/BIAN/CreditCard/13.0.0"
  ok "BIAN_API_BASE_URL set to invalid URL"
}

rollback_bad_api_url() {
  info "Rolling back bad-api-url: restoring BIAN_API_BASE_URL"
  az containerapp update \
    --name "$BACKEND" --resource-group "$RG" --subscription "$SUB" \
    --set-env-vars "BIAN_API_BASE_URL=https://virtserver.swaggerhub.com/B154/BIAN/CreditCard/13.0.0"
  ok "BIAN_API_BASE_URL restored"
}

# 3. cors-broken — Set CORS_ALLOWED_ORIGINS to a wrong domain
inject_cors_broken() {
  info "Scenario: cors-broken"
  info "Setting CORS_ALLOWED_ORIGINS to wrong domain"
  info "Expected: Browser CORS errors, frontend cannot call backend API"
  az containerapp update \
    --name "$BACKEND" --resource-group "$RG" --subscription "$SUB" \
    --set-env-vars "CORS_ALLOWED_ORIGINS=https://wrong-origin.example.com"
  ok "CORS_ALLOWED_ORIGINS set to wrong domain"
}

rollback_cors_broken() {
  info "Rolling back cors-broken: restoring CORS_ALLOWED_ORIGINS"
  local frontend_fqdn
  frontend_fqdn=$(az containerapp show \
    --name "$FRONTEND" --resource-group "$RG" --subscription "$SUB" \
    --query "properties.configuration.ingress.fqdn" -o tsv)
  az containerapp update \
    --name "$BACKEND" --resource-group "$RG" --subscription "$SUB" \
    --set-env-vars "CORS_ALLOWED_ORIGINS=https://${frontend_fqdn},http://localhost:5173,http://localhost:3000"
  ok "CORS_ALLOWED_ORIGINS restored with frontend FQDN"
}

# 4. low-resources — Reduce backend CPU/memory to cause OOM/starvation
inject_low_resources() {
  info "Scenario: low-resources"
  info "Reducing backend to 0.1 CPU / 0.2Gi memory"
  info "Expected: OOM kills, container restarts, intermittent 503s"
  az containerapp update \
    --name "$BACKEND" --resource-group "$RG" --subscription "$SUB" \
    --cpu 0.1 --memory 0.2Gi
  ok "Backend resources reduced to 0.1 CPU / 0.2Gi memory"
}

rollback_low_resources() {
  info "Rolling back low-resources: restoring 0.5 CPU / 1Gi memory"
  az containerapp update \
    --name "$BACKEND" --resource-group "$RG" --subscription "$SUB" \
    --cpu 0.5 --memory 1Gi
  ok "Backend resources restored to 0.5 CPU / 1Gi memory"
}

# 5. health-check-disabled — Disable the health probe endpoint
inject_health_check_disabled() {
  info "Scenario: health-check-disabled"
  info "Disabling Spring Boot health endpoint via env var"
  info "Expected: Health probes fail, Container Apps marks app unhealthy, restart loop"
  az containerapp update \
    --name "$BACKEND" --resource-group "$RG" --subscription "$SUB" \
    --set-env-vars \
      "MANAGEMENT_ENDPOINT_HEALTH_ENABLED=false" \
      "MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE=info"
  ok "Health endpoint disabled"
}

rollback_health_check_disabled() {
  info "Rolling back health-check-disabled: re-enabling health endpoint"
  az containerapp update \
    --name "$BACKEND" --resource-group "$RG" --subscription "$SUB" \
    --set-env-vars \
      "MANAGEMENT_ENDPOINT_HEALTH_ENABLED=true" \
      "MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE=health,info"
  ok "Health endpoint re-enabled"
}

# 6. bad-image-tag — Update backend container to a non-existent image tag
inject_bad_image_tag() {
  info "Scenario: bad-image-tag"
  info "Setting backend container image to a non-existent tag"
  info "Expected: Image pull fails, container cannot start"
  local current_image
  current_image=$(az containerapp show \
    --name "$BACKEND" --resource-group "$RG" --subscription "$SUB" \
    --query "properties.template.containers[0].image" -o tsv)
  local bad_image="${current_image}-invalid"
  az containerapp update \
    --name "$BACKEND" --resource-group "$RG" --subscription "$SUB" \
    --image "$bad_image"
  ok "Backend image changed to non-existent tag: $bad_image"
  warn "Save original image for rollback: $current_image"
}

rollback_bad_image_tag() {
  info "Rolling back bad-image-tag: You must provide the correct image."
  info "Check your container registry for the correct tag:"
  info "  az containerapp show --name $BACKEND --resource-group $RG --query 'properties.template.containers[0].image' -o tsv"
  info ""
  info "Then run:"
  info "  az containerapp update --name $BACKEND --resource-group $RG --image <correct-image>"
  warn "Cannot auto-rollback without knowing the original image tag."
}

# 7. db-corruption — Set a Spring property that causes data.sql to fail
inject_db_corruption() {
  info "Scenario: db-corruption"
  info "Pointing H2 init script to a non-existent file"
  info "Expected: Spring Boot fails to start, all API calls return 500"
  az containerapp update \
    --name "$BACKEND" --resource-group "$RG" --subscription "$SUB" \
    --set-env-vars "SPRING_SQL_INIT_DATA_LOCATIONS=classpath:nonexistent-data.sql"
  ok "H2 init data location set to non-existent file"
}

rollback_db_corruption() {
  info "Rolling back db-corruption: restoring default data location"
  az containerapp update \
    --name "$BACKEND" --resource-group "$RG" --subscription "$SUB" \
    --set-env-vars "SPRING_SQL_INIT_DATA_LOCATIONS=classpath:data.sql"
  ok "H2 init data location restored"
}

# 8. profile-wrong — Set SPRING_PROFILES_ACTIVE to a non-existent profile
inject_profile_wrong() {
  info "Scenario: profile-wrong"
  info "Setting SPRING_PROFILES_ACTIVE to 'nonexistent-profile'"
  info "Expected: App starts with default profile, H2 console may be exposed, CORS may differ"
  az containerapp update \
    --name "$BACKEND" --resource-group "$RG" --subscription "$SUB" \
    --set-env-vars "SPRING_PROFILES_ACTIVE=nonexistent-profile"
  ok "Spring profile changed to 'nonexistent-profile'"
}

rollback_profile_wrong() {
  info "Rolling back profile-wrong: restoring 'production' profile"
  az containerapp update \
    --name "$BACKEND" --resource-group "$RG" --subscription "$SUB" \
    --set-env-vars "SPRING_PROFILES_ACTIVE=production"
  ok "Spring profile restored to 'production'"
}

# 9. circuit-breaker-disabled — Tune circuit breaker to never open, long timeouts
inject_circuit_breaker_disabled() {
  info "Scenario: circuit-breaker-disabled"
  info "Setting circuit breaker: 100% threshold, 60s timeout, 10 retries"
  info "Expected: Requests hang when BIAN is slow, massive latency, thread exhaustion"
  az containerapp update \
    --name "$BACKEND" --resource-group "$RG" --subscription "$SUB" \
    --set-env-vars \
      "RESILIENCE4J_CIRCUITBREAKER_INSTANCES_BIANAPI_FAILURERATETHRESHOLD=100" \
      "RESILIENCE4J_TIMELIMITER_INSTANCES_BIANAPI_TIMEOUTDURATION=60s" \
      "RESILIENCE4J_RETRY_INSTANCES_BIANAPI_MAXATTEMPTS=10"
  ok "Circuit breaker effectively disabled"
}

rollback_circuit_breaker_disabled() {
  info "Rolling back circuit-breaker-disabled: restoring defaults"
  az containerapp update \
    --name "$BACKEND" --resource-group "$RG" --subscription "$SUB" \
    --set-env-vars \
      "RESILIENCE4J_CIRCUITBREAKER_INSTANCES_BIANAPI_FAILURERATETHRESHOLD=50" \
      "RESILIENCE4J_TIMELIMITER_INSTANCES_BIANAPI_TIMEOUTDURATION=5s" \
      "RESILIENCE4J_RETRY_INSTANCES_BIANAPI_MAXATTEMPTS=3"
  ok "Circuit breaker settings restored"
}

# 10. frontend-api-broken — Point frontend to a non-existent backend URL
inject_frontend_api_broken() {
  info "Scenario: frontend-api-broken"
  info "Setting VITE_API_BASE_URL to non-existent backend"
  info "Expected: Frontend loads but all API calls fail, no card data"
  az containerapp update \
    --name "$FRONTEND" --resource-group "$RG" --subscription "$SUB" \
    --set-env-vars "VITE_API_BASE_URL=https://nonexistent-backend.azurecontainerapps.io/api"
  ok "Frontend API URL pointed to non-existent backend"
}

rollback_frontend_api_broken() {
  info "Rolling back frontend-api-broken: restoring correct backend URL"
  local backend_fqdn
  backend_fqdn=$(az containerapp show \
    --name "$BACKEND" --resource-group "$RG" --subscription "$SUB" \
    --query "properties.configuration.ingress.fqdn" -o tsv)
  az containerapp update \
    --name "$FRONTEND" --resource-group "$RG" --subscription "$SUB" \
    --set-env-vars "VITE_API_BASE_URL=https://${backend_fqdn}/api"
  ok "Frontend API URL restored to https://${backend_fqdn}/api"
}

# ── Commands ─────────────────────────────────────────────────────────────────

show_list() {
  cat <<'EOF'
Chaos Engineering Scenarios — Three Rivers Bank
================================================

  Scenario                   Target       Difficulty  Symptoms
  ─────────────────────────  ───────────  ──────────  ─────────────────────────────
  1. port-mismatch           Backend      Medium      503 errors, health check fails
  2. bad-api-url             Backend      Easy        BIAN API fails, degraded data
  3. cors-broken             Backend      Medium      Browser CORS errors, blank pages
  4. low-resources           Backend      Easy        OOM kills, restarts, slow responses
  5. health-check-disabled   Backend      Medium      Health probes fail, restart loop
  6. bad-image-tag           Backend      Easy        Image pull fails, container stuck
  7. db-corruption           Backend      Hard        Spring Boot fails, all 500 errors
  8. profile-wrong           Backend      Medium      Wrong profile, behavioral drift
  9. circuit-breaker-disabled Backend     Hard        Requests hang, thread exhaustion
 10. frontend-api-broken     Frontend     Easy        API calls fail, no card data

Usage:
  ./chaos-engineering.sh <scenario-name>           # inject fault
  ./chaos-engineering.sh rollback <scenario-name>  # revert fault

Examples:
  ./chaos-engineering.sh bad-api-url
  ./chaos-engineering.sh rollback bad-api-url
EOF
}

show_status() {
  validate_env
  echo ""
  info "=== Backend Container App: $BACKEND ==="
  echo ""
  az containerapp show \
    --name "$BACKEND" --resource-group "$RG" --subscription "$SUB" \
    --query "{
      Name: name,
      TargetPort: properties.configuration.ingress.targetPort,
      FQDN: properties.configuration.ingress.fqdn,
      CPU: properties.template.containers[0].resources.cpu,
      Memory: properties.template.containers[0].resources.memory,
      Image: properties.template.containers[0].image,
      RunningStatus: properties.runningStatus
    }" -o table 2>/dev/null || true

  echo ""
  info "Backend Environment Variables:"
  az containerapp show \
    --name "$BACKEND" --resource-group "$RG" --subscription "$SUB" \
    --query "properties.template.containers[0].env[].{Name: name, Value: value}" \
    -o table 2>/dev/null || true

  echo ""
  info "=== Frontend Container App: $FRONTEND ==="
  echo ""
  az containerapp show \
    --name "$FRONTEND" --resource-group "$RG" --subscription "$SUB" \
    --query "{
      Name: name,
      TargetPort: properties.configuration.ingress.targetPort,
      FQDN: properties.configuration.ingress.fqdn,
      Image: properties.template.containers[0].image
    }" -o table 2>/dev/null || true

  echo ""
  info "Frontend Environment Variables:"
  az containerapp show \
    --name "$FRONTEND" --resource-group "$RG" --subscription "$SUB" \
    --query "properties.template.containers[0].env[].{Name: name, Value: value}" \
    -o table 2>/dev/null || true
}

dispatch_scenario() {
  local prefix="$1"
  local scenario="$2"

  case "$scenario" in
    port-mismatch)           "${prefix}_port_mismatch" ;;
    bad-api-url)             "${prefix}_bad_api_url" ;;
    cors-broken)             "${prefix}_cors_broken" ;;
    low-resources)           "${prefix}_low_resources" ;;
    health-check-disabled)   "${prefix}_health_check_disabled" ;;
    bad-image-tag)           "${prefix}_bad_image_tag" ;;
    db-corruption)           "${prefix}_db_corruption" ;;
    profile-wrong)           "${prefix}_profile_wrong" ;;
    circuit-breaker-disabled) "${prefix}_circuit_breaker_disabled" ;;
    frontend-api-broken)     "${prefix}_frontend_api_broken" ;;
    *)
      err "Unknown scenario: $scenario"
      echo ""
      show_list
      exit 1
      ;;
  esac
}

# ── Main ─────────────────────────────────────────────────────────────────────

main() {
  if [[ $# -eq 0 ]]; then
    show_list
    exit 0
  fi

  case "$1" in
    list|--list|-l)
      show_list
      ;;
    status|--status|-s)
      show_status
      ;;
    rollback|revert|--rollback|-r)
      if [[ $# -lt 2 ]]; then
        err "Usage: $0 rollback <scenario-name>"
        exit 1
      fi
      validate_env
      info "Rolling back scenario: $2"
      dispatch_scenario "rollback" "$2"
      echo ""
      ok "Rollback complete. A new revision will deploy automatically."
      info "Monitor with: az containerapp revision list --name $BACKEND --resource-group $RG -o table"
      ;;
    help|--help|-h)
      show_list
      ;;
    *)
      validate_env
      info "Injecting chaos scenario: $1"
      echo ""
      dispatch_scenario "inject" "$1"
      echo ""
      ok "Chaos injected! A new revision will deploy automatically."
      info "Monitor with: az containerapp revision list --name $BACKEND --resource-group $RG -o table"
      info "Rollback with: $0 rollback $1"
      ;;
  esac
}

main "$@"
