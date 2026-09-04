---
description: "JUnit 5 + Mockito testing skill for Three Rivers Bank backend"
---
<!-- Adapted from https://github.com/github/awesome-copilot/blob/main/skills/java-junit/SKILL.md -->

# JUnit 5 Best Practices — Three Rivers Bank

Generate or review JUnit 5 tests following the conventions below.

## Test Class Setup

```java
@ExtendWith(MockitoExtension.class)
class CreditCardServiceTest {

    @Mock
    private CreditCardRepository creditCardRepository;

    @InjectMocks
    private CreditCardService creditCardService;
}
```

## Test Naming Convention

Use the pattern: `methodName_should_expectedBehavior_when_scenario`

```java
@Test
void findById_should_returnCard_when_idExists() { ... }

@Test
void findById_should_throwException_when_idNotFound() { ... }
```

## Arrange-Act-Assert (AAA) Pattern

Every test method must follow AAA with blank-line separation:

```java
@Test
void findById_should_returnCardDto_when_idExists() {
    // Arrange
    CreditCard card = new CreditCard(1L, "Business Cash Rewards", "CASHBACK");
    given(creditCardRepository.findById(1L)).willReturn(Optional.of(card));

    // Act
    CreditCardDto result = creditCardService.findById(1L);

    // Assert
    assertThat(result.id()).isEqualTo(1L);
    assertThat(result.name()).isEqualTo("Business Cash Rewards");
}
```

## Controller Tests — `@WebMvcTest`

```java
@WebMvcTest(CreditCardController.class)
class CreditCardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CreditCardService creditCardService;

    @Test
    void getCard_should_return200_when_idExists() throws Exception {
        given(creditCardService.findById(1L))
            .willReturn(new CreditCardDto(1L, "Business Cash Rewards", "CASHBACK"));

        mockMvc.perform(get("/api/cards/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.name").value("Business Cash Rewards"));
    }
}
```

## Repository Tests — `@DataJpaTest`

```java
@DataJpaTest
class CreditCardRepositoryTest {

    @Autowired
    private CreditCardRepository creditCardRepository;

    @Test
    void findByType_should_returnCards_when_typeExists() {
        // H2 is pre-loaded via data.sql
        List<CreditCard> cards = creditCardRepository.findByType("CASHBACK");
        assertThat(cards).isNotEmpty();
    }
}
```

## WireMock for BIAN API Mocking

Use WireMock to mock the BIAN API — never call the real API in tests:

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWireMock(port = 0)
class BianIntegrationTest {

    @Test
    void getTransactions_should_returnData_when_bianApiResponds() {
        stubFor(get(urlEqualTo("/api/cards/1/transactions"))
            .willReturn(aResponse()
                .withStatus(200)
                .withHeader("Content-Type", "application/json")
                .withBodyFile("bian-transactions.json")));

        // Act and Assert...
    }
}
```

## Import Rule

Always use explicit JUnit/AssertJ imports:
```java
import org.junit.jupiter.api.Test;
import org.assertj.core.api.Assertions.assertThat;
// ❌ Never: import org.assertj.core.api.*;
```
