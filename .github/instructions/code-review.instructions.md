---
applyTo: "**/*.java,**/*.jsx,**/*.js,**/*.ts"
description: "Code review checklist for Three Rivers Bank full-stack codebase"
---

# Code Review Instructions

Apply these checks whenever reviewing Java, React, or TypeScript code in this repository.

## Java — Imports
- **Flag any wildcard imports** (e.g., `import java.util.*`). Every import must be explicit (e.g., `import java.util.List`).

## Java — API Layer
- Verify that controller methods return DTOs, not JPA entity objects.
- Verify that `@Valid` is applied on DTO parameters in controller methods where input validation is required.

## Java — BIAN API Integration
- Verify that **all calls to the BIAN API go through the Resilience4j circuit breaker** (Feign client with `@CircuitBreaker` or equivalent Resilience4j configuration).
- Flag any direct HTTP calls to BIAN that bypass the circuit breaker.

## Java — Error Handling
- Verify that services use try-catch blocks or declare checked exceptions appropriately.
- Verify that a `@ControllerAdvice` class handles exceptions globally — do not let unhandled exceptions reach the client as 500 stack traces.

## React / Frontend — Data Fetching
- Verify that **React Query** (`useQuery`, `useMutation`) is used for all data fetching.
- Flag any use of raw `fetch`, `axios`, or Redux for server state management.

## React / Frontend — Theming
- Verify that Material-UI components use the Three Rivers Bank theme (imported from `frontend/src/theme.js`).
- Flag hardcoded color values (e.g., `#003366`, `#008080`, or any other hex/rgb literals) that should come from the theme instead.

## Security
- Check for hardcoded secrets, API keys, passwords, or credentials in any file.
- Check for potential SQL injection in JPQL/native queries — prefer Spring Data JPA method queries or parameterized queries.
- Check for XSS risk in React code — avoid `dangerouslySetInnerHTML`; sanitize any dynamic HTML.

## Test Coverage
- Verify that new public methods in service and controller classes have corresponding unit tests.
- Verify that new API endpoints have at least one `@WebMvcTest` controller test.

## Docker
- Verify that Docker image names follow the convention `threeriversbank/{backend|frontend}:latest`.
- Flag any secrets or credentials embedded in `Dockerfile` or `docker-compose` files.
