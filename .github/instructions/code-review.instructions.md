---
description: 'Standards that Copilot should enforce during pull request code reviews'
applyTo: '**'
---

# Code Review Standards

## Security

- Flag any hardcoded secrets, passwords, API keys, or tokens — these must come from environment variables or a secrets manager.
- Check for SQL injection risks; all queries must use parameterized statements or Spring Data JPA.
- Check for XSS vulnerabilities in React components; sanitize any user-supplied HTML.

## Java / Spring Boot

- **Reject wildcard imports** — every Java file must use explicit, per-class imports. No `import java.util.*` or similar.
- Verify DTOs are used in all controller request/response bodies — never expose JPA entities directly.
- Check that all BIAN API calls go through the Resilience4j circuit breaker.
- Flag any hardcoded BIAN API URLs — base URLs must come from `application.yml` configuration.
- Flag any `System.out.println` usage — use SLF4J logger with parameterized messages instead.
- Confirm `@Transactional` is present on service methods that modify data.

## React / Frontend

- Verify React components use React Query for server state — flag raw `fetch` or `axios` calls outside query functions.
- Check that MUI components use the Three Rivers Bank theme from `frontend/src/theme.js`.

## Error Handling & Logging

- Ensure exceptions are handled explicitly and not silently swallowed.
- Verify SLF4J is used for logging in all Java classes, not `System.out`.

## Testing

- Verify that new features or bug fixes are accompanied by tests.
- Check that test naming follows the `methodName_should_expectedBehavior_when_scenario` convention.
- Confirm controller tests use `@WebMvcTest` and repository tests use `@DataJpaTest`.

## Docker / Infrastructure

- Verify Dockerfiles use multi-stage builds.
- Check that base images are pinned to explicit versions, not `:latest`.
- Confirm no secrets or credentials are embedded in Docker images.
- Verify health check instructions are present.
