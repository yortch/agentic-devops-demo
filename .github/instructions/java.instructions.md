---
description: 'Java coding standards for the Three Rivers Bank Spring Boot backend'
applyTo: 'backend/**/*.java'
---

# Java / Spring Boot Coding Standards

## Imports

- **NEVER use wildcard imports** (e.g., `import java.util.*`). Always use explicit, per-class imports. This is a hard enterprise requirement.

## Dependency Injection

- Use constructor-based dependency injection for all required dependencies.
- Declare injected fields as `private final`.
- Do not use field injection (`@Autowired` on fields).

## Component Stereotypes

- Use `@Service` for business-logic classes.
- Use `@Repository` for data-access classes.
- Use `@RestController` for REST endpoint classes.

## DTOs

- Never expose JPA entities directly in controller responses or request bodies.
- Use DTOs (`model/dto`) for all API inputs and outputs.
- Map between entities and DTOs in the service layer.

## Service Layer

- Encapsulate all business logic in `@Service` classes; keep controllers thin.
- Annotate service methods that modify data with `@Transactional`.
- Services must be stateless.

## Logging

- Use SLF4J for all logging: `private static final Logger logger = LoggerFactory.getLogger(MyClass.class);`
- Use parameterized messages: `logger.info("Processing card {}", cardId);` — never string concatenation.
- Do **not** use `System.out.println`.

## Configuration

- Store all configuration in `application.yml`.
- Use `@ConfigurationProperties` for type-safe binding of configuration properties.
- Do not hardcode URLs, credentials, or environment-specific values in source code.

## Validation

- Apply Java Bean Validation annotations (`@Valid`, `@NotNull`, `@Size`, etc.) on DTO classes.
- Trigger validation on controller method parameters with `@Valid`.

## Error Handling

- Implement a single global exception handler using `@ControllerAdvice` and `@ExceptionHandler`.
- Return consistent, structured error responses from the global handler.

## External API Calls (BIAN)

- All calls to the BIAN API must go through the Resilience4j circuit breaker.
- Never call the BIAN API directly from a controller or repository.
- BIAN API base URLs must come from configuration, never hardcoded.
