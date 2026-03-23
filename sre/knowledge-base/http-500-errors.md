# Three Rivers Bank — HTTP 500 Error Investigation Runbook

## Trigger Keywords
`500 error`, `internal server error`, `HTTP 500`, `server error`, `application error`

## Scope
Three Rivers Bank backend (Spring Boot) running on Azure Container Apps.
Logs stored in Log Analytics Workspace linked to the Container App Environment.

## Application Architecture
- **Backend**: Spring Boot REST API serving credit card data from H2 in-memory database
- **Frontend**: React (Vite) app served via Nginx
- **API Base Path**: `/api/cards`
- **Health Check**: `/actuator/health`
- **BIAN Integration**: External API for supplementary transaction data (circuit breaker protected)

## Valid Azure Monitor Metric Names for Container Apps
**IMPORTANT: Use ONLY these metric names with `az monitor metrics list`:**
- `UsageNanoCores` — CPU usage
- `WorkingSetBytes` — Memory usage
- `Requests` — HTTP request count
- `RestartCount` — Container restarts (OOM indicator)
- `Replicas` — Active replica count

---

## Phase 1: Initial Triage

### 1.1 Container App Status
```bash
az containerapp show -g <resourceGroup> -n <backendAppName> --query "{status:properties.runningStatus, replicas:properties.template.scale}" -o json
```

### 1.2 Recent Logs
```bash
az containerapp logs show -g <resourceGroup> -n <backendAppName> --tail 300 --format text
```

### 1.3 Quick Error Count (KQL)
```kql
ContainerAppConsoleLogs_CL
| where TimeGenerated > ago(1h)
| where Log_s contains "error" or Log_s contains "exception" or Log_s contains "500"
| summarize ErrorCount = count() by bin(TimeGenerated, 5m)
| order by TimeGenerated desc
```

---

## Phase 2: Error Pattern Analysis

### 2.1 Top Errors by Message
```kql
ContainerAppConsoleLogs_CL
| where TimeGenerated > ago(1h)
| where Log_s contains "error" or Log_s contains "exception"
| extend ErrorMessage = extract("(Exception|Error|Failed).*", 0, Log_s)
| summarize Count = count(), FirstSeen = min(TimeGenerated), LastSeen = max(TimeGenerated) by ErrorMessage
| order by Count desc
| take 10
```

### 2.2 Error Rate Over Time
```kql
requests
| where timestamp > ago(1h)
| summarize
    Total = count(),
    Failed = countif(resultCode startswith "5"),
    ErrorRate = round(100.0 * countif(resultCode startswith "5") / count(), 2)
by bin(timestamp, 5m)
| order by timestamp desc
```

---

## Phase 3: Common Root Causes for Three Rivers Bank

### 3.1 NullPointerException in CreditCardService
**Symptom**: All `/api/cards` requests return 500
**Root cause**: Code change introducing NPE in `CreditCardService.convertToDto()` or `getAllCreditCards()`
**File**: `backend/src/main/java/com/threeriversbank/service/CreditCardService.java`
```kql
ContainerAppConsoleLogs_CL
| where TimeGenerated > ago(1h)
| where Log_s contains "NullPointerException" or Log_s contains "convertToDto"
| project TimeGenerated, Log_s
| take 20
```

### 3.2 Slow Response Times (Thread.sleep injection)
**Symptom**: GET /api/cards takes 3-9 seconds, timeouts
**Root cause**: `Thread.sleep()` injected in service layer
**File**: `backend/src/main/java/com/threeriversbank/service/CreditCardService.java`
```kql
requests
| where timestamp > ago(1h)
| where name contains "cards"
| summarize AvgDuration = avg(duration), P95 = percentile(duration, 95), P99 = percentile(duration, 99)
by bin(timestamp, 5m)
| order by timestamp desc
```

### 3.3 Bad Backend Image Tag
**Symptom**: Backend unreachable, 503 errors, image pull failures
**Root cause**: Terraform `container_app_backend_image` changed to nonexistent tag
**File**: `infra/terraform/variables.tf` or `infra/terraform/main.tf`
```bash
az containerapp show -g <resourceGroup> -n <backendAppName> --query "properties.template.containers[0].image" -o tsv
```

### 3.4 Port Mismatch
**Symptom**: 503 errors, health check fails
**Root cause**: Container target port changed from 8080 to wrong value
```bash
az containerapp show -g <resourceGroup> -n <backendAppName> --query "properties.configuration.ingress.targetPort" -o tsv
```

### 3.5 Bad BIAN API URL
**Symptom**: BIAN API calls fail, degraded card data (features/rates missing)
**Root cause**: `BIAN_API_BASE_URL` environment variable changed to invalid URL
**File**: `backend/src/main/resources/application.yml`
```bash
az containerapp show -g <resourceGroup> -n <backendAppName> --query "properties.template.containers[0].env[?name=='BIAN_API_BASE_URL'].value" -o tsv
```

---

## Phase 4: Resource Health

### 4.1 CPU and Memory Metrics
```bash
az monitor metrics list --resource <containerAppResourceId> --metric "UsageNanoCores" --interval PT5M
az monitor metrics list --resource <containerAppResourceId> --metric "WorkingSetBytes" --interval PT5M
```

### 4.2 Container Restarts
```kql
ContainerAppSystemLogs_CL
| where TimeGenerated > ago(1h)
| where Log_s contains "restart" or Log_s contains "crash" or Log_s contains "OOMKilled"
| project TimeGenerated, Log_s, ContainerName_s
| order by TimeGenerated desc
```

### Resource Thresholds
| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| CPU % | > 70% | > 90% | Scale out replicas |
| Memory % | > 75% | > 90% | Scale up or fix leak |
| Response Time p95 | > 3s | > 10s | Check for injected delays or resource starvation |
| Restart Count | > 0 | > 3 | Check OOM, health probes, image pull |

---

## Phase 5: GitHub Code Correlation

When investigating, always check recent commits for suspicious changes:
```
Search the repository for recent changes to:
- backend/src/main/java/com/threeriversbank/service/
- backend/src/main/java/com/threeriversbank/controller/
- backend/src/main/resources/application.yml
- infra/terraform/variables.tf
- infra/terraform/main.tf
```

Look for PRs with the `chaos-engineering` label — these are intentional breaks introduced for testing.
