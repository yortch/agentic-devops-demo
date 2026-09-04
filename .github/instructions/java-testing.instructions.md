---
description: 'JUnit 5 testing standards for the Spring Boot backend'
applyTo: 'backend/src/test/**/*.java'
---

# JUnit 5 Testing Standards

## Imports

- **NEVER use wildcard imports** in test files. Use explicit imports for every class.

## Test Structure

- Follow the **Arrange-Act-Assert (AAA)** pattern in every test method.
- Test class naming: `{Class}Test.java` (e.g., `CreditCardServiceTest.java`).
- Test method naming: `methodName_should_expectedBehavior_when_scenario`.
- Use `@DisplayName` annotations for human-readable test descriptions.

## Test Slices

- Use `@WebMvcTest` for controller tests — loads only the web layer.
- Use `@DataJpaTest` for repository tests — loads only the JPA layer.
- Use `@SpringBootTest` only for full integration tests that need the entire context.

## Mocking

- Use Mockito for mocking dependencies: `@Mock`, `@InjectMocks`, `@MockBean`.
- Use WireMock to mock external BIAN API calls in integration tests.

## Assertions

- Keep tests focused on a single behavior per method when practical.
- Use `assertAll` to group related assertions so all failures are reported together.
- Use descriptive failure messages in assertions.
- Use `assertThrows` to verify exception behavior.

## Test Organization

- Place test files under `backend/src/test/java` mirroring the main source structure.
- Use `@Nested` inner classes to group related test scenarios.
- Use `@Tag` to categorize tests (e.g., `@Tag("unit")`, `@Tag("integration")`).
- Use `@Disabled` with an explanatory reason when temporarily skipping tests.

## Data-Driven Tests

- Use `@ParameterizedTest` with `@ValueSource`, `@CsvSource`, or `@MethodSource` for data-driven scenarios.
