---
description: 'JUnit 5 testing best practices for backend tests'
mode: 'agent'
---

# JUnit 5+ Best Practices

Your goal is to help write effective unit and integration tests for the Three Rivers Bank backend using JUnit 5, covering both standard and data-driven testing approaches.

## Project Setup

- Place test source code in `backend/src/test/java`.
- Include dependencies for `junit-jupiter-api`, `junit-jupiter-engine`, and `junit-jupiter-params` for parameterized tests.
- Run tests with: `mvn test`.

## Imports

- **NEVER use wildcard imports** in test files. Use explicit, per-class imports for every type.

## Test Structure

- Test class naming: `{Class}Test.java` (e.g., `CreditCardServiceTest.java`).
- Use `@Test` for standard test methods.
- Follow the **Arrange-Act-Assert (AAA)** pattern in every test method.
- Test method naming convention: `methodName_should_expectedBehavior_when_scenario`.
- Use `@BeforeEach` and `@AfterEach` for per-test setup and teardown.
- Use `@BeforeAll` and `@AfterAll` for per-class setup and teardown (must be `static`).
- Use `@DisplayName` to provide human-readable names for test classes and methods.

## Test Slices

- Use `@WebMvcTest` for controller tests — loads only the web layer.
- Use `@DataJpaTest` for repository tests — loads only the JPA layer with an in-memory database.
- Use `@SpringBootTest` only for full integration tests that require the complete application context.

## Standard Tests

- Keep tests focused on a single behavior per method.
- Avoid testing multiple unrelated conditions in one test method.
- Make tests independent and idempotent (can run in any order).
- Avoid test interdependencies.

## Data-Driven (Parameterized) Tests

- Use `@ParameterizedTest` to mark a method as parameterized.
- Use `@ValueSource` for simple literal values.
- Use `@MethodSource` for complex arguments provided by a factory method.
- Use `@CsvSource` for inline comma-separated values.
- Use `@EnumSource` to test all enum constants.

## Assertions

- Use `org.junit.jupiter.api.Assertions` static methods (`assertEquals`, `assertTrue`, `assertNotNull`).
- Use `assertAll` to group related assertions so all failures are reported together.
- Use `assertThrows` to verify exception behavior.
- Include descriptive failure messages in assertions.

## Mocking and Isolation

- Use Mockito for mocking dependencies: `@Mock`, `@InjectMocks`, `@MockBean`.
- Use WireMock to mock external BIAN API HTTP calls in integration tests.
- Use interfaces to facilitate mocking.

## Test Organization

- Mirror the main source package structure under `src/test/java`.
- Use `@Nested` inner classes to group related test scenarios.
- Use `@Tag` to categorize tests: `@Tag("unit")`, `@Tag("integration")`.
- Use `@Disabled` with an explanatory reason when temporarily skipping a test.
