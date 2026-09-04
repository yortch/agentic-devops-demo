---
applyTo: "backend/**/*.java"
---

# Java Instructions

## Do Not

- Do not introduce wildcard imports, including static wildcard imports; use explicit imports for referenced types and members.

## Code Review

Prioritize correctness and regressions. Report only actionable findings, citing the affected file and explaining the concrete impact.

1. Reject wildcard imports and require explicit imports for referenced types and static members.
2. Preserve Spring layering: controllers own HTTP concerns, services own business logic, and repositories own persistence queries.
3. Flag violations of the H2/BIAN source-of-truth rules or changes that expose JPA entities through REST APIs.
4. Verify BIAN calls retain retry, circuit-breaker, fallback-signature, timeout, and cache behavior.
5. Check that read-only database work uses `@Transactional(readOnly = true)` and does not perform writes or blocking external calls within the transaction.
6. Require intentional handling for null, invalid-input, and not-found paths without leaking internal details.
7. Require focused JUnit/MockMvc coverage for changed backend behavior and WireMock coverage for BIAN integration changes.