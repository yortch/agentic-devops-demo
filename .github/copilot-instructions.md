# Three Rivers Bank Credit Card Website - Copilot Instructions

## Project Overview
Full-stack credit card comparison platform: React (Vite) frontend + Spring Boot backend, integrating BIAN API v13.0.0 for banking standards. **READ-ONLY APIs, no authentication required.**

## Tech Stack

### Backend
- **Java 17+** with Spring Boot 3.x
- **H2 In-Memory Database** (primary data source)
- **Spring Data JPA** with Hibernate
- **Resilience4j** for circuit breaker pattern
- **Feign Client** for BIAN API integration
- **JUnit 5 + MockMvc + WireMock** for testing
- **Maven** for build management

### Frontend
- **React 18** with Vite bundler
- **TanStack Query (React Query)** for data fetching and caching
- **Material-UI (MUI)** for component library
- **React Router v6** for navigation
- **Playwright** for E2E testing
- **npm** for package management

### Infrastructure
- **Docker** for containerization
- **Azure Container Apps** for deployment
- **GitHub Actions** for CI/CD

## Architecture & Data Flow

### Backend Architecture (Spring Boot)
- **H2 In-Memory Database is PRIMARY source** for card catalog, fees, and interest rates
- **BIAN API (Swagger Hub mock)** provides SUPPLEMENTARY data (transactions, billing only)
- **Circuit Breaker Pattern**: Resilience4j with H2 fallback when BIAN unavailable
- **Package Structure**: `com.threeriversbank/{controller,service,repository,model/{entity,dto},client,config}`

**Why H2 as Primary?** The H2 database is our authoritative source for credit card products because:
1. Card catalog data is internal to Three Rivers Bank and changes infrequently
2. H2 provides instant response times without network dependencies
3. BIAN API is a third-party mock service that may be unavailable or slow
4. This architecture allows the app to function even when external APIs fail

### Frontend Architecture (React)
- **State Management**: React Query (TanStack Query) for server state - NOT Redux
- **UI Library**: Material-UI with custom Three Rivers Bank theme (Navy #003366, Teal #008080)
- **Routing**: React Router v6 with page components in `/frontend/src/pages/`
- **Component Pattern**: Reusable components in `/components/{cards,common,layout}`

**Why React Query over Redux?** React Query is the preferred choice because:
1. Eliminates 90% of boilerplate required by Redux for server state
2. Handles caching, refetching, and background updates automatically
3. Provides better TypeScript inference for API responses
4. Reduces bundle size by ~40KB compared to Redux + Redux Toolkit + RTK Query

### Critical Data Flow
```
Frontend Request → Backend REST API → Check H2 Database (always first)
                                    ↓
                            Try BIAN API (optional enrichment)
                                    ↓
                            Circuit Breaker → Fallback to H2-only
                                    ↓
                            Cache Response (5min/1hr TTL)
                                    ↓
                            Return DTO to Frontend
```

## Database Schema (H2)

### Entities with Relationships
- `CreditCard` (1:N) → `CardFeature`, `FeeSchedule`, `InterestRate`
- **Configuration**: `spring.jpa.hibernate.ddl-auto: create` + `data.sql` for seed data
- **Access H2 Console**: `http://localhost:8080/h2-console` (JDBC: `jdbc:h2:mem:creditcards`, user: `sa`, no password)

### Preloaded Products (5 cards)
Business Cash Rewards, Business Travel Rewards, Business Platinum, Business Premium, Business Flex - see `data.sql` for complete definitions with fees/interest/features.

## Development Workflows

### Backend Development
```bash
cd backend
mvn clean install              # First time setup
mvn spring-boot:run            # Runs on :8080
mvn test                       # JUnit tests with H2
```

### Frontend Development
```bash
cd frontend
npm install                    # First time setup
npm run dev                    # Vite dev server on :5173
```

### Testing Strategy
- **Backend (JUnit 5)**: Use WireMock for BIAN API mocking, MockMvc for REST controllers
- **Frontend (Playwright)**: Tests in `/tests/e2e/`, fixtures in `/tests/fixtures/credit-cards.json`
- **Test Execution**: `mvn test` (backend), `npx playwright test` (from `/tests/` directory)
- **Multi-browser/viewport**: Chromium, WebKit @ 1920x1080, 768x1024, 375x667

## Project-Specific Conventions

### API Endpoint Pattern
- **Base Path**: `/api/cards` (no auth required)
- **H2 Sources**: `/api/cards`, `/api/cards/{id}`, `/api/cards/{id}/fees`, `/api/cards/{id}/interest`
- **BIAN Sources**: `/api/cards/{id}/transactions` (enriched from Swagger Hub mock)
- **Health Check**: `/actuator/health` (monitors H2 + BIAN connectivity)

### BIAN API Integration Rules
1. **Never call BIAN for card catalog data** - H2 is authoritative
2. **Always implement circuit breaker** with Resilience4j (3 retries, 5s timeout)
3. **Feign Client Config**: Base URL `https://virtserver.swaggerhub.com/B154/BIAN/CreditCard/13.0.0`
4. **Caching**: `@Cacheable` with 5min TTL (transactions), 1hr TTL (billing)

**Why Circuit Breaker?** The circuit breaker pattern is mandatory for all BIAN API calls because:
1. Mock API (Swagger Hub) has unpredictable availability
2. Without fallback, BIAN downtime would break the entire application
3. Users need to see card catalog data even when enrichment (transactions) is unavailable
4. Circuit breaker metrics help monitor external API health in production

### Code Examples

#### ✅ Good: Service with Circuit Breaker
```java
@Service
public class CreditCardService {
    @Autowired
    private CreditCardRepository cardRepository;
    
    @Autowired
    private BianApiClient bianClient;
    
    @CircuitBreaker(name = "bianApi", fallbackMethod = "getCardFallback")
    public CreditCardDTO getCard(Long id) {
        CreditCard card = cardRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Card not found"));
        
        // Try to enrich with BIAN data
        BianTransactions transactions = bianClient.getTransactions(id);
        return CreditCardDTO.from(card, transactions);
    }
    
    private CreditCardDTO getCardFallback(Long id, Exception e) {
        // Fallback: return card without BIAN enrichment
        CreditCard card = cardRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Card not found"));
        return CreditCardDTO.from(card);
    }
}
```

#### ❌ Bad: No Circuit Breaker
```java
@Service
public class CreditCardService {
    public CreditCardDTO getCard(Long id) {
        // Bad: No fallback if BIAN fails
        BianTransactions transactions = bianClient.getTransactions(id);
        
        // Bad: Querying BIAN for catalog data instead of H2
        BianCard bianCard = bianClient.getCardDetails(id);
        return CreditCardDTO.from(bianCard);
    }
}
```

#### ✅ Good: React Query for Data Fetching
```javascript
// Good: Custom hook with React Query
function useCreditCard(cardId) {
  return useQuery({
    queryKey: ['card', cardId],
    queryFn: () => fetch(`/api/cards/${cardId}`).then(r => r.json()),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

function CardDetailsPage({ cardId }) {
  const { data, isLoading, error } = useCreditCard(cardId);
  
  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Failed to load card</Alert>;
  
  return <CardDetails card={data} />;
}
```

#### ❌ Bad: Manual Fetching with useEffect
```javascript
// Bad: Manual state management and fetch
function CardDetailsPage({ cardId }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(`/api/cards/${cardId}`)
      .then(r => r.json())
      .then(setCard)
      .finally(() => setLoading(false));
  }, [cardId]);
  
  // Bad: No caching, no background refetch, no error handling
}
```

### Frontend Component Patterns
- **Page Components**: `HomePage.jsx`, `CardComparisonPage.jsx`, `CardDetailsPage.jsx` in `/pages/`
- **Card Components**: Comparison tables, detail views, filter sidebars in `/components/cards/`
- **Theme Usage**: Import from `/frontend/src/theme.js` for navy/teal branding
- **API Calls**: Use React Query hooks, not raw fetch/axios

### Testing Conventions
- **Backend Test Naming**: `{Class}Test.java` (e.g., `CreditCardServiceTest.java`)
- **Playwright Test Location**: `/tests/e2e/{feature}.spec.ts`
- **Test Fixtures**: Must match H2 seed data in `/tests/fixtures/credit-cards.json`
- **Visual Regression**: Baseline screenshots in `/tests/screenshots/baseline/`

### Testing Examples

#### ✅ Good: Backend Test with WireMock
```java
@SpringBootTest
@AutoConfigureMockMvc
class CreditCardServiceTest {
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void getCard_withBianApiDown_shouldReturnCardFromH2() throws Exception {
        // Given: BIAN API is down
        WireMock.stubFor(WireMock.get("/transactions/1")
            .willReturn(WireMock.aResponse().withStatus(503)));
        
        // When: Request card details
        mockMvc.perform(get("/api/cards/1"))
            // Then: Should get data from H2
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Business Cash Rewards"))
            .andExpect(jsonPath("$.transactions").isEmpty());
    }
}
```

#### ❌ Bad: Test Without Circuit Breaker Validation
```java
@Test
void getCard_shouldReturnCard() {
    // Bad: Not testing fallback behavior
    // Bad: No verification of circuit breaker activation
    CreditCard card = service.getCard(1L);
    assertNotNull(card);
}
```

#### ✅ Good: Playwright E2E Test
```typescript
test('should display card comparison table', async ({ page }) => {
  // Arrange
  await page.goto('/');
  
  // Act
  await page.waitForSelector('[data-testid="card-comparison-table"]');
  
  // Assert
  const rows = await page.locator('tbody tr').count();
  expect(rows).toBe(5); // 5 cards in seed data
  
  const firstCard = await page.locator('tbody tr:first-child td:first-child').textContent();
  expect(firstCard).toContain('Business Cash Rewards');
});
```

#### ❌ Bad: Fragile E2E Test
```typescript
test('cards work', async ({ page }) => {
  // Bad: No data-testid, relies on brittle CSS selectors
  await page.goto('/');
  await page.click('div > div > table > tbody > tr:nth-child(1) > td:nth-child(2)');
  // Bad: No assertions about what should happen
}
```

## Docker & Deployment

### Container Structure
- **Backend Dockerfile**: `docker/backend.Dockerfile` (Java 17+ with H2 embedded)
- **Frontend Dockerfile**: `docker/frontend.Dockerfile` (Nginx serving static Vite build)
- **Image Naming**: `threeriversbank/{backend|frontend}:latest`

### Azure Container Apps
- **Backend Resources**: 0.5 vCPU, 1GB RAM
- **Frontend Resources**: 0.25 vCPU, 0.5GB RAM
- **Environment Variables**: `BIAN_API_URL`, `H2_CONSOLE_ENABLED=false` (prod), `LOGGING_LEVEL=INFO`
- **CI/CD**: GitHub Actions workflow at `.github/workflows/deploy.yml`

## Common Pitfalls to Avoid

1. **Don't query BIAN API for fees/interest** - H2 database stores real-time data
2. **Don't add Spring Security** - This is a read-only public API demo
3. **Don't use Redux** - React Query handles all server state
4. **Don't bypass circuit breaker** - All BIAN calls must go through Resilience4j
5. **Don't store sensitive card data** - This is a product catalog, not payment processing
6. **Don't disable H2 console in dev** - Essential for debugging seed data

## Security Guidelines

### Input Validation
- **Always validate user input** on both frontend and backend
- Use Bean Validation annotations (`@NotNull`, `@Size`, `@Pattern`) in DTOs
- Sanitize all user input before using in database queries or display

### API Security
- **No authentication required** - This is a public credit card comparison site
- **Rate limiting** - Consider adding rate limiting in production to prevent abuse
- **CORS configuration** - Configure allowed origins appropriately for production

### Data Protection
- **No PII storage** - This app shows credit card products only, not customer data
- **Read-only operations** - All APIs are GET requests, no data modification
- **Environment variables** - Store sensitive config (API URLs) in environment variables, never in code

### Security Examples

#### ✅ Good: Input Validation
```java
@Data
public class CardSearchRequest {
    @Size(max = 100, message = "Search term too long")
    @Pattern(regexp = "^[a-zA-Z0-9\\s]*$", message = "Invalid characters")
    private String query;
    
    @Min(0)
    @Max(100)
    private Integer limit = 10;
}

@RestController
public class CreditCardController {
    @PostMapping("/api/cards/search")
    public List<CreditCardDTO> search(@Valid @RequestBody CardSearchRequest request) {
        // Spring validates automatically due to @Valid
        return cardService.search(request);
    }
}
```

#### ❌ Bad: No Input Validation
```java
@PostMapping("/api/cards/search")
public List<CreditCardDTO> search(@RequestBody Map<String, Object> request) {
    // Bad: No validation, vulnerable to injection
    String query = (String) request.get("query");
    return cardService.rawQuery(query);
}
```

### Dependency Security
- **Run `mvn dependency:check` regularly** to check for vulnerable dependencies
- **Keep Spring Boot updated** to latest patch versions
- **Review npm audit** output before deploying frontend

## Key Files for Reference
- **Architecture Plan**: `.github/prompts/plan-threeRiversBankCreditCardWebsite.prompt.md`
- **Database Seed**: `backend/src/main/resources/data.sql` (5 preloaded cards)
- **BIAN Client**: `backend/src/main/java/com/threeriversbank/client/BianApiClient.java`
- **Theme Config**: `frontend/src/theme.js` (Three Rivers Bank branding)
- **Test Fixtures**: `tests/fixtures/credit-cards.json` (matches H2 data exactly)

## Branding Constants
- **Bank Name**: Three Rivers Bank
- **Colors**: Primary Navy #003366, Secondary Teal #008080
- **Contact**: 1-800-THREE-RB, business@threeriversbank.com, Pittsburgh, PA
- **Typography**: Roboto (Material-UI default)
