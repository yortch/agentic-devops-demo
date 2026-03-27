---
description: "Reusable prompt for triggering comprehensive code reviews of Three Rivers Bank changes"
---

# Code Review Prompt

Perform a comprehensive code review of the changed files, using the standards defined in `.github/instructions/code-review.instructions.md`.

## Review Scope

Check ALL of the following:

### 🔴 Critical (Block merge if found)
- [ ] Wildcard Java imports (e.g., `import java.util.*`) — must be explicit
- [ ] JPA entities exposed directly in API responses — must use DTOs
- [ ] BIAN API calls that bypass the Resilience4j circuit breaker
- [ ] Hardcoded secrets, credentials, API keys, or passwords
- [ ] SQL injection risk in JPQL/native queries
- [ ] XSS risk (`dangerouslySetInnerHTML` without sanitization)

### 🟡 Warnings (Should fix before merge)
- [ ] Field injection (`@Autowired`) instead of constructor injection
- [ ] Raw `fetch`/`axios`/Redux used instead of React Query for server state
- [ ] Hardcoded Material-UI colors that bypass the Three Rivers Bank theme
- [ ] Missing `@Valid` on controller DTO parameters
- [ ] Missing error handling in service methods or missing `@ControllerAdvice`
- [ ] New public methods without unit tests
- [ ] New API endpoints without `@WebMvcTest` controller tests

### 🔵 Suggestions (Nice to have)
- [ ] SLF4J parameterized logging (not string concatenation)
- [ ] Test method naming convention: `methodName_should_expectedBehavior_when_scenario`
- [ ] Multi-stage Docker builds
- [ ] Docker image naming: `threeriversbank/{backend|frontend}:latest`

## Output Format

```
## Code Review Summary

### 🔴 Critical Issues
- [File:Line] Issue description — recommended fix

### 🟡 Warnings  
- [File:Line] Issue description — recommendation

### 🔵 Suggestions
- [File:Line] Optional improvement

### ✅ What Looks Good
- Summary of compliant areas

### Overall: [APPROVE / REQUEST_CHANGES / NEEDS_DISCUSSION]
```
