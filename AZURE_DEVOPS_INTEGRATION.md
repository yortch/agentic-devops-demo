# Azure DevOps Integration

This document describes the Azure DevOps work item integration added to the Three Rivers Bank backend.

## Overview

The backend now includes REST API endpoints to interact with Azure DevOps work items, user stories, and project backlogs. The integration uses the Azure DevOps REST API with circuit breaker pattern and fallback mechanisms for resilience.

## Configuration

### Environment Variables

Set the following environment variable to authenticate with Azure DevOps:

```bash
export AZURE_DEVOPS_PAT=your_personal_access_token_here
```

### Application Properties

The following properties can be configured in `application.yml`:

```yaml
azure:
  devops:
    base-url: https://dev.azure.com
    organization: msft-common-demos
    default-project: msft-common-demos-adogh-crispy-carnival
    pat: ${AZURE_DEVOPS_PAT:}  # PAT token from environment variable
```

## API Endpoints

### 1. List User Stories

**Endpoint:** `GET /api/workitems/user-stories`

**Description:** Returns a list of all user stories from the default Azure DevOps project.

**Example Request:**
```bash
curl http://localhost:8080/api/workitems/user-stories
```

**Example Response:**
```json
[
  {
    "id": 859,
    "title": "Implement Azure DevOps Integration",
    "workItemType": "User Story",
    "state": "Active",
    "assignedTo": "John Doe",
    "createdBy": "Jane Smith",
    "createdDate": "2026-02-01T10:00:00",
    "changedDate": "2026-02-04T15:30:00",
    "description": "Add Azure DevOps API integration to fetch work items and backlog",
    "priority": 1,
    "areaPath": "msft-common-demos-adogh-crispy-carnival",
    "iterationPath": "Sprint 1",
    "url": "https://dev.azure.com/msft-common-demos/msft-common-demos-adogh-crispy-carnival/_workitems/edit/859"
  }
]
```

### 2. List All Work Items

**Endpoint:** `GET /api/workitems`

**Description:** Returns a list of all work items (user stories, bugs, tasks, etc.) from the default Azure DevOps project.

**Example Request:**
```bash
curl http://localhost:8080/api/workitems
```

**Example Response:**
```json
[
  {
    "id": 861,
    "title": "Fix authentication bug",
    "workItemType": "Bug",
    "state": "Active",
    "assignedTo": "Charlie Brown",
    "createdBy": "Diana Prince",
    "createdDate": "2026-02-03T08:00:00",
    "changedDate": "2026-02-04T20:00:00",
    "description": "Users unable to authenticate with Azure AD",
    "priority": 1,
    "areaPath": "msft-common-demos-adogh-crispy-carnival",
    "iterationPath": "Sprint 1",
    "url": "https://dev.azure.com/msft-common-demos/msft-common-demos-adogh-crispy-carnival/_workitems/edit/861"
  }
]
```

### 3. Get Work Item Details

**Endpoint:** `GET /api/workitems/{id}`

**Description:** Returns detailed information for a specific work item by ID.

**Example Request:**
```bash
curl http://localhost:8080/api/workitems/859
```

**Example Response:**
```json
{
  "id": 859,
  "title": "Implement Azure DevOps Integration",
  "workItemType": "User Story",
  "state": "Active",
  "assignedTo": "John Doe",
  "createdBy": "Jane Smith",
  "createdDate": "2026-02-01T10:00:00",
  "changedDate": "2026-02-04T15:30:00",
  "description": "Add Azure DevOps API integration to fetch work items and backlog",
  "priority": 1,
  "areaPath": "msft-common-demos-adogh-crispy-carnival",
  "iterationPath": "Sprint 1",
  "url": "https://dev.azure.com/msft-common-demos/msft-common-demos-adogh-crispy-carnival/_workitems/edit/859"
}
```

### 4. Get Project Backlog

**Endpoint:** `GET /api/projects/{projectName}/backlog`

**Description:** Returns backlog items (user stories, bugs, tasks) for a specific project.

**Example Request:**
```bash
curl http://localhost:8080/api/projects/msft-common-demos-adogh-crispy-carnival/backlog
```

**Example Response:**
```json
[
  {
    "id": 859,
    "title": "Implement Azure DevOps Integration",
    "workItemType": "User Story",
    "state": "Active",
    "assignedTo": "John Doe",
    "priority": 1,
    "storyPoints": 8,
    "iterationPath": "Sprint 1",
    "createdDate": "2026-02-01T10:00:00",
    "url": "https://dev.azure.com/msft-common-demos/msft-common-demos-adogh-crispy-carnival/_workitems/edit/859"
  }
]
```

## Resilience Features

### Circuit Breaker

The integration uses Resilience4j circuit breaker pattern to handle Azure DevOps API failures:

- **Sliding Window Size:** 10 requests
- **Failure Rate Threshold:** 50%
- **Wait Duration in Open State:** 10 seconds
- **Permitted Calls in Half-Open State:** 3

### Retry Logic

- **Max Attempts:** 3
- **Wait Duration:** 1 second between retries

### Timeout

- **Timeout Duration:** 5 seconds per request

### Fallback Mechanism

If the Azure DevOps API is unavailable or fails, the endpoints return sample fallback data to ensure the application remains functional.

## Caching

Work item data is cached with the following strategy:

- **User Stories:** 5 minutes TTL
- **All Work Items:** 5 minutes TTL
- **Individual Work Item:** 5 minutes TTL
- **Project Backlog:** 5 minutes TTL

## Testing

### Unit Tests

The implementation includes comprehensive unit tests:

- **AzureDevOpsServiceTest:** Tests service layer logic with mocked Azure DevOps client
- **AzureDevOpsControllerTest:** Tests REST controller endpoints with MockMvc

Run tests with:
```bash
cd backend
mvn test -Dtest=AzureDevOpsServiceTest,AzureDevOpsControllerTest
```

### Manual Testing

Without Azure DevOps PAT token (uses fallback data):
```bash
cd backend
mvn spring-boot:run

# In another terminal
curl http://localhost:8080/api/workitems/user-stories
curl http://localhost:8080/api/workitems
curl http://localhost:8080/api/workitems/859
curl http://localhost:8080/api/projects/msft-common-demos-adogh-crispy-carnival/backlog
```

With Azure DevOps PAT token:
```bash
export AZURE_DEVOPS_PAT=your_pat_token_here
cd backend
mvn spring-boot:run

# Test with real Azure DevOps data
curl http://localhost:8080/api/workitems/user-stories
```

## Swagger/OpenAPI Documentation

The API endpoints are documented with Swagger annotations and can be accessed at:

```
http://localhost:8080/swagger-ui.html
```

## Error Handling

The integration handles various error scenarios:

1. **No PAT Token:** Falls back to sample data
2. **Invalid PAT Token:** Circuit breaker opens after failures, returns sample data
3. **Network Timeout:** Retries up to 3 times, then falls back to sample data
4. **API Rate Limiting:** Circuit breaker prevents overwhelming the API
5. **Invalid Work Item ID:** Returns sample data or 404 based on configuration

## Security Considerations

1. **PAT Token:** Store the PAT token securely in environment variables, not in code
2. **Token Permissions:** The PAT token needs read access to work items
3. **HTTPS:** Always use HTTPS in production
4. **Token Rotation:** Rotate PAT tokens regularly according to your security policy

## Troubleshooting

### No Data Returned

1. Check if PAT token is set correctly
2. Verify organization and project names in configuration
3. Check logs for circuit breaker status
4. Verify PAT token has appropriate permissions

### Circuit Breaker Open

1. Check Azure DevOps API status
2. Verify network connectivity
3. Check PAT token validity
4. Wait for circuit breaker to move to half-open state (10 seconds)

### Slow Response Times

1. Check Azure DevOps API performance
2. Verify cache configuration is working
3. Consider increasing timeout values if needed
4. Check network latency

## Future Enhancements

Potential improvements for the Azure DevOps integration:

1. **Filtering:** Add query parameters for filtering work items by state, assigned user, etc.
2. **Pagination:** Implement pagination for large result sets
3. **Write Operations:** Add endpoints to create/update work items
4. **Webhooks:** Subscribe to Azure DevOps webhooks for real-time updates
5. **Advanced Queries:** Support custom WIQL queries
6. **Multiple Projects:** Support querying across multiple projects
