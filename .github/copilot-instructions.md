# Copilot Instructions for Three Rivers Bank Credit Card Website

## Project Overview
This is a full-stack business credit card comparison platform for Three Rivers Bank. The application demonstrates modern banking software architecture with resilient API integration patterns. We prioritize reliability and clear separation of concerns over cutting-edge experimental features.

## Tech Stack

### Backend
- **Spring Boot 3.2.0** with Java 17
- **H2 In-Memory Database** (primary data source)
- **Spring Data JPA** with Hibernate
- **OpenFeign** for HTTP clients (BIAN API integration)
- **Resilience4j** for circuit breaker patterns
- **Spring Cache Abstraction** (5min/1hr TTL)
- **SpringDoc OpenAPI** for API documentation
- **Lombok** for boilerplate reduction
- **Maven** for dependency management

### Frontend
- **React 19.2** (functional components only)
- **Vite 7.x** for build tooling
- **React Router v7** for navigation
- **TanStack Query** for server state management
- **Material-UI (MUI) v7** for UI components
- **Axios** for HTTP client
- **ESLint** with React Hooks plugin

### Infrastructure
- **Docker** multi-stage builds (Alpine-based)
- **Nginx** for serving frontend in production
- **Azure Container Apps** deployment target
- **GitHub Actions** for CI/CD
- **Playwright** for E2E testing

## Architecture Principles

### Data Flow (Critical Path)
```
Frontend → Backend REST API → H2 Database (always first)
                             ↓
                     BIAN API (optional enrichment)
                             ↓
                     Circuit Breaker → H2 fallback
                             ↓
                     Cache Response
                             ↓
                     Return DTO
```

**Why:** H2 contains our product catalog (the source of truth). BIAN API provides supplementary transaction/billing data but may be unreliable. This pattern ensures the application remains functional even when external APIs fail.

### Backend Package Structure
```
com.threeriversbank/
├── controller/          # REST endpoints (thin layer)
├── service/             # Business logic
├── repository/          # JPA repositories
├── model/
│   ├── entity/         # JPA entities
│   └── dto/            # Data transfer objects
├── client/             # Feign clients for external APIs
└── config/             # Spring configuration classes
```

**Why:** Clear separation of concerns. Controllers handle HTTP, services contain business logic, repositories abstract database access. DTOs prevent entity leakage to API consumers.

## Code Style

### Java/Spring Boot Patterns

#### Use Lombok Annotations
✅ **Good:**
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditCardDto {
    private Long id;
    private String name;
    private BigDecimal annualFee;
}
```

❌ **Avoid:**
```java
public class CreditCardDto {
    private Long id;
    private String name;
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    // ... manual getters/setters
}
```

**Why:** Lombok reduces boilerplate by 60-80% in our DTOs and entities. Our build pipeline already includes the Lombok processor.

#### Controller Best Practices
✅ **Good:**
```java
@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Credit Cards", description = "Three Rivers Bank Business Credit Card API")
public class CreditCardController {
    
    private final CreditCardService creditCardService;
    
    @GetMapping("/{id}")
    @Operation(summary = "Get credit card by ID")
    public ResponseEntity<CreditCardDto> getCardById(@PathVariable Long id) {
        log.info("GET /api/cards/{}", id);
        CreditCardDto card = creditCardService.getCreditCardById(id);
        return ResponseEntity.ok(card);
    }
}
```

❌ **Avoid:**
```java
@RestController
public class CreditCardController {
    
    @Autowired
    private CreditCardService creditCardService;
    
    @GetMapping("/api/cards/{id}")
    public CreditCardDto getCardById(@PathVariable Long id) {
        // No logging, no OpenAPI annotations, no ResponseEntity wrapper
        return creditCardService.getCreditCardById(id);
    }
}
```

**Why:** 
- `@RequiredArgsConstructor` with final fields is preferred over `@Autowired`
- Centralized `@RequestMapping` avoids repetitive path prefixes
- `ResponseEntity<T>` provides explicit HTTP semantics
- `@Operation` generates accurate OpenAPI docs at `/swagger-ui.html`
- Logging helps trace requests in production (Azure Container Apps logs)

#### Service Layer with Resilience
✅ **Good:**
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class CreditCardService {
    
    private final CreditCardRepository creditCardRepository;
    private final BianApiClient bianApiClient;
    
    @Cacheable(value = "transactions", key = "#cardId")
    @CircuitBreaker(name = "bianApi", fallbackMethod = "getTransactionsFallback")
    @Retry(name = "bianApi")
    public List<TransactionDto> getCardTransactions(Long cardId) {
        log.info("Fetching transactions for card id: {} from BIAN API", cardId);
        // Primary: Try BIAN API
        return fetchFromBianApi(cardId);
    }
    
    public List<TransactionDto> getTransactionsFallback(Long cardId, Exception ex) {
        log.warn("Using fallback for card id: {} due to: {}", cardId, ex.getMessage());
        // Fallback: Return H2 data or mock data
        return getSampleTransactions(cardId);
    }
}
```

❌ **Avoid:**
```java
@Service
public class CreditCardService {
    
    @Autowired
    private BianApiClient bianApiClient;
    
    public List<TransactionDto> getCardTransactions(Long cardId) {
        // No circuit breaker, no fallback, no caching
        return bianApiClient.getTransactions(cardId);
    }
}
```

**Why:** External APIs (like BIAN Swagger Hub mock) may timeout or fail. Circuit breaker prevents cascading failures. Fallback ensures user-facing features remain functional. Caching reduces external API calls and improves response times.

#### Repository Pattern
✅ **Good:**
```java
@Repository
public interface CreditCardRepository extends JpaRepository<CreditCard, Long> {
    
    @Query("SELECT c FROM CreditCard c LEFT JOIN FETCH c.features WHERE c.id = :id")
    Optional<CreditCard> findByIdWithFeatures(@Param("id") Long id);
    
    List<CreditCard> findByAnnualFeeLessThan(BigDecimal maxFee);
}
```

❌ **Avoid:**
```java
@Repository
public class CreditCardRepository {
    
    @PersistenceContext
    private EntityManager entityManager;
    
    public CreditCard findById(Long id) {
        return entityManager.find(CreditCard.class, id);
        // Manual entity management - use Spring Data JPA instead
    }
}
```

**Why:** Spring Data JPA repositories eliminate boilerplate. `JpaRepository` provides CRUD operations out of the box. Custom queries use `@Query` for optimization (e.g., JOIN FETCH prevents N+1 queries).

#### Entity Relationships
✅ **Good:**
```java
@Entity
@Table(name = "credit_cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditCard {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @OneToMany(mappedBy = "creditCard", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CardFeature> features = new ArrayList<>();
    
    @OneToMany(mappedBy = "creditCard", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<FeeSchedule> fees = new ArrayList<>();
}
```

❌ **Avoid:**
```java
@Entity
public class CreditCard {
    @Id
    private Long id;
    
    @OneToMany(fetch = FetchType.EAGER)  // Eager loading causes performance issues
    private List<CardFeature> features;
    
    // Missing @Table, cascade, mappedBy
}
```

**Why:** 
- `FetchType.LAZY` prevents unnecessary joins when features aren't needed
- `cascade = CascadeType.ALL` ensures child entities are saved/deleted with parent
- `mappedBy` defines bidirectional relationship ownership
- Explicit `@Table` names prevent conflicts

### React/Frontend Patterns

#### Component Structure (Functional Components)
✅ **Good:**
```jsx
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { fetchCreditCards } from '../api/creditCardApi';

export default function CardList() {
    const { data: cards, isLoading, error } = useQuery({
        queryKey: ['creditCards'],
        queryFn: fetchCreditCards,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
    
    if (isLoading) return <CircularProgress />;
    if (error) return <Typography color="error">Error: {error.message}</Typography>;
    
    return (
        <div>
            {cards.map(card => (
                <Card key={card.id}>
                    <CardContent>
                        <Typography variant="h5">{card.name}</Typography>
                        <Typography>Annual Fee: ${card.annualFee}</Typography>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
```

❌ **Avoid:**
```jsx
import React, { Component } from 'react';
import axios from 'axios';

// Don't use class components
class CardList extends Component {
    state = { cards: [], loading: true };
    
    componentDidMount() {
        axios.get('/api/cards').then(res => {
            this.setState({ cards: res.data, loading: false });
        });
    }
    
    render() {
        return <div>{/* ... */}</div>;
    }
}
```

**Why:** 
- Functional components with hooks are modern React standard
- React Query handles caching, refetching, and loading states automatically
- Eliminates manual state management for server data
- `staleTime` prevents unnecessary API calls

#### API Integration with React Query
✅ **Good:**
```jsx
// api/creditCardApi.js
import axios from 'axios';

const API_BASE = '/api/cards';

export const fetchCreditCards = async () => {
    const { data } = await axios.get(API_BASE);
    return data;
};

export const fetchCreditCardById = async (id) => {
    const { data } = await axios.get(`${API_BASE}/${id}`);
    return data;
};

// In component:
const { data, isLoading } = useQuery({
    queryKey: ['creditCard', cardId],
    queryFn: () => fetchCreditCardById(cardId),
});
```

❌ **Avoid:**
```jsx
// Don't use raw fetch/axios in components
function CardDetails({ cardId }) {
    const [card, setCard] = useState(null);
    
    useEffect(() => {
        fetch(`/api/cards/${cardId}`)
            .then(res => res.json())
            .then(setCard);
    }, [cardId]);
    
    // Manual loading state, no caching, no error handling
}
```

**Why:** Centralized API functions promote reusability. React Query provides caching, automatic refetching, and optimistic updates. Reduces component complexity.

#### Material-UI Theming
✅ **Good:**
```jsx
// theme.js
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        primary: { main: '#003366' },  // Three Rivers Bank Navy
        secondary: { main: '#008080' }, // Teal
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
    },
});

// App.jsx
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';

function App() {
    return (
        <ThemeProvider theme={theme}>
            {/* Your app */}
        </ThemeProvider>
    );
}
```

❌ **Avoid:**
```jsx
// Don't hardcode colors in components
function Header() {
    return (
        <AppBar style={{ backgroundColor: '#003366' }}>
            {/* Inline styles bypass theme */}
        </AppBar>
    );
}
```

**Why:** Centralized theme ensures brand consistency. Theme values are accessible via `theme.palette.primary.main` throughout the app. Easier to maintain and update colors.

#### Routing with React Router v7
✅ **Good:**
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CardDetailsPage from './pages/CardDetailsPage';
import CardComparisonPage from './pages/CardComparisonPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/cards/:id" element={<CardDetailsPage />} />
                <Route path="/compare" element={<CardComparisonPage />} />
            </Routes>
        </BrowserRouter>
    );
}
```

❌ **Avoid:**
```jsx
// Don't use old v5 syntax
import { Switch, Route } from 'react-router-dom';

function App() {
    return (
        <Switch>
            <Route exact path="/" component={HomePage} />
            {/* v5 syntax is deprecated */}
        </Switch>
    );
}
```

**Why:** React Router v7 uses `<Routes>` and `element` prop. This syntax supports better TypeScript integration and nested routes.

## Testing Guidelines

### Backend Testing (JUnit 5)

#### Controller Tests with MockMvc
✅ **Good:**
```java
@WebMvcTest(CreditCardController.class)
class CreditCardControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private CreditCardService creditCardService;
    
    @Test
    void getCardById_ReturnsCard_WhenCardExists() throws Exception {
        CreditCardDto mockCard = CreditCardDto.builder()
            .id(1L)
            .name("Business Cash Rewards")
            .annualFee(new BigDecimal("95.00"))
            .build();
        
        when(creditCardService.getCreditCardById(1L)).thenReturn(mockCard);
        
        mockMvc.perform(get("/api/cards/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.name").value("Business Cash Rewards"));
    }
}
```

**Why:** `@WebMvcTest` loads only web layer (faster than `@SpringBootTest`). MockMvc tests HTTP layer without starting server. `@MockBean` isolates controller from service layer.

#### Service Tests with Mocked Dependencies
✅ **Good:**
```java
@ExtendWith(MockitoExtension.class)
class CreditCardServiceTest {
    
    @Mock
    private CreditCardRepository creditCardRepository;
    
    @Mock
    private BianApiClient bianApiClient;
    
    @InjectMocks
    private CreditCardService creditCardService;
    
    @Test
    void getCardTransactions_FallsBackToH2_WhenBianApiFails() {
        when(bianApiClient.getTransactions(1L))
            .thenThrow(new RuntimeException("BIAN API timeout"));
        
        List<TransactionDto> result = creditCardService.getCardTransactions(1L);
        
        assertNotNull(result);
        // Verify fallback was used
    }
}
```

**Why:** Unit tests should be fast and isolated. Mock external dependencies (repositories, API clients). Focus on testing business logic, not infrastructure.

#### Integration Tests with H2
✅ **Good:**
```java
@SpringBootTest
@AutoConfigureTestDatabase
class CreditCardRepositoryIntegrationTest {
    
    @Autowired
    private CreditCardRepository creditCardRepository;
    
    @Test
    void findByAnnualFeeLessThan_ReturnsMatchingCards() {
        List<CreditCard> cards = creditCardRepository.findByAnnualFeeLessThan(new BigDecimal("100.00"));
        
        assertFalse(cards.isEmpty());
        cards.forEach(card -> 
            assertTrue(card.getAnnualFee().compareTo(new BigDecimal("100.00")) < 0)
        );
    }
}
```

**Why:** Integration tests verify database queries work correctly. `@SpringBootTest` loads full context. `@AutoConfigureTestDatabase` uses H2 (matches dev environment).

### Frontend Testing (Playwright)

#### E2E Test Structure
✅ **Good:**
```typescript
// tests/e2e/card-comparison.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Credit Card Comparison', () => {
    test('displays all credit cards on homepage', async ({ page }) => {
        await page.goto('http://localhost:5173');
        
        // Wait for cards to load
        await expect(page.locator('[data-testid="card-list"]')).toBeVisible();
        
        // Verify 5 cards are displayed
        const cards = page.locator('[data-testid="credit-card"]');
        await expect(cards).toHaveCount(5);
    });
    
    test('navigates to card details page', async ({ page }) => {
        await page.goto('http://localhost:5173');
        
        await page.click('text=Business Cash Rewards');
        await expect(page).toHaveURL(/\/cards\/\d+/);
        await expect(page.locator('h1')).toContainText('Business Cash Rewards');
    });
});
```

**Why:** Playwright tests verify end-to-end user flows. Use `data-testid` attributes for stable selectors. Test actual user interactions, not implementation details.

#### Using Test Fixtures
✅ **Good:**
```typescript
// tests/fixtures/credit-cards.json
[
    {
        "id": 1,
        "name": "Business Cash Rewards",
        "annualFee": 95.00,
        "rewardsRate": 0.02
    }
]

// In test:
import creditCards from '../fixtures/credit-cards.json';

test('displays correct annual fee', async ({ page }) => {
    await page.route('/api/cards', route => 
        route.fulfill({ json: creditCards })
    );
    
    await page.goto('http://localhost:5173');
    const expectedFee = creditCards[0].annualFee;
    await expect(page.locator('[data-testid="annual-fee"]')).toContainText(`$${expectedFee}`);
});
```

**Why:** Fixtures provide consistent test data. Mocking API responses makes tests faster and more reliable. Fixtures should match `data.sql` seed data for consistency.

## Environment Configuration

### Backend Configuration (application.yml)
```yaml
spring:
  datasource:
    url: jdbc:h2:mem:creditcards
    username: sa
    password:
  h2:
    console:
      enabled: true  # Dev only - set false in production
  jpa:
    hibernate:
      ddl-auto: create
    show-sql: false  # Set true for debugging
  cache:
    type: caffeine

resilience4j:
  circuitbreaker:
    instances:
      bianApi:
        slidingWindowSize: 10
        failureRateThreshold: 50
        waitDurationInOpenState: 10s
  retry:
    instances:
      bianApi:
        maxAttempts: 3
        waitDuration: 1s

bian:
  api:
    base-url: https://virtserver.swaggerhub.com/B154/BIAN/CreditCard/13.0.0
```

**Why:** 
- `ddl-auto: create` rebuilds schema on startup (H2 is ephemeral)
- Circuit breaker config prevents cascading failures
- Externalized BIAN API URL for environment-specific endpoints

### Frontend Configuration (.env)
```bash
# Development
VITE_API_BASE_URL=http://localhost:8080/api

# Production
VITE_API_BASE_URL=https://backend.threeriversbank.azurecontainerapps.io/api
```

**Why:** Vite requires `VITE_` prefix for exposed variables. Separate dev/prod API endpoints. Never commit `.env` files with secrets.

### Docker Environment Variables
```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - H2_CONSOLE_ENABLED=false
      - BIAN_API_URL=${BIAN_API_URL}
      - LOGGING_LEVEL=INFO
  
  frontend:
    environment:
      - VITE_API_BASE_URL=${API_BASE_URL}
```

**Why:** Environment variables keep secrets out of code. Spring profiles enable environment-specific configs. Azure Container Apps injects variables at runtime.

## Quick Reference

### Common Commands
```bash
# Backend
cd backend
mvn clean install          # Build + run tests
mvn spring-boot:run        # Start backend (port 8080)
mvn test                   # Run tests only
curl http://localhost:8080/actuator/health  # Check health

# Frontend
cd frontend
npm install                # Install dependencies
npm run dev                # Start dev server (port 5173)
npm run build              # Production build
npm run preview            # Preview production build

# Testing
cd tests
npx playwright test        # Run all E2E tests
npx playwright test --headed  # Run with browser visible
npx playwright test --debug   # Debug mode

# Docker
docker build -f docker/backend.Dockerfile -t threeriversbank/backend .
docker build -f docker/frontend.Dockerfile -t threeriversbank/frontend .
docker-compose up          # Start both containers
```

### Key Endpoints
- **Backend API**: `http://localhost:8080/api/cards`
- **H2 Console**: `http://localhost:8080/h2-console`
- **OpenAPI Docs**: `http://localhost:8080/swagger-ui.html`
- **Frontend Dev**: `http://localhost:5173`
- **Health Check**: `http://localhost:8080/actuator/health`

### Troubleshooting

**Backend won't start:**
- Check Java version: `java -version` (need Java 17+)
- Verify Maven: `mvn -version`
- Check port 8080 availability: `lsof -i :8080`

**Frontend build fails:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version: `node -version` (need Node 18+)
- Verify Vite config: `frontend/vite.config.js`

**H2 console not accessible:**
- Verify `spring.h2.console.enabled=true` in `application.yml`
- JDBC URL: `jdbc:h2:mem:creditcards`
- Username: `sa`, Password: (blank)

**BIAN API calls failing:**
- Check circuit breaker status: `/actuator/health`
- Verify BIAN base URL is correct
- Application should fallback to H2 data automatically

**Playwright tests failing:**
- Ensure backend is running on port 8080
- Ensure frontend is running on port 5173
- Check test fixtures match `data.sql` seed data
- Run with `--headed` flag to see browser

## Project Files Reference

### Critical Files
- **Backend Entry**: `backend/src/main/java/com/threeriversbank/Application.java`
- **Database Seed**: `backend/src/main/resources/data.sql`
- **Backend Config**: `backend/src/main/resources/application.yml`
- **Frontend Entry**: `frontend/src/main.jsx`
- **Theme Config**: `frontend/src/theme.js`
- **API Client**: `backend/src/main/java/com/threeriversbank/client/BianApiClient.java`
- **Test Fixtures**: `tests/fixtures/credit-cards.json`

### Documentation
- **Architecture Plan**: `.github/prompts/plan-threeRiversBankCreditCardWebsite.prompt.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`
- **Main README**: `README.md`

## Best Practices Checklist

### Before Making Changes
- [ ] Understand the data flow (H2 → BIAN → Fallback)
- [ ] Check if similar code exists (reuse patterns)
- [ ] Verify you're not querying BIAN for catalog data
- [ ] Ensure circuit breaker is in place for external calls

### Writing Code
- [ ] Use Lombok annotations (avoid boilerplate)
- [ ] Add `@Slf4j` and log important operations
- [ ] Use `@RequiredArgsConstructor` for dependency injection
- [ ] Wrap controllers with `ResponseEntity<T>`
- [ ] Use functional React components (no classes)
- [ ] Leverage React Query for server state
- [ ] Apply Material-UI theme (don't hardcode colors)

### Testing
- [ ] Write unit tests for services (mock dependencies)
- [ ] Use MockMvc for controller tests
- [ ] Add Playwright tests for new UI features
- [ ] Verify test fixtures match seed data
- [ ] Test failure scenarios (circuit breaker, fallback)

### Before Committing
- [ ] Run `mvn test` (backend)
- [ ] Run `npm run build` (frontend)
- [ ] Run `npx playwright test` (E2E)
- [ ] Check no secrets in code
- [ ] Update documentation if needed

## Branding Guidelines
- **Bank Name**: Three Rivers Bank
- **Primary Color**: Navy #003366
- **Secondary Color**: Teal #008080
- **Typography**: Roboto (Material-UI default)
- **Contact**: 1-800-THREE-RB, business@threeriversbank.com
- **Location**: Pittsburgh, PA
