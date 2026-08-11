# Project Explanation: Agentic DevOps Demo

## Overview

This repository demonstrates **AI-driven development workflows** for building modern full-stack web applications. The project showcases a complete business credit card comparison website for Three Rivers Bank, built using an **agentic development approach** where AI agents assist in planning, coding, testing, and deploying the application.

## What is This Project?

**Primary Goal**: Demonstrate how AI coding agents (like GitHub Copilot with custom agents) can be used to build, test, and deploy production-quality web applications efficiently.

**Demo Application**: A full-stack credit card comparison platform featuring:
- 5 business credit card products from Three Rivers Bank
- Interactive comparison tools
- Detailed product information pages
- Integration with banking industry standards (BIAN API v13.0.0)

## Core Technologies

### Frontend Stack
- **React 18** with **Vite** - Modern, fast development environment
- **Material-UI (MUI)** - Professional UI component library
- **React Router v6** - Client-side routing
- **React Query (TanStack Query)** - Server state management
- **Custom Theme** - Three Rivers Bank branding (Navy #003366, Teal #008080)

### Backend Stack
- **Spring Boot 3.x** - Enterprise Java framework
- **Java 17+** - Modern Java with latest features
- **H2 In-Memory Database** - Embedded database for development
- **Spring Data JPA** - Database access layer
- **Spring Cloud OpenFeign** - HTTP client for BIAN API
- **Resilience4j** - Circuit breaker for fault tolerance
- **Spring Cache** - Response caching for performance

### DevOps & Infrastructure
- **Docker** - Containerization for backend and frontend
- **GitHub Actions** - CI/CD pipeline automation
- **Azure Container Apps** - Cloud deployment platform
- **Playwright** - End-to-end testing framework
- **JUnit 5** - Backend unit testing

## Architecture

### Data Flow Architecture

```
User Browser
    ↓
React Frontend (Vite Dev Server / Nginx)
    ↓
REST API (/api/cards)
    ↓
Spring Boot Backend
    ↓
    ├─→ H2 Database (PRIMARY) ────→ Card Catalog, Fees, Interest Rates
    │
    └─→ BIAN API (SUPPLEMENTARY) ──→ Transactions, Billing Data
         ↓
         Circuit Breaker (Resilience4j)
         ↓
         Fallback to H2 on failure
```

### Key Architectural Patterns

1. **Circuit Breaker Pattern**: Protects against BIAN API failures with automatic fallback
2. **Repository Pattern**: Clean separation between data access and business logic
3. **DTO Pattern**: Data transfer objects separate internal entities from API responses
4. **Service Layer**: Business logic isolated from controllers and repositories
5. **Caching Strategy**: Response caching (5min for transactions, 1hr for billing)

## Project Structure

```
agentic-devops-demo/
│
├── backend/                          # Spring Boot Application
│   ├── src/main/java/com/threeriversbank/
│   │   ├── controller/               # REST API endpoints
│   │   ├── service/                  # Business logic
│   │   ├── repository/               # Data access (JPA)
│   │   ├── model/
│   │   │   ├── entity/               # Database entities
│   │   │   └── dto/                  # API response objects
│   │   ├── client/                   # BIAN API Feign client
│   │   └── config/                   # Spring configuration
│   ├── src/main/resources/
│   │   ├── application.yml           # Spring Boot config
│   │   └── data.sql                  # Database seed data (5 cards)
│   └── src/test/                     # JUnit tests
│
├── frontend/                         # React Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── cards/                # Card-specific components
│   │   │   ├── common/               # Reusable UI components
│   │   │   └── layout/               # Header, Footer, Layout
│   │   ├── pages/                    # Route-level components
│   │   │   ├── HomePage.jsx          # Landing page
│   │   │   ├── CardComparisonPage.jsx # Card comparison tool
│   │   │   └── CardDetailsPage.jsx   # Individual card details
│   │   ├── services/                 # API service layer
│   │   ├── hooks/                    # Custom React hooks
│   │   └── theme.js                  # MUI theme configuration
│   └── vite.config.js                # Build configuration
│
├── tests/                            # E2E Testing
│   ├── e2e/                          # Playwright test specs
│   │   ├── card-comparison.spec.ts   # Comparison page tests
│   │   ├── card-details.spec.ts      # Detail page tests
│   │   ├── homepage.spec.ts          # Landing page tests
│   │   ├── responsive-design.spec.ts # Multi-viewport tests
│   │   └── database-integration.spec.ts # Backend integration tests
│   ├── fixtures/                     # Test data
│   │   └── credit-cards.json         # Matches H2 seed data
│   └── playwright.config.js          # Test framework config
│
├── .github/                          # GitHub Configuration
│   ├── agents/                       # Custom AI Agent Definitions
│   │   ├── planner.agent.md          # Planning agent
│   │   ├── coder.agent.md            # Coding agent
│   │   ├── designer.agent.md         # UI/UX agent
│   │   ├── orchestrator.agent.md     # Workflow orchestrator
│   │   └── enterprise-architect.agent.md # Architecture agent
│   ├── workflows/
│   │   └── deploy.yml                # CI/CD pipeline
│   ├── prompts/                      # Saved AI prompts
│   └── copilot-instructions.md       # GitHub Copilot configuration
│
├── docker/                           # Containerization
│   ├── backend.Dockerfile            # Java application container
│   ├── frontend.Dockerfile           # Nginx web server container
│   └── nginx.conf                    # Nginx configuration
│
├── README.md                         # Quick start guide
├── IMPLEMENTATION_SUMMARY.md         # Detailed implementation notes
├── PLAYWRIGHT_MCP_DEMO.md            # Playwright MCP demonstration
└── PROJECT_EXPLANATION.md            # This file
```

## The "Agentic DevOps" Approach

### What Makes This "Agentic"?

This project demonstrates **agentic development** - using specialized AI agents to handle different aspects of software development:

#### 1. **Custom GitHub Copilot Agents** (`.github/agents/`)

Five specialized agents work together:

- **Planner Agent**: Creates comprehensive implementation plans by researching the codebase and identifying edge cases
- **Coder Agent**: Writes code following established patterns and conventions
- **Designer Agent**: Creates UI/UX designs and ensures consistency
- **Orchestrator Agent**: Coordinates multi-agent workflows
- **Enterprise Architect Agent**: Ensures architectural consistency and best practices

#### 2. **File-Based Instructions** (`.github/copilot-instructions.md`)

Custom instructions guide AI agents on:
- Project architecture and conventions
- Database schema and relationships
- API integration patterns
- Testing strategies
- Deployment procedures
- Common pitfalls to avoid

#### 3. **Automated Workflows** (`.github/workflows/deploy.yml`)

CI/CD pipeline that:
- Builds both frontend and backend
- Runs unit tests (JUnit)
- Runs E2E tests (Playwright)
- Creates Docker images
- Deploys to Azure Container Apps

## Key Features of the Demo Application

### 1. Credit Card Catalog
Five fully-defined business credit cards:
- **Business Cash Rewards** - 2% cashback, $0 annual fee
- **Business Travel Rewards** - 3X points on travel, $95 annual fee
- **Business Platinum** - 0% intro APR 15 months, $0 annual fee
- **Business Premium** - 1.5% unlimited cashback, $150 annual fee
- **Business Flex** - Tiered 3%-1% rewards, $0 annual fee

### 2. Card Comparison Tool
- Side-by-side comparison
- Advanced filtering (fee, APR, rewards type)
- Sorting capabilities
- Toggle between grid and table views
- Fully responsive design

### 3. Detailed Card Information
- Hero section with card imagery
- Quick facts (APR, fees, rewards)
- Expandable feature accordions
- Fee schedules
- Interest rate details
- Benefits showcase

### 4. Business Features
- Expense management tools
- Employee card controls
- QuickBooks integration
- Receipt capture mobile app
- Travel insurance & purchase protection

## API Endpoints

### Card Catalog (H2 Database)
- `GET /api/cards` - List all cards with filtering/sorting
- `GET /api/cards/{id}` - Get card details
- `GET /api/cards/{id}/fees` - Get fee schedule
- `GET /api/cards/{id}/interest` - Get interest rates

### Transactions & Billing (BIAN API)
- `GET /api/cards/{id}/transactions` - Sample transactions
- `GET /api/cards/{id}/billing` - Billing information

### Management
- `GET /actuator/health` - Health check
- `GET /h2-console` - Database console (dev only)
- `GET /swagger-ui.html` - API documentation

## Database Design

### H2 In-Memory Database
**Why H2?** Fast development, automatic schema creation, built-in console

### Entity Relationships
```
CreditCard (1) ──┬─→ (N) CardFeature
                 ├─→ (N) FeeSchedule
                 └─→ (N) InterestRate
```

### Sample Data
- 5 preloaded credit cards with complete information
- All relationships populated
- Seed data in `backend/src/main/resources/data.sql`

## BIAN API Integration

### What is BIAN?
**Banking Industry Architecture Network** - Global standard for banking services

### Integration Details
- **Version**: v13.0.0
- **Provider**: Swagger Hub Mock Server
- **Base URL**: `https://virtserver.swaggerhub.com/B154/BIAN/CreditCard/13.0.0`
- **Purpose**: Supplementary transaction and billing data

### Resilience Strategy
1. Circuit breaker with Resilience4j
2. 3 retry attempts with 5-second timeout
3. Automatic fallback to H2 data on failure
4. Response caching to reduce API calls

## Testing Strategy

### Backend Tests (JUnit 5)
- **Service Tests**: Business logic validation
- **Controller Tests**: REST API testing with MockMvc
- **Repository Tests**: JPA query validation
- **Integration Tests**: Full stack with H2
- **Coverage**: 10 tests, 100% passing

### Frontend Tests (Playwright)
- **E2E Tests**: Full user journey testing
- **Multi-Browser**: Chromium, WebKit
- **Multi-Viewport**: Desktop, Tablet, Mobile
- **Visual Regression**: Baseline screenshot comparison
- **Accessibility**: WCAG 2.1 AA compliance
- **Coverage**: 32+ test scenarios

### Test Execution
```bash
# Backend tests
cd backend && mvn test

# Frontend E2E tests
cd tests && npx playwright test
```

## Deployment

### Docker Containers
- **Backend**: Multi-stage build (Maven → JRE)
- **Frontend**: Multi-stage build (Node → Nginx)
- **Images**: Optimized layer caching
- **Health Checks**: Built-in monitoring

### Azure Container Apps
- **Backend**: 0.5 vCPU, 1GB RAM
- **Frontend**: 0.25 vCPU, 0.5GB RAM
- **Scaling**: Auto-scaling based on load
- **Ingress**: HTTPS-only with custom domain support

### CI/CD Pipeline
Automated GitHub Actions workflow:
1. Build and test backend (Maven)
2. Build and test frontend (npm)
3. Run E2E tests (Playwright)
4. Build Docker images
5. Push to Azure Container Registry
6. Deploy to Azure Container Apps

## Getting Started

### Quick Start (Local Development)

#### Prerequisites
- Java 17+
- Node.js 18+
- Maven 3.8+

#### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
# Access: http://localhost:8080
# H2 Console: http://localhost:8080/h2-console
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
# Access: http://localhost:5173
```

#### Tests
```bash
# Backend
cd backend && mvn test

# Frontend E2E
cd tests && npx playwright test
```

## Demonstration Features

### Playwright MCP Demo
The project includes a comprehensive **Playwright Model Context Protocol** demonstration (`PLAYWRIGHT_MCP_DEMO.md`) showing:
- Natural language browser automation
- Accessibility-first testing
- Visual regression testing
- Network and console monitoring
- Responsive design validation

### 10 Demo Scenarios Included:
1. Basic navigation and page inspection
2. Interactive element discovery
3. Form interactions and filtering
4. Card details exploration
5. Responsive design testing
6. Screenshot capture
7. Testing user flows
8. Console and network monitoring
9. Keyboard navigation testing
10. Complex interaction sequences

## Key Learnings & Best Practices

### What This Project Demonstrates

1. **AI-Assisted Development**: How custom agents accelerate development
2. **Clean Architecture**: Proper separation of concerns
3. **Resilient Systems**: Circuit breakers and fallback strategies
4. **Modern Frontend**: React Query, Material-UI, Vite
5. **Enterprise Backend**: Spring Boot best practices
6. **Comprehensive Testing**: Unit, integration, and E2E tests
7. **Container Deployment**: Production-ready Docker images
8. **CI/CD Automation**: Complete GitHub Actions pipeline

### Common Pitfalls Avoided

1. **Don't query BIAN for catalog data** - H2 is authoritative
2. **Don't skip circuit breakers** - All external calls protected
3. **Don't use Redux** - React Query is sufficient
4. **Don't disable H2 console in dev** - Essential debugging tool
5. **Don't store sensitive data** - Product catalog only

## Project Goals

### Primary Objectives
- ✅ Demonstrate agentic development workflows
- ✅ Showcase AI-assisted full-stack development
- ✅ Provide production-quality code examples
- ✅ Illustrate modern DevOps practices
- ✅ Create reusable patterns for other projects

### Educational Value
- Learn how to configure custom GitHub Copilot agents
- Understand BIAN API integration patterns
- See circuit breaker implementation in action
- Study modern React patterns (hooks, query, routing)
- Explore containerization and cloud deployment
- Master E2E testing with Playwright

## Future Enhancements

Potential improvements for continued learning:
1. Add user authentication (Spring Security)
2. Implement real card application workflow
3. Add payment processing integration
4. Enhance analytics and monitoring
5. Implement A/B testing
6. Add internationalization (i18n)
7. Create mobile native apps (React Native)
8. Add real-time notifications (WebSocket)

## Resources

### Documentation Files
- `README.md` - Quick start and overview
- `IMPLEMENTATION_SUMMARY.md` - Detailed technical summary
- `PLAYWRIGHT_MCP_DEMO.md` - Testing demonstration
- `.github/copilot-instructions.md` - AI agent configuration

### External References
- [BIAN API Standards](https://bian.org/)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Material-UI](https://mui.com/)
- [GitHub Copilot](https://github.com/features/copilot)

## Contact & Support

**Three Rivers Bank** (Demo Project)
- Phone: 1-800-THREE-RB
- Email: business@threeriversbank.com
- Location: Pittsburgh, PA

## License

This is a demonstration project for educational purposes.

---

**Built with AI-Assisted Development**
Showcasing the power of agentic workflows in modern software development.
