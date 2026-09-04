---
name: 'Backend Java Development'
description: 'Guidelines for Spring Boot backend development'
applyTo: 'backend/**/*.java'
---

<!-- 
  Based on: https://github.com/github/awesome-copilot/blob/main/instructions/java.instructions.md
  Customized for Three Rivers Bank Credit Card Website Spring Boot backend
-->

# Backend Java Development (Spring Boot)

## Project Context

This Spring Boot backend implements a credit card comparison API with:
- **H2 In-Memory Database** as the primary data source
- **BIAN API integration** via Spring Cloud OpenFeign for supplementary data
- **Circuit Breaker Pattern** using Resilience4j
- **Package Structure**: `com.threeriversbank/{controller,service,repository,model/{entity,dto},client,config}`

## Spring Boot Specific Guidelines

### REST API Conventions

- Use `@RestController` for REST endpoints, not `@Controller`
- Follow RESTful URL patterns: `/api/cards`, `/api/cards/{id}`, `/api/cards/{id}/fees`
- Use appropriate HTTP methods: `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`
- Return `ResponseEntity<T>` for fine-grained HTTP control or use direct DTO returns for simpler cases
- Use `@PathVariable` for URL parameters and `@RequestParam` for query parameters
- Implement proper HTTP status codes: 200 (OK), 201 (Created), 404 (Not Found), 500 (Internal Server Error)

### Spring Boot Annotations Best Practices

- **Service Layer**: Use `@Service` for business logic classes
- **Repository Layer**: Use `@Repository` or extend Spring Data JPA interfaces
- **Configuration**: Use `@Configuration` for Java-based configuration classes
- **Properties**: Use `@Value` or `@ConfigurationProperties` for external configuration
- **Dependency Injection**: Prefer constructor injection over field injection for testability
  ```java
  @Service
  public class CreditCardService {
      private final CreditCardRepository repository;
      
      public CreditCardService(CreditCardRepository repository) {
          this.repository = repository;
      }
  }
  ```

### Spring Data JPA Patterns

- Extend `JpaRepository<Entity, ID>` for CRUD operations
- Use method name queries for simple queries: `findByCardType`, `findByAnnualFeeLessThan`
- Use `@Query` annotation for complex JPQL queries
- Define entity relationships clearly with `@OneToMany`, `@ManyToOne`, `@JoinColumn`
- Use DTOs to avoid exposing entities directly in REST APIs
- Implement proper entity lifecycle with `@Entity`, `@Table`, `@Id`, `@GeneratedValue`
- Configure cascade operations carefully to avoid unintended data changes

### Circuit Breaker and Resilience

- Use Resilience4j `@CircuitBreaker` annotation for external API calls
- Define fallback methods for graceful degradation
- Configure retry policies: typically 3 retries with 5-second timeout
- Always have H2 database fallback when BIAN API is unavailable
  ```java
  @CircuitBreaker(name = "bianApi", fallbackMethod = "fallbackMethod")
  public DataResponse callBianApi() {
      // API call
  }
  
  private DataResponse fallbackMethod(Exception e) {
      // Return H2-based data
  }
  ```

### Feign Client Configuration

- Use `@FeignClient` with unique names for each external API
- Configure RequestInterceptor beans with unique names to avoid conflicts
- Implement proper error handling with `ErrorDecoder`
- Use DTOs for request and response mapping
- Configure connection and read timeouts appropriately

### Caching Strategy

- Use `@Cacheable` for frequently accessed, slowly-changing data
- Use `@CacheEvict` to clear cache when data changes
- Configure appropriate TTL: 5min for transactions, 1hr for billing data
- Don't cache data from H2 database (primary source should be fast)

### Actuator and Health Checks

- Enable Spring Boot Actuator for monitoring: `/actuator/health`
- Implement custom health indicators for external dependencies
- Monitor H2 database connectivity and BIAN API availability
- Use structured logging for production troubleshooting
- Expose metrics for performance monitoring

### H2 Database Configuration

- Use `spring.jpa.hibernate.ddl-auto: create` for development
- Seed initial data with `data.sql` in resources
- Enable H2 console in development: `spring.h2.console.enabled=true`
- Access H2 console at: `http://localhost:8080/h2-console`
- Use JDBC URL: `jdbc:h2:mem:creditcards`, username: `sa`, no password

## General Java Best Practices

### Modern Java Features

- **Records**: Use Java Records for DTOs and immutable data structures
  ```java
  public record CreditCardDTO(String id, String name, BigDecimal annualFee) {}
  ```
- **Pattern Matching**: Use pattern matching for `instanceof` checks
- **Type Inference**: Use `var` for local variables when type is clear
- **Streams API**: Use streams for collection processing
- **Optional**: Use `Optional<T>` for possibly-absent values, avoid returning `null`

### Naming Conventions

- `UpperCamelCase` for classes: `CreditCardService`, `BianApiClient`
- `lowerCamelCase` for methods and variables: `getCardById`, `annualFee`
- `UPPER_SNAKE_CASE` for constants: `MAX_RETRIES`, `DEFAULT_TIMEOUT`
- `lowercase` for package names: `com.threeriversbank.service`

### Resource Management

- Use try-with-resources for automatic resource cleanup
- Close streams, readers, and connections properly
- Let Spring manage bean lifecycle for proper cleanup

### Equality and Null Checks

- Use `.equals()` or `Objects.equals()` for object comparison, not `==`
- Use `Objects.requireNonNull()` for null validation
- Use `Optional` to handle absent values explicitly

### Code Organization

- Keep methods focused and small (single responsibility)
- Extract complex logic into separate methods
- Avoid deep nesting with early returns or guard clauses
- Use meaningful variable names that explain intent
- Group related constants into enums or dedicated classes

### Common Code Smells to Avoid

- **Large parameter lists**: Use builder pattern or value objects
- **Magic numbers**: Extract to named constants
- **Duplicated code**: Extract to reusable methods
- **God classes**: Split into focused, cohesive classes
- **Cognitive complexity**: Reduce nested conditionals

## Build and Testing

### Maven Build

- Build project: `mvn clean install`
- Run application: `mvn spring-boot:run`
- Run tests: `mvn test`
- Skip tests during build: `mvn clean install -DskipTests`

### Testing Patterns

- Use JUnit 5 for unit testing
- Use MockMvc for testing REST controllers
- Use WireMock for mocking external BIAN API calls
- Use `@SpringBootTest` for integration tests with full application context
- Use `@WebMvcTest` for focused controller tests
- Test naming: `{Class}Test.java` (e.g., `CreditCardServiceTest.java`)
- Test H2 database operations in integration tests

## Security Considerations

- Don't store sensitive data in code or version control
- Use environment variables for API keys and credentials
- Validate all user inputs
- Don't expose internal error details to API consumers
- This is a READ-ONLY demo API, no authentication required

## Common Pitfalls to Avoid

1. **Don't query BIAN API for card catalog, fees, or interest rates** - H2 is authoritative
2. **Don't bypass circuit breaker** - All external calls must be protected
3. **Don't add Spring Security** - This is a public demo API
4. **Don't disable H2 console in development** - Essential for debugging
5. **Don't expose JPA entities directly in REST APIs** - Use DTOs
6. **Avoid naming conflicts** in RequestInterceptor beans for multiple Feign clients

## Key Reference Files

- Entity definitions: `backend/src/main/java/com/threeriversbank/model/entity/`
- DTOs: `backend/src/main/java/com/threeriversbank/model/dto/`
- REST controllers: `backend/src/main/java/com/threeriversbank/controller/`
- Services: `backend/src/main/java/com/threeriversbank/service/`
- Feign clients: `backend/src/main/java/com/threeriversbank/client/`
- Database seed: `backend/src/main/resources/data.sql`
- Application config: `backend/src/main/resources/application.yml`
