---
description: "Spring Boot best practices skill for Three Rivers Bank backend development"
---
<!-- Adapted from https://github.com/github/awesome-copilot/blob/main/skills/java-springboot/SKILL.md -->

# Spring Boot Best Practices — Three Rivers Bank

Generate or review Spring Boot code following the conventions below.

## Project-Specific Context

- **Package structure**: `com.threeriversbank/{controller,service,repository,model/{entity,dto},client,config}`
- **Database**: H2 in-memory database is the PRIMARY data source; BIAN API is supplementary only
- **Circuit Breaker**: Resilience4j wraps all BIAN API calls (via OpenFeign client)
- **Configuration file**: `application.yml` (not `.properties`)

## Dependency Injection

Always use constructor injection with `private final` fields:

```java
@Service
public class CreditCardService {
    private final CreditCardRepository creditCardRepository;

    public CreditCardService(CreditCardRepository creditCardRepository) {
        this.creditCardRepository = creditCardRepository;
    }
}
```

## DTO Pattern

Never expose JPA entities in API responses. Use dedicated DTO classes:

```java
// Entity (model/entity)
@Entity
public class CreditCard { ... }

// DTO (model/dto)
public record CreditCardDto(Long id, String name, String type) {}

// Controller returns DTO
@GetMapping("/{id}")
public ResponseEntity<CreditCardDto> getCard(@PathVariable Long id) {
    return ResponseEntity.ok(creditCardService.findById(id));
}
```

## Validation

Apply Bean Validation on DTO input parameters:

```java
public record CreateCardRequest(
    @NotBlank String name,
    @NotNull @Positive BigDecimal creditLimit
) {}

@PostMapping
public ResponseEntity<CreditCardDto> create(@Valid @RequestBody CreateCardRequest request) { ... }
```

## Global Exception Handling

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse(ex.getMessage()));
    }
}
```

## Resilience4j / BIAN Circuit Breaker

All BIAN API calls must use the circuit breaker pattern:

```java
@CircuitBreaker(name = "bianApi", fallbackMethod = "fallbackTransactions")
public List<TransactionDto> getTransactions(Long cardId) {
    return bianApiClient.getTransactions(cardId);
}

public List<TransactionDto> fallbackTransactions(Long cardId, Exception ex) {
    log.warn("BIAN API unavailable for cardId={}, using fallback: {}", cardId, ex.getMessage());
    return Collections.emptyList();
}
```

## Logging

Use SLF4J with parameterized messages:

```java
private static final Logger log = LoggerFactory.getLogger(CreditCardService.class);

log.info("Fetching credit card id={}", id);
log.error("Failed to fetch card id={}: {}", id, ex.getMessage());
```

## Configuration Properties

```java
@ConfigurationProperties(prefix = "bian.api")
public record BianApiProperties(String baseUrl, int timeout, int retries) {}
```

## Import Rule

**Never use wildcard imports.** Always use explicit imports:
```java
// ✅ Correct
import java.util.List;
import java.util.Map;

// ❌ Wrong
import java.util.*;
```
