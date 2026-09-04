# Three Rivers Bank Copilot Instructions

React 18/Vite/Material UI frontend with TanStack Query, backed by Java 17/Spring Boot 3, Spring Data JPA/H2, OpenFeign, and Resilience4j.

## Repository Standards

- The APIs are a public, read-only product-catalog demo; no authentication is required.
- H2 is authoritative for the card catalog, fees, and interest rates. BIAN may supplement transactions and billing only.
- All BIAN calls must use the existing Resilience4j retry and circuit-breaker configuration with a compatible fallback.
- Cache transactions for 5 minutes and billing data for 1 hour.
- REST endpoints expose DTOs, not JPA entities.
- Keep `tests/fixtures/credit-cards.json` aligned with `backend/src/main/resources/data.sql` when catalog data changes.

## Do Not

- Do not query BIAN for card catalog, fee, or interest-rate data.
- Do not add Spring Security or store payment credentials, account numbers, or other sensitive cardholder data.
- Do not bypass Resilience4j for BIAN integrations.
- Do not use Redux or raw `fetch`/Axios for server state; use TanStack Query hooks.
- Do not disable the H2 console in development; keep it disabled in production.

## References

- Project details and development commands: `README.md`
- Architecture decisions: `.github/prompts/plan-threeRiversBankCreditCardWebsite.prompt.md`
- Frontend theme and branding: `frontend/src/theme.js`
- Deployment guidance: `README-AZURE-DEPLOYMENT.md`
