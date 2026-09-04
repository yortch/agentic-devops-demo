---
applyTo: "**/*.java"
description: "Java and Spring Boot coding standards for Three Rivers Bank backend"
---

# Java / Spring Boot Instructions

## Imports
- **Never use wildcard imports** (e.g., `import java.util.*`). Always use explicit imports for each class (e.g., `import java.util.List`, `import java.util.Map`).

## Dependency Injection
- Use constructor-based dependency injection with `private final` fields.
- Avoid field injection (`@Autowired` on fields).

## Spring Stereotypes
- Use `@RestController` for REST API controllers.
- Use `@Service` for business logic classes.
- Use `@Repository` for data access classes.

## API Layer
- Use DTOs for all API responses; never expose JPA entities directly in controller responses.
- Use Java Bean Validation (`@Valid`, `@NotNull`, `@Size`, etc.) on DTO fields.
- Keep controllers thin — delegate all business logic to `@Service` classes.

## Configuration
- Prefer `application.yml` over `application.properties`.
- Use `@ConfigurationProperties` for type-safe, grouped configuration binding.

## Logging
- Use SLF4J (`private static final Logger log = LoggerFactory.getLogger(...)`) for logging.
- Use parameterized messages (e.g., `log.info("Processing card id={}", id)`) — never string concatenation.

## Error Handling
- Implement global exception handling with `@ControllerAdvice` and `@ExceptionHandler`.
- Do not swallow exceptions silently; always log with appropriate level.

## Transactions
- Apply `@Transactional` on service methods at the most granular level needed.
- Do not place `@Transactional` on controller methods.

## Package Structure
Follow the project package structure: `com.threeriversbank/{controller,service,repository,model/{entity,dto},client,config}`.
