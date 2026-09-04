---
description: 'Spring Boot best practices for the Three Rivers Bank backend'
mode: 'agent'
---

# Spring Boot Best Practices

Your goal is to help write high-quality Spring Boot applications for the Three Rivers Bank backend by following established best practices.

## Project Setup & Structure

- **Build Tool:** Use Maven (`pom.xml`) for dependency management.
- **Starters:** Use Spring Boot starters (e.g., `spring-boot-starter-web`, `spring-boot-starter-data-jpa`) to simplify dependency management.
- **Package Structure:** Follow the project's layer-based layout: `com.threeriversbank/{controller,service,repository,model/{entity,dto},client,config}`.

## Imports

- **NEVER use wildcard imports** (e.g., `import java.util.*`). Always use explicit, per-class imports. This is a hard enterprise requirement.

## Dependency Injection & Components

- **Constructor Injection:** Always use constructor-based injection for required dependencies. This makes components easier to test and dependencies explicit.
- **Immutability:** Declare dependency fields as `private final`.
- **Component Stereotypes:** Use `@Component`, `@Service`, `@Repository`, and `@Controller`/`@RestController` annotations appropriately to define beans.

## Configuration

- **Externalized Configuration:** Use `application.yml` for configuration. YAML is preferred for readability and hierarchical structure.
- **Type-Safe Properties:** Use `@ConfigurationProperties` to bind configuration to strongly-typed Java objects.
- **Profiles:** Use Spring Profiles (`application-dev.yml`, `application-prod.yml`) to manage environment-specific configurations.
- **Secrets Management:** Do not hardcode secrets. Use environment variables or a dedicated secret management tool.

## Web Layer (Controllers)

- **RESTful APIs:** Design clear and consistent RESTful endpoints.
- **DTOs (Data Transfer Objects):** Use DTOs to expose and consume data in the API layer. Do not expose JPA entities directly to the client.
- **Validation:** Use Java Bean Validation (JSR 380) with annotations (`@Valid`, `@NotNull`, `@Size`) on DTOs to validate request payloads.
- **Error Handling:** Implement a global exception handler using `@ControllerAdvice` and `@ExceptionHandler` to provide consistent error responses.

## Service Layer

- **Business Logic:** Encapsulate all business logic within `@Service` classes.
- **Statelessness:** Services should be stateless.
- **Transaction Management:** Use `@Transactional` on service methods to manage database transactions declaratively.

## Data Layer (Repositories)

- **Spring Data JPA:** Use Spring Data JPA repositories by extending `JpaRepository` or `CrudRepository` for standard database operations.
- **Custom Queries:** For complex queries, use `@Query` or the JPA Criteria API.
- **Projections:** Use DTO projections to fetch only the necessary data from the database.

## Logging

- **SLF4J:** Use the SLF4J API for logging.
- **Logger Declaration:** `private static final Logger logger = LoggerFactory.getLogger(MyClass.class);`
- **Parameterized Logging:** Use parameterized messages (`logger.info("Processing card {}...", cardId);`) instead of string concatenation.
- **No System.out:** Never use `System.out.println` — always use the SLF4J logger.

## External API Calls (BIAN)

- All calls to the BIAN API must go through the Resilience4j circuit breaker (3 retries, 5s timeout).
- Configure the Feign client base URL from `application.yml` — never hardcode `https://virtserver.swaggerhub.com/...`.
- Use `@Cacheable` with appropriate TTLs: 5 minutes for transactions, 1 hour for billing data.
- Implement fallback methods that return H2 database data when the BIAN API is unavailable.

## Testing

- **Unit Tests:** Write unit tests for services and components using JUnit 5 and Mockito.
- **Integration Tests:** Use `@SpringBootTest` for integration tests that load the Spring application context.
- **Test Slices:** Use `@WebMvcTest` (for controllers) or `@DataJpaTest` (for repositories) to test specific layers in isolation.
- **WireMock:** Use WireMock to mock external BIAN API calls in integration tests.

## Security

- **Input Sanitization:** Prevent SQL injection by using Spring Data JPA or parameterized queries.
- **No Hardcoded Credentials:** Never commit API keys, passwords, or tokens to source code.
