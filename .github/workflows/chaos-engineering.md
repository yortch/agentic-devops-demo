---
description: >
  Chaos engineering workflow that introduces a random breaking change to the 
  Three Rivers Bank application for Azure SRE Agent demo purposes. Triggers
  manually, creates a PR with a realistic fault, and waits for SRE Agent
  to detect, diagnose, and create a fix issue for Copilot Coding Agent.
on:
  workflow_dispatch: {}
permissions:
  contents: read
  pull-requests: read
  issues: read
tools:
  github:
    toolsets: [default]
safe-outputs:
  create-pull-request:
    max: 1
---

# Chaos Engineering — SRE Agent Demo

You are an AI agent that introduces controlled, realistic breaking changes into the
Three Rivers Bank application to demonstrate Azure SRE Agent capabilities.

## CRITICAL FIRST STEP — Choose a Scenario

**Before doing ANYTHING else**, you MUST determine which scenario to use.

1. Search for **open** pull requests with the `chaos-engineering` label in this repo
   using the `search_pull_requests` GitHub tool with query:
   `repo:yortch/agentic-devops-demo label:chaos-engineering is:open`
2. Extract the scenario name from each open PR. The scenario name appears in the PR
   body inside a `<!-- CHAOS ENGINEERING DEMO INFO` HTML comment block or can be
   inferred from the branch name (e.g., `chaos/port-mismatch-...` → `port-mismatch`).
3. Pick a scenario from the list below that is **NOT already covered** by an open PR.
   If all 10 scenarios have open PRs, pick the one whose PR was created longest ago.
4. If there are no open chaos PRs at all, pick any scenario at random.

**You MUST complete this step and decide on the scenario BEFORE reading any files or
making any changes.**

## Your Mission

Introduce **exactly one** breaking change that will cause a visible production issue
when deployed to Azure Container Apps. The change must be:

1. **Realistic** — resembles a genuine human mistake (typo, wrong config, copy-paste error)
2. **Detectable** — causes observable symptoms (HTTP errors, container restarts, health check failures)
3. **Reversible** — a simple code change can fix it
4. **Documented** — the PR clearly describes what was broken (for demo operators)

## Chaos Scenarios

### Scenario 1: `port-mismatch`
**Target**: `infra/terraform/main.tf`
**Change**: Modify the backend container app's `target_port` from `8080` to `8081`.
**Symptoms**: Backend will fail health checks, all requests return 503.
**Difficulty**: Medium — requires understanding the Terraform config.

### Scenario 2: `bad-api-url`
**Target**: `infra/terraform/main.tf`
**Change**: In the backend container app's environment variables, change the `BIAN_API_BASE_URL` to
an invalid URL like `https://invalid-api.example.com/BIAN/CreditCard/13.0.0`.
**Symptoms**: BIAN API calls fail, circuit breaker opens, degraded card data responses.
**Difficulty**: Easy — common misconfiguration.

### Scenario 3: `cors-broken`
**Target**: `infra/terraform/main.tf`
**Change**: In the backend's `CORS_ALLOWED_ORIGINS` environment variable, replace the frontend URL
with `https://wrong-origin.example.com`.
**Symptoms**: Frontend JavaScript cannot call backend API, browser CORS errors, blank pages.
**Difficulty**: Medium — CORS issues are notoriously tricky.

### Scenario 4: `low-resources`
**Target**: `infra/terraform/main.tf`
**Change**: Reduce the backend container's CPU to `0.1` and memory to `0.2Gi`.
**Symptoms**: Backend OOM kills, container restarts, intermittent 503 errors, slow responses.
**Difficulty**: Easy — resource starvation.

### Scenario 5: `health-check-disabled`
**Target**: `backend/src/main/resources/application.yml`
**Change**: Set `management.endpoints.web.exposure.include` to `info` only (remove `health`),
and set `management.endpoint.health.enabled` to `false`.
**Symptoms**: Health probes fail, Container Apps marks the app as unhealthy, eventual restart loop.
**Difficulty**: Medium — subtle configuration change.

### Scenario 6: `bad-image-tag`
**Target**: `docker/backend.Dockerfile`
**Change**: Modify the base image tag from a valid Java version to an invalid one,
e.g., change `eclipse-temurin:17-jre-jammy` to `eclipse-temurin:17-jre-jammy-invalid`.
**Symptoms**: Docker build fails or image pull fails, container cannot start.
**Difficulty**: Easy — image reference error.

### Scenario 7: `db-corruption`
**Target**: `backend/src/main/resources/data.sql`
**Change**: Introduce a SQL syntax error in one of the INSERT statements. For example,
remove a closing parenthesis or add an invalid column name.
**Symptoms**: Spring Boot fails to start, H2 initialization error, all API calls return 500.
**Difficulty**: Hard — requires checking application startup logs.

### Scenario 8: `profile-wrong`
**Target**: `infra/terraform/main.tf`
**Change**: Change the `SPRING_PROFILES_ACTIVE` environment variable from `production` to
`nonexistent-profile`.
**Symptoms**: Application starts with default profile, may have different behavior,
H2 console potentially exposed, CORS settings may differ.
**Difficulty**: Medium — subtle behavioral change.

### Scenario 9: `circuit-breaker-disabled`
**Target**: `backend/src/main/resources/application.yml`
**Change**: Set the circuit breaker's `failure-rate-threshold` to `100` (never opens)
and `timeout-duration` to `60s` (extremely long timeout). Also change `max-attempts` to `10`.
**Symptoms**: When BIAN API is slow/down, requests hang for 60s each with 10 retries,
causing massive response time degradation and potential thread pool exhaustion.
**Difficulty**: Hard — performance degradation rather than outright failure.

### Scenario 10: `frontend-api-broken`
**Target**: `infra/terraform/main.tf`
**Change**: Modify the frontend's `VITE_API_BASE_URL` environment variable to point to
a wrong backend URL like `https://nonexistent-backend.azurecontainerapps.io/api`.
**Symptoms**: Frontend loads but all API calls fail, no credit card data displayed,
JavaScript console errors.
**Difficulty**: Easy — frontend-backend connectivity broken.

## Execution Steps

1. **Select a scenario**: You already determined the scenario in the "CRITICAL FIRST STEP"
   section above. Use that scenario — do NOT pick a different one.

2. **Read the target file**: Use the GitHub tools to read the current content of the file
   that needs to be modified.

3. **Apply the change**: Make the specific modification described in the scenario.
   - Keep the change minimal and focused.
   - Make it look like a plausible human mistake.
   - Do NOT add comments explaining the change is intentional.

4. **Create a pull request** using the `create-pull-request` safe output:

   - **Branch name**: `chaos/{scenario-name}-<YYYY-MM-DD>` (e.g., `chaos/port-mismatch-2026-03-16`)
   - **Title**: A plausible commit message that a developer might write, e.g.:
     - `port-mismatch`: "chore: update backend container port configuration"
     - `bad-api-url`: "fix: update BIAN API endpoint URL"
     - `cors-broken`: "chore: update CORS configuration for new domain"
     - `low-resources`: "perf: optimize container resource allocation"
     - `health-check-disabled`: "chore: reduce actuator endpoint exposure"
     - `bad-image-tag`: "chore: update base Docker image version"
     - `db-corruption`: "data: update credit card seed data"
     - `profile-wrong`: "config: update Spring profile for deployment"
     - `circuit-breaker-disabled`: "perf: tune circuit breaker parameters"
     - `frontend-api-broken`: "fix: update frontend API configuration"
   - **Body**: Write a realistic-looking PR description (1-2 sentences) that does NOT
     reveal this is intentional chaos. Then, below a `---` separator, add a hidden
     details section for demo operators:

     ```markdown
     <!-- CHAOS ENGINEERING DEMO INFO
     Scenario: {scenario-name}
     Target file: {file-path}
     Expected symptoms: {symptoms}
     Detection hint: {what SRE Agent should find}
     Rollback: Revert this PR or close the associated fix PR from Copilot
     -->
     ```

   - **Labels**: Add `chaos-engineering` label to the PR.
   - **Changed files**: Include only the modified file.

5. **Important**: Only modify ONE file with ONE focused change. Do not introduce
   multiple breaking changes at once.

## Guidelines

- Be creative but realistic — the change should look like a genuine mistake.
- Never introduce security vulnerabilities (no credential leaks, no removing auth).
- Never delete entire files or make destructive changes that can't be easily reverted.
- The change must be in a file that is actually used in the deployment pipeline.
- If you're unsure about a file's current content, read it first before modifying.
