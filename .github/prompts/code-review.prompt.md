---
description: 'Run a comprehensive code review on the current changes'
mode: 'agent'
---

# Comprehensive Code Review

Review the current code changes thoroughly, checking for compliance with the Three Rivers Bank project standards defined in `.github/instructions/`.

## What to Check

### Java / Spring Boot (`backend/**/*.java`)
Follow the standards in `.github/instructions/java.instructions.md`:
- No wildcard imports — every import must be explicit
- Constructor-based DI with `private final` fields
- DTOs used in all controller request/response bodies — no JPA entities exposed directly
- Business logic in `@Service` classes; controllers are thin
- `@Transactional` on service methods that modify data
- SLF4J logger used with parameterized messages — no `System.out.println`
- BIAN API calls go through the Resilience4j circuit breaker
- BIAN API base URLs come from configuration, not hardcoded

### JUnit Tests (`backend/src/test/**/*.java`)
Follow the standards in `.github/instructions/java-testing.instructions.md`:
- No wildcard imports in test files
- AAA pattern followed in each test method
- Test naming: `methodName_should_expectedBehavior_when_scenario`
- `@WebMvcTest` for controllers, `@DataJpaTest` for repositories
- Mockito for unit mocks, WireMock for BIAN API mocks

### React / Frontend (`frontend/src/**/*.{jsx,js}`)
Follow the standards in `.github/instructions/react.instructions.md`:
- React Query used for server state — no raw `fetch`/`axios` outside query functions
- MUI components use the Three Rivers Bank theme from `frontend/src/theme.js`
- Functional components with hooks only
- Components organized into correct directories (`pages/`, `components/`)

### Security (all files)
Follow the standards in `.github/instructions/code-review.instructions.md`:
- No hardcoded secrets, passwords, or API keys
- No SQL injection risks
- No XSS vulnerabilities in React components

### Docker (`docker/**`)
Follow the standards in `.github/instructions/docker.instructions.md`:
- Multi-stage builds used
- Base images pinned to explicit versions (not `:latest`)
- Containers run as non-root users
- `HEALTHCHECK` instructions present
- No secrets in image layers

### Documentation (`backend/src/main/**/*.java`)
Follow the standards in `.github/instructions/documentation.instructions.md`:
- All `public` and `protected` members have Javadoc
- `@param`, `@return`, `@throws` tags present where applicable

## Output Format

Structure your review as:

1. **Summary** — one paragraph overview of the changes and overall quality
2. **Critical Issues** 🔴 — must be fixed before merge (file, line, explanation, fix)
3. **Warnings** 🟡 — should be addressed (file, line, suggested improvement)
4. **Suggestions** 🟢 — optional quality improvements
5. **Verdict** — `✅ Approved`, `⚠️ Approved with suggestions`, or `❌ Changes requested`
