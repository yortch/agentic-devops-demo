---
applyTo: "**/*Test.java,**/*Tests.java,**/*.spec.ts"
description: "Testing standards for Three Rivers Bank backend (JUnit 5) and E2E (Playwright)"
---

# Testing Instructions

## Backend — JUnit 5 + Mockito

- Use JUnit 5 (`@ExtendWith(MockitoExtension.class)`) with Mockito for unit tests.
- Follow the **Arrange-Act-Assert (AAA)** pattern in every test method; separate each section with a blank line.
- Name test methods using the pattern: `methodName_should_expectedBehavior_when_scenario`
  - Example: `findById_should_returnCard_when_idExists`
- Use `@WebMvcTest` for controller layer tests with `MockMvc`.
- Use `@DataJpaTest` for repository layer tests backed by H2.
- Use **WireMock** to mock BIAN API calls in integration tests — never call the real BIAN API in tests.
- Use `@SpringBootTest` sparingly; prefer slice tests (`@WebMvcTest`, `@DataJpaTest`) for speed.

## Frontend — Playwright E2E

- Place E2E test files in `tests/e2e/` with the `.spec.ts` extension.
- Store test fixtures in `tests/fixtures/` (e.g., `credit-cards.json`); fixtures must match H2 seed data.
- Run tests across both **Chromium** and **WebKit** browsers.
- Test at all three configured viewports: desktop (1920×1080), tablet (768×1024), and mobile (375×667).
- Use page object patterns to keep test logic reusable and maintainable.
