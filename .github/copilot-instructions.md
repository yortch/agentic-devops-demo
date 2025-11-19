# Three Rivers Bank Credit Card Website - AI Coding Agent Instructions

## Project Overview
Full-stack credit card comparison platform: React (Vite) frontend + Spring Boot backend, integrating BIAN API v13.0.0 for banking standards. **READ-ONLY APIs, no authentication required.**

## Architecture & Data Flow

### Backend Architecture (Spring Boot)
- **H2 In-Memory Database is PRIMARY source** for card catalog, fees, and interest rates
- **BIAN API (Swagger Hub mock)** provides SUPPLEMENTARY data (transactions, billing only)
- **Circuit Breaker Pattern**: Resilience4j with H2 fallback when BIAN unavailable
- **Package Structure**: `com.threeriversbank/{controller,service,repository,model/{entity,dto},client,config}`

### Frontend Architecture (React)
- **State Management**: React Query (TanStack Query) for server state - NOT Redux
- **UI Library**: Material-UI with custom Three Rivers Bank theme (Navy #003366, Teal #008080)
- **Routing**: React Router v6 with page components in `/frontend/src/pages/`
- **Component Pattern**: Reusable components in `/components/{cards,common,layout}`

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
