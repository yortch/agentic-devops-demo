# Always-On Instructions for Three Rivers Bank Credit Card Website

## Purpose
This document provides authoritative guidance for GitHub Copilot and all AI coding agents working on this repository. These instructions ensure consistency, quality, and adherence to project standards across all development activities.

## Project Overview
Full-stack credit card comparison platform for Three Rivers Bank, designed to showcase business credit card products with an intuitive, responsive interface.

**Tech Stack:**
- **Frontend:** React 18+ with Vite, Material-UI, React Query (TanStack Query), React Router v6
- **Backend:** Spring Boot 3.x, Java 17+, H2 In-Memory Database
- **API Integration:** BIAN Credit Card API v13.0.0 (Swagger Hub Mock)
- **Testing:** JUnit 5 (backend), Playwright (E2E)
- **Infrastructure:** Docker, Azure Container Apps, GitHub Actions
- **Resilience:** Resilience4j Circuit Breaker, Spring Cache

## Core Architecture Principles

### Data Flow
1. **H2 Database is PRIMARY** - All card catalog, fees, and interest rate data
2. **BIAN API is SUPPLEMENTARY** - Only for transactions and billing data
3. **Circuit Breaker Pattern** - All external API calls must use Resilience4j
4. **Fallback Strategy** - Always fall back to H2 data when BIAN is unavailable
5. **Caching** - Use Spring Cache: 5min TTL (transactions), 1hr TTL (billing)

### Backend Architecture
**Package Structure:**
```
com.threeriversbank/
├── controller/       # REST controllers (@RestController)
├── service/          # Business logic (@Service)
├── repository/       # JPA repositories (@Repository)
├── model/
│   ├── entity/      # JPA entities (@Entity)
│   └── dto/         # Data transfer objects
├── client/          # Feign clients (@FeignClient)
└── config/          # Configuration classes (@Configuration)
```

**Key Rules:**
- Never query BIAN API for fees/interest - H2 is authoritative
- Always implement circuit breaker with Resilience4j (3 retries, 5s timeout)
- Use DTOs for all API responses, never expose entities directly
- Enable H2 console in development, disable in production
- No Spring Security needed - read-only public API

### Frontend Architecture
**State Management:**
- Use React Query for ALL server state - NEVER use Redux
- Local UI state only in component state or context
- 5-minute stale time for card data queries

**Component Patterns:**
```
src/
├── components/
│   ├── cards/       # Card-specific components
│   ├── common/      # Shared UI components
│   └── layout/      # Header, Footer, navigation
├── pages/           # Page components (HomePage, CardComparisonPage, etc.)
├── services/        # API service layer
├── hooks/           # Custom React hooks
└── theme.js         # Material-UI theme configuration
```

**Key Rules:**
- Material-UI for all UI components
- Custom theme: Navy #003366 (primary), Teal #008080 (secondary)
- Responsive design - mobile-first approach
- All API calls through React Query hooks
- Typography: Roboto (Material-UI default)

## Coding Standards

### Java/Spring Boot
```java
// Use Lombok for boilerplate reduction
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditCardDTO {
    private Long id;
    private String name;
    // ...
}

// Always use DTOs for API responses
@GetMapping("/api/cards/{id}")
public ResponseEntity<CreditCardDTO> getCard(@PathVariable Long id) {
    return ResponseEntity.ok(creditCardService.getCardById(id));
}

// Circuit breaker for external APIs
@CircuitBreaker(name = "bianApi", fallbackMethod = "fallbackToH2Data")
@Retry(name = "bianApi")
public BianResponse callBianApi(Long cardId) {
    return bianApiClient.getCardData(cardId);
}
```

### React/JavaScript
```javascript
// Use React Query for data fetching
const { data: cards, isLoading, error } = useQuery({
  queryKey: ['cards'],
  queryFn: fetchCards,
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Material-UI themed components
import { Button, Card, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const theme = useTheme();
<Button variant="contained" color="primary">Apply Now</Button>

// Responsive design with Material-UI breakpoints
const styles = {
  container: {
    padding: { xs: 2, sm: 3, md: 4 },
  },
};
```

### Testing Conventions

#### Backend (JUnit 5)
- **Test Naming:** `{Class}Test.java` (e.g., `CreditCardServiceTest.java`)
- **Use WireMock** for BIAN API mocking
- **Use MockMvc** for REST controller testing
- **Use @DataJpaTest** for repository tests
- **All tests must pass** before commits

```java
@SpringBootTest
@AutoConfigureMockMvc
class CreditCardControllerTest {
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void shouldReturnAllCards() throws Exception {
        mockMvc.perform(get("/api/cards"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$", hasSize(5)));
    }
}
```

#### Frontend (Playwright)
- **Test Location:** `/tests/e2e/{feature}.spec.ts`
- **Test Fixtures:** `/tests/fixtures/credit-cards.json` (must match H2 seed data)
- **Multi-Browser:** Chromium, WebKit
- **Multi-Viewport:** Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)
- **Visual Regression:** Baseline screenshots in `/tests/screenshots/baseline/`

```typescript
test('should display all credit cards', async ({ page }) => {
  await page.goto('http://localhost:5173/comparison');
  const cards = await page.locator('.card-item');
  await expect(cards).toHaveCount(5);
});
```

## API Endpoints

### REST API Structure
**Base Path:** `/api/cards` (no authentication required)

**Endpoints:**
- `GET /api/cards` - List all cards (supports filtering/sorting)
- `GET /api/cards/{id}` - Get detailed card information (H2 source)
- `GET /api/cards/{id}/fees` - Get fee schedule (H2 source)
- `GET /api/cards/{id}/interest` - Get interest rates (H2 source)
- `GET /api/cards/{id}/transactions` - Get transactions (BIAN enriched)

**Management:**
- `GET /actuator/health` - Health check (monitors H2 + BIAN)
- `GET /h2-console` - H2 database console (dev only)
- `GET /swagger-ui.html` - OpenAPI documentation

### BIAN API Integration
**Configuration:**
- Base URL: `https://virtserver.swaggerhub.com/B154/BIAN/CreditCard/13.0.0`
- Client: Spring Cloud OpenFeign
- Resilience: Resilience4j (3 retries, 5s timeout)
- Fallback: H2 data on failure

## Database Schema

### H2 In-Memory Database
**Configuration:**
- JDBC URL: `jdbc:h2:mem:creditcards`
- Username: `sa`
- Password: (empty)
- Hibernate DDL: `create` (recreates on startup)
- Seed Data: `backend/src/main/resources/data.sql`

**Entities:**
- `CreditCard` (1:N) → `CardFeature`, `FeeSchedule`, `InterestRate`
- Cascade operations on relationships
- 5 preloaded business credit cards

### Preloaded Products
1. **Business Cash Rewards** - 2% cashback, $0 annual fee
2. **Business Travel Rewards** - 3X points, $95 annual fee
3. **Business Platinum** - 0% intro APR 15 months, $0 annual fee
4. **Business Premium** - 1.5% unlimited cashback, $150 annual fee
5. **Business Flex** - Tiered 3%-1% rewards, $0 annual fee

## Development Workflows

### Local Development Setup

#### Backend
```bash
cd backend
mvn clean install              # First time setup
mvn spring-boot:run            # Runs on :8080
mvn test                       # Run JUnit tests
```

**Access Points:**
- API: `http://localhost:8080/api/cards`
- H2 Console: `http://localhost:8080/h2-console`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Health: `http://localhost:8080/actuator/health`

#### Frontend
```bash
cd frontend
npm install                    # First time setup
npm run dev                    # Vite dev server on :5173
npm run build                  # Production build
npm run preview                # Preview production build
```

**Access Points:**
- Dev Server: `http://localhost:5173`
- Build Output: `frontend/dist/`

#### Testing
```bash
# Backend tests
cd backend
mvn test

# E2E tests (requires backend and frontend running)
cd tests
npm install
npx playwright install
npx playwright test

# Run specific test
npx playwright test card-comparison.spec.ts

# Debug mode
npx playwright test --debug

# UI mode
npx playwright test --ui
```

## Docker & Deployment

### Container Structure
**Backend Dockerfile:** `docker/backend.Dockerfile`
- Multi-stage build: Maven build → JRE runtime
- Base: `eclipse-temurin:17-jre-alpine`
- Port: 8080
- Health check: `/actuator/health`

**Frontend Dockerfile:** `docker/frontend.Dockerfile`
- Multi-stage build: Node build → Nginx runtime
- Base: `nginx:alpine`
- Port: 80
- Custom nginx.conf for SPA routing

### Build Commands
```bash
# Build images
docker build -f docker/backend.Dockerfile -t threeriversbank/backend:latest ./backend
docker build -f docker/frontend.Dockerfile -t threeriversbank/frontend:latest ./frontend

# Run containers
docker run -p 8080:8080 threeriversbank/backend:latest
docker run -p 80:80 threeriversbank/frontend:latest

# With environment variables
docker run -p 8080:8080 \
  -e BIAN_API_URL=https://virtserver.swaggerhub.com/B154/BIAN/CreditCard/13.0.0 \
  -e H2_CONSOLE_ENABLED=false \
  threeriversbank/backend:latest
```

### Azure Container Apps
**Backend Configuration:**
- CPU: 0.5 vCPU
- Memory: 1GB RAM
- Ingress: HTTPS-only
- Health probe: `/actuator/health`

**Frontend Configuration:**
- CPU: 0.25 vCPU
- Memory: 0.5GB RAM
- Ingress: HTTPS-only
- Health probe: `/`

**Environment Variables (Production):**
- `BIAN_API_URL` - BIAN API base URL
- `H2_CONSOLE_ENABLED=false` - Disable H2 console
- `LOGGING_LEVEL=INFO` - Application logging level

## CI/CD Pipeline

### GitHub Actions Workflow
**File:** `.github/workflows/deploy.yml`

**Pipeline Stages:**
1. Build backend (Maven)
2. Build frontend (npm)
3. Run JUnit tests
4. Run Playwright E2E tests
5. Build Docker images
6. Push to container registry
7. Deploy to Azure Container Apps

**Secrets Required:**
- `AZURE_CREDENTIALS` - Azure service principal
- `ACR_USERNAME` - Azure Container Registry username
- `ACR_PASSWORD` - Azure Container Registry password

## Common Pitfalls to Avoid

### ❌ DON'T
1. Query BIAN API for card catalog, fees, or interest data
2. Add Spring Security (this is a read-only public API)
3. Use Redux for state management (use React Query)
4. Bypass circuit breaker for BIAN calls
5. Store sensitive card data (this is a product catalog)
6. Disable H2 console in development
7. Expose JPA entities directly in API responses
8. Hard-code BIAN API URL in code

### ✅ DO
1. Use H2 as primary data source
2. Implement circuit breaker for all external APIs
3. Use React Query for all server state
4. Use DTOs for all API responses
5. Enable H2 console in development for debugging
6. Cache BIAN responses (5min/1hr TTL)
7. Use environment variables for configuration
8. Write tests for all new features

## Security Best Practices

### General
- Never commit secrets or API keys
- Use environment variables for sensitive configuration
- Validate all input parameters
- Sanitize user input (though this is read-only API)
- Keep dependencies up to date

### Backend
- Disable H2 console in production
- Configure CORS for specific origins only
- Use HTTPS in production
- Implement rate limiting if needed
- Log security-relevant events

### Frontend
- Sanitize any user input before display
- Use HTTPS for all API calls in production
- Implement proper error handling
- Don't expose sensitive information in errors
- Use secure cookies if authentication is added later

## Branding & Design

### Three Rivers Bank Theme
**Colors:**
- Primary: Navy Blue #003366
- Secondary: Teal #008080
- Background: #f5f5f5
- Text: #333333

**Typography:**
- Font Family: Roboto (Material-UI default)
- Headings: Bold weight
- Body: Regular weight

**Contact Information:**
- Phone: 1-800-THREE-RB
- Email: business@threeriversbank.com
- Headquarters: Pittsburgh, PA

### UI/UX Guidelines
- Mobile-first responsive design
- Accessible (WCAG 2.1 AA)
- Clear call-to-action buttons
- Intuitive navigation
- Fast loading times
- Graceful error handling

## Key Files Reference

### Documentation
- **Project Overview:** `README.md`
- **Implementation Summary:** `IMPLEMENTATION_SUMMARY.md`
- **Architecture Plan:** `.github/prompts/plan-threeRiversBankCreditCardWebsite.prompt.md`
- **Always-On Instructions:** `docs/part-2-1-always-on-instructions.md` (this file)
- **Copilot Instructions:** `.github/copilot-instructions.md`

### Backend
- **Main Application:** `backend/src/main/java/com/threeriversbank/ThreeRiversBankApplication.java`
- **Configuration:** `backend/src/main/resources/application.yml`
- **Database Seed:** `backend/src/main/resources/data.sql`
- **BIAN Client:** `backend/src/main/java/com/threeriversbank/client/BianApiClient.java`

### Frontend
- **Theme:** `frontend/src/theme.js`
- **Main App:** `frontend/src/App.jsx`
- **API Service:** `frontend/src/services/cardService.js`

### Testing
- **Test Fixtures:** `tests/fixtures/credit-cards.json`
- **Playwright Config:** `tests/playwright.config.js`

### Docker & CI/CD
- **Backend Dockerfile:** `docker/backend.Dockerfile`
- **Frontend Dockerfile:** `docker/frontend.Dockerfile`
- **CI/CD Pipeline:** `.github/workflows/deploy.yml`

## Agent-Specific Guidelines

### For Coding Agents
When implementing new features:
1. **Read H2 schema first** - Understand existing data model
2. **Check BIAN API integration** - Only for transactions/billing
3. **Follow naming conventions** - Match existing code style
4. **Write tests** - Unit tests (backend), E2E tests (frontend)
5. **Update documentation** - Keep README and docs in sync
6. **Validate locally** - Test before committing

### For Review Agents
When reviewing code:
1. **Verify H2 usage** - Primary data source for catalog
2. **Check circuit breaker** - All BIAN calls must have fallback
3. **Validate DTOs** - No entity exposure in APIs
4. **Test coverage** - Ensure new code is tested
5. **Security** - No secrets, proper validation
6. **Documentation** - Comments and docs updated

### For Testing Agents
When writing tests:
1. **Match H2 seed data** - Use exact data from data.sql
2. **Multi-viewport** - Test desktop, tablet, mobile
3. **Multi-browser** - Test Chromium and WebKit
4. **Happy & error paths** - Test success and failure
5. **Visual regression** - Compare screenshots
6. **Accessibility** - Test WCAG 2.1 AA compliance

## Troubleshooting

### Common Issues

**Backend not starting:**
- Check Java version (need 17+)
- Verify Maven dependencies installed
- Check port 8080 not in use
- Review application.yml configuration

**Frontend not loading:**
- Check Node version (need 18+)
- Verify npm dependencies installed
- Check port 5173 not in use
- Verify backend API is running

**Tests failing:**
- Ensure backend and frontend running
- Check test fixtures match H2 data
- Verify Playwright browsers installed
- Review test output for specific errors

**H2 console not accessible:**
- Verify H2_CONSOLE_ENABLED=true in dev
- Check URL: http://localhost:8080/h2-console
- JDBC URL: jdbc:h2:mem:creditcards
- Username: sa, Password: (empty)

**BIAN API errors:**
- Check circuit breaker logs
- Verify BIAN_API_URL configured
- Confirm fallback to H2 working
- Review retry/timeout settings

## Resources & Documentation

### Official Documentation
- [Spring Boot](https://spring.io/projects/spring-boot)
- [React](https://react.dev/)
- [Material-UI](https://mui.com/)
- [React Query](https://tanstack.com/query/latest)
- [Playwright](https://playwright.dev/)
- [Resilience4j](https://resilience4j.readme.io/)
- [BIAN API v13.0.0](https://swaggerhub.com/apis/B154/BIAN/13.0.0)

### GitHub Copilot Resources
- [Custom Instructions](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions)
- [Agent Skills](https://agentskills.io/)
- [Custom Agents](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents)

## Version History

### v1.0.0 (Current)
- Initial always-on-instructions document
- Complete project guidelines
- Architecture and coding standards
- Testing and deployment workflows
- Security and branding guidelines

---

**Last Updated:** February 5, 2026  
**Maintained By:** Three Rivers Bank Development Team  
**Contact:** For questions or suggestions, please open an issue or contact the repository maintainers.
