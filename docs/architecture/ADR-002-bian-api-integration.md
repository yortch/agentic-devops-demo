# ADR-002: BIAN API Integration with Circuit Breaker Pattern

## Status
Accepted

## Context
The application integrates with the BIAN (Banking Industry Architecture Network) API v13.0.0 via SwaggerHub mock server to provide supplementary transaction and billing data. The external API may be unreliable or unavailable.

## Decision
Use Spring Cloud OpenFeign for BIAN API calls with Resilience4j circuit breaker, retry, and time limiter patterns. Fall back to mock data when the BIAN API is unavailable.

## Decision Drivers
- **External API reliability**: SwaggerHub mock server has no SLA
- **User experience**: Application must remain functional when BIAN API is down
- **Data separation**: H2 is authoritative for catalog; BIAN supplements with transactions/billing

## Architecture Pattern
```
Request → Service Layer → Circuit Breaker → Feign Client → BIAN API
                ↓ (on failure)
           Fallback Mock Data
```

## Circuit Breaker Configuration
- **Sliding window**: 10 calls
- **Failure threshold**: 50%
- **Wait in open state**: 10 seconds
- **Retry attempts**: 3 with 1 second wait
- **Timeout**: 5 seconds per call

## Consequences
- Application gracefully degrades when BIAN API is unavailable
- Mock/fallback data is clearly identifiable (should be flagged in responses)
- Circuit breaker prevents cascade failures and reduces latency during outages
- Caching reduces unnecessary API calls (transactions: 5min, billing: 1hr)

## Risks
- **Mock data confusion**: Fallback data could be mistaken for real transaction data
- **Cache staleness**: Cached data may not reflect latest transactions
- **API contract changes**: BIAN API response format changes could break integration silently

## Recommendations
- Add a `dataSource` field to DTOs indicating whether data is from BIAN or fallback
- Implement health check endpoint that reports BIAN API connectivity status
- Add structured logging for circuit breaker state transitions

## Related
- `backend/src/main/java/com/threeriversbank/client/BianApiClient.java`
- `backend/src/main/java/com/threeriversbank/service/CreditCardService.java`
- `backend/src/main/resources/application.yml` - Resilience4j configuration
