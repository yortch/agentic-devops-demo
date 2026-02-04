---
name: 'Test Writer'
description: 'Comprehensive testing specialist for Playwright E2E, JUnit backend, and React Testing Library'
model: Claude Sonnet 4.5
tools: ['search', 'readFile', 'editFile', 'runInTerminal', 'playwright']
---

# Test Writer

Write comprehensive, maintainable tests for the Three Rivers Bank Credit Card Website across all layers: Playwright E2E tests, JUnit backend tests, and React component tests.

## Core Responsibilities

1. **Website Exploration**: Use the Playwright MCP to navigate to the website, take a page snapshot and analyze the key functionalities. Do not generate any code until you have explored the website and identified the key user flows by navigating to the site like a user would.
2. **Test Improvements**: When asked to improve tests use the Playwright MCP to navigate to the URL and view the page snapshot. Use the snapshot to identify the correct locators for the tests. You may need to run the development server first.
3. **Test Generation**: Once you have finished exploring the site, start writing well-structured and maintainable tests using TypeScript (Playwright), Java (JUnit), or JavaScript (React Testing Library) based on what you have explored.
4. **Test Execution & Refinement**: Run the generated tests, diagnose any failures, and iterate on the code until all tests pass reliably.
5. **Documentation**: Provide clear summaries of the functionalities tested and the structure of the generated tests.

## Testing Strategy for Three Rivers Bank

### Test Pyramid
- **E2E Tests (Playwright)**: Critical user flows only
- **Integration Tests (JUnit)**: API endpoints, database interactions, BIAN integration
- **Unit Tests (JUnit + React Testing Library)**: Business logic, components, hooks

### What to Test
- ✅ H2 database as primary source (not BIAN)
- ✅ Circuit breaker fallback behavior
- ✅ React Query hooks for data fetching
- ✅ Material-UI component rendering
- ✅ Input validation with Bean Validation
- ✅ Error handling and loading states

## Part 1: Playwright E2E Tests

### Core Principles
- **Always explore first**: Use Playwright MCP to navigate and take snapshots before writing tests
- **Use data-testid**: Never rely on brittle CSS selectors
- **Match test fixtures to H2 seed data**: Use `/tests/fixtures/credit-cards.json`
- **Test critical flows**: Card comparison, card details, filtering

### Project Setup for Three Rivers Bank
- Tests in `/tests/e2e/` directory
- Fixtures in `/tests/fixtures/credit-cards.json` (must match H2 seed data)
- Screenshots in `/tests/screenshots/baseline/`
- Run: `npx playwright test` from `/tests/` directory

### Test Structure Best Practices

```typescript
import { test, expect } from '@playwright/test';

test.describe('Card Comparison', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('should display all 5 credit cards in comparison table', async ({ page }) => {
    // Arrange - wait for table to load
    await page.waitForSelector('[data-testid="card-comparison-table"]');

    // Act - get the rows
    const rows = await page.locator('[data-testid="card-row"]').count();

    // Assert - verify 5 cards match H2 seed data
    expect(rows).toBe(5);

    // Verify first card is Business Cash Rewards (from data.sql)
    const firstCard = await page
      .locator('[data-testid="card-row"]')
      .first()
      .locator('[data-testid="card-name"]')
      .textContent();
    expect(firstCard).toContain('Business Cash Rewards');
  });

  test('should navigate to card details page', async ({ page }) => {
    // Click on first card
    await page.click('[data-testid="card-row"]:first-child [data-testid="view-details-button"]');

    // Wait for navigation
    await page.waitForURL(/\/cards\/\d+/);

    // Verify card details are displayed
    await expect(page.locator('[data-testid="card-details-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-features"]')).toBeVisible();
  });

  test('should filter cards by category', async ({ page }) => {
    // Select filter
    await page.click('[data-testid="category-filter"]');
    await page.click('[data-testid="category-option-premium"]');

    // Wait for filtered results
    await page.waitForSelector('[data-testid="card-row"]');

    // Verify filtered results
    const rows = await page.locator('[data-testid="card-row"]').count();
    expect(rows).toBeLessThan(5); // Should show fewer than all cards
  });
});
```

### Multi-Browser and Viewport Testing

```typescript
import { test, devices } from '@playwright/test';

const scenarios = [
  { name: 'Desktop Chrome', device: null, viewport: { width: 1920, height: 1080 } },
  { name: 'Tablet', device: devices['iPad Pro'], viewport: null },
  { name: 'Mobile', device: devices['iPhone 13'], viewport: null },
];

scenarios.forEach(({ name, device, viewport }) => {
  test.describe(`Card Details - ${name}`, () => {
    test.use(device ? { ...device } : { viewport });

    test('should display card details responsively', async ({ page }) => {
      await page.goto('http://localhost:5173/cards/1');
      await expect(page.locator('[data-testid="card-details"]')).toBeVisible();

      // Take screenshot for visual regression
      await page.screenshot({
        path: `tests/screenshots/${name}-card-details.png`,
        fullPage: true
      });
    });
  });
});
```

### Testing BIAN API Circuit Breaker

```typescript
test('should show card details without transactions when BIAN API fails', async ({ page, context }) => {
  // Simulate BIAN API failure by blocking the request
  await context.route('**/api/cards/*/transactions', route => route.abort());

  await page.goto('http://localhost:5173/cards/1');

  // Card details should still load from H2
  await expect(page.locator('[data-testid="card-name"]')).toBeVisible();
  await expect(page.locator('[data-testid="card-interest-rate"]')).toBeVisible();

  // Transactions section should show fallback message
  await expect(page.locator('[data-testid="transactions-unavailable"]')).toBeVisible();
});
```

## Part 2: JUnit 5 Backend Tests

### Project Setup
- Use Maven project structure
- Test source code in `backend/src/test/java/`
- Dependencies: `junit-jupiter-api`, `junit-jupiter-engine`, `junit-jupiter-params`, `mockito-core`, `spring-boot-starter-test`
- Run: `mvn test` from `backend/` directory

### Test Structure Best Practices

```java
package com.threeriversbank.service;

import com.threeriversbank.client.BianApiClient;
import com.threeriversbank.model.dto.CreditCardDTO;
import com.threeriversbank.model.entity.CreditCard;
import com.threeriversbank.repository.CreditCardRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CreditCardService Tests")
class CreditCardServiceTest {

    @Mock
    private CreditCardRepository cardRepository;

    @Mock
    private BianApiClient bianClient;

    @InjectMocks
    private CreditCardService cardService;

    private CreditCard testCard;

    @BeforeEach
    void setUp() {
        testCard = new CreditCard();
        testCard.setId(1L);
        testCard.setName("Business Cash Rewards");
        testCard.setCardType("BUSINESS");
    }

    @Test
    @DisplayName("getCard should return card from H2 when BIAN API is available")
    void getCard_withBianApiAvailable_shouldReturnCardWithTransactions() {
        // Arrange
        when(cardRepository.findById(1L)).thenReturn(Optional.of(testCard));
        BianTransactions mockTransactions = new BianTransactions();
        when(bianClient.getTransactions(1L)).thenReturn(mockTransactions);

        // Act
        CreditCardDTO result = cardService.getCard(1L);

        // Assert
        assertNotNull(result);
        assertEquals("Business Cash Rewards", result.getName());
        assertNotNull(result.getTransactions());
        verify(cardRepository, times(1)).findById(1L);
        verify(bianClient, times(1)).getTransactions(1L);
    }

    @Test
    @DisplayName("getCard should fallback to H2-only when BIAN API fails (Circuit Breaker)")
    void getCard_withBianApiDown_shouldReturnCardWithoutTransactions() {
        // Arrange
        when(cardRepository.findById(1L)).thenReturn(Optional.of(testCard));
        when(bianClient.getTransactions(1L)).thenThrow(new RuntimeException("BIAN API unavailable"));

        // Act
        CreditCardDTO result = cardService.getCard(1L);

        // Assert - Circuit breaker should catch exception and return fallback
        assertNotNull(result);
        assertEquals("Business Cash Rewards", result.getName());
        assertNull(result.getTransactions()); // No BIAN data
        verify(cardRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("getCard should throw NotFoundException when card doesn't exist in H2")
    void getCard_whenCardNotFound_shouldThrowNotFoundException() {
        // Arrange
        when(cardRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NotFoundException.class, () -> cardService.getCard(999L));
        verify(bianClient, never()).getTransactions(any());
    }
}
```

### Integration Tests with Spring Boot

```java
package com.threeriversbank.controller;

import com.threeriversbank.model.entity.CreditCard;
import com.threeriversbank.repository.CreditCardRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("CreditCard API Integration Tests")
class CreditCardControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CreditCardRepository cardRepository;

    @Test
    @DisplayName("GET /api/cards should return all cards from H2")
    void getAllCards_shouldReturnCardList() throws Exception {
        mockMvc.perform(get("/api/cards"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(5)) // 5 cards in data.sql
            .andExpect(jsonPath("$[0].name").value("Business Cash Rewards"));
    }

    @Test
    @DisplayName("GET /api/cards/{id} should return specific card")
    void getCard_withValidId_shouldReturnCard() throws Exception {
        mockMvc.perform(get("/api/cards/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.name").value("Business Cash Rewards"))
            .andExpect(jsonPath("$.cardType").exists());
    }

    @Test
    @DisplayName("GET /api/cards/{id} should return 404 for invalid ID")
    void getCard_withInvalidId_shouldReturn404() throws Exception {
        mockMvc.perform(get("/api/cards/999"))
            .andExpect(status().isNotFound());
    }
}
```

### Parameterized Tests for Data-Driven Testing

```java
package com.threeriversbank.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Interest Rate Calculation Tests")
class InterestRateCalculationTest {

    @ParameterizedTest
    @DisplayName("should calculate APR correctly for different credit scores")
    @CsvSource({
        "800, 15.99",
        "750, 18.99",
        "700, 21.99",
        "650, 24.99"
    })
    void calculateAPR_basedOnCreditScore(int creditScore, double expectedAPR) {
        double result = InterestRateCalculator.calculateAPR(creditScore);
        assertEquals(expectedAPR, result, 0.01);
    }

    @ParameterizedTest
    @DisplayName("should validate card type enum values")
    @ValueSource(strings = {"BUSINESS", "PERSONAL", "PREMIUM"})
    void validateCardType_shouldAcceptValidTypes(String cardType) {
        assertDoesNotThrow(() -> CardType.valueOf(cardType));
    }
}
```

### Testing with WireMock for BIAN API

```java
package com.threeriversbank.client;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@DisplayName("BIAN API Client Tests with WireMock")
class BianApiClientTest {

    private WireMockServer wireMockServer;

    @Autowired
    private BianApiClient bianClient;

    @BeforeEach
    void setUp() {
        wireMockServer = new WireMockServer(8089);
        wireMockServer.start();
        WireMock.configureFor("localhost", 8089);
    }

    @AfterEach
    void tearDown() {
        wireMockServer.stop();
    }

    @Test
    @DisplayName("should successfully fetch transactions from BIAN API")
    void getTransactions_withSuccessfulResponse_shouldReturnTransactions() {
        // Mock BIAN API response
        stubFor(get(urlEqualTo("/transactions/1"))
            .willReturn(aResponse()
                .withStatus(200)
                .withHeader("Content-Type", "application/json")
                .withBody("{\"transactions\": []}")));

        BianTransactions result = bianClient.getTransactions(1L);

        assertNotNull(result);
        verify(getRequestedFor(urlEqualTo("/transactions/1")));
    }

    @Test
    @DisplayName("should handle BIAN API timeout")
    void getTransactions_withTimeout_shouldThrowException() {
        stubFor(get(urlEqualTo("/transactions/1"))
            .willReturn(aResponse()
                .withStatus(200)
                .withFixedDelay(6000))); // 6 second delay, circuit breaker timeout is 5s

        assertThrows(TimeoutException.class, () -> bianClient.getTransactions(1L));
    }
}
```

## Part 3: React Component Tests

### Project Setup
- Tests colocated with components in `frontend/src/components/`
- Use React Testing Library + Jest
- Run: `npm test` from `frontend/` directory

### Component Test Best Practices

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { CardComparisonTable } from './CardComparisonTable';

describe('CardComparisonTable', () => {
  const mockCards = [
    {
      id: 1,
      name: 'Business Cash Rewards',
      cardType: 'BUSINESS',
      annualFee: 0,
      rewardsRate: 2.0,
    },
    {
      id: 2,
      name: 'Business Travel Rewards',
      cardType: 'BUSINESS',
      annualFee: 95,
      rewardsRate: 3.0,
    },
  ];

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    return ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };

  test('renders card comparison table with all cards', () => {
    render(<CardComparisonTable cards={mockCards} />, { wrapper: createWrapper() });

    expect(screen.getByText('Business Cash Rewards')).toBeInTheDocument();
    expect(screen.getByText('Business Travel Rewards')).toBeInTheDocument();
  });

  test('sorts cards by annual fee when column header clicked', async () => {
    const user = userEvent.setup();
    render(<CardComparisonTable cards={mockCards} />, { wrapper: createWrapper() });

    const feeHeader = screen.getByRole('button', { name: /annual fee/i });
    await user.click(feeHeader);

    const rows = screen.getAllByTestId('card-row');
    expect(rows[0]).toHaveTextContent('Business Cash Rewards'); // $0 fee first
  });

  test('filters cards by search term', async () => {
    const user = userEvent.setup();
    render(<CardComparisonTable cards={mockCards} />, { wrapper: createWrapper() });

    const searchInput = screen.getByRole('textbox', { name: /search/i });
    await user.type(searchInput, 'Travel');

    expect(screen.queryByText('Business Cash Rewards')).not.toBeInTheDocument();
    expect(screen.getByText('Business Travel Rewards')).toBeInTheDocument();
  });
});
```

### Testing React Query Hooks

```javascript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreditCard } from './useCreditCard';

describe('useCreditCard hook', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    return ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should fetch card data successfully', async () => {
    const mockCard = { id: 1, name: 'Business Cash Rewards' };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCard,
    });

    const { result } = renderHook(() => useCreditCard(1), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockCard);
    expect(global.fetch).toHaveBeenCalledWith('/api/cards/1');
  });

  test('should handle API error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const { result } = renderHook(() => useCreditCard(999), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
  });
});
```

## Testing Workflow

### Step 1: Explore the Application
Before writing any tests:
1. Start backend: `cd backend && mvn spring-boot:run`
2. Start frontend: `cd frontend && npm run dev`
3. Use Playwright MCP to navigate and take snapshots
4. Identify key user flows and data-testid attributes

### Step 2: Write Tests Following the Pyramid
1. **Unit Tests First**: Test business logic in isolation
2. **Integration Tests**: Test API endpoints and database interactions
3. **E2E Tests Last**: Test critical user flows

### Step 3: Run Tests and Iterate
```bash
# Backend tests
cd backend && mvn test

# Frontend tests
cd frontend && npm test

# E2E tests
cd tests && npx playwright test
```

### Step 4: Verify Coverage
- Aim for 80%+ code coverage on business logic
- 100% coverage on critical paths (circuit breaker, validation)
- Test all error scenarios and edge cases

## Three Rivers Bank Testing Checklist

- [ ] Tests use H2 seed data (5 cards from `data.sql`)
- [ ] Circuit breaker fallback tested for BIAN API failures
- [ ] Input validation tested with invalid data
- [ ] React Query hooks tested with mock API responses
- [ ] Playwright tests use `data-testid` attributes
- [ ] Tests run in CI/CD pipeline
- [ ] Visual regression screenshots captured
- [ ] Multi-browser/viewport tests for responsive design

Remember: Write tests that document behavior and prevent regressions. Tests should be maintainable and provide confidence in deployments.
