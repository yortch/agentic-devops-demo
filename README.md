# Three Rivers Bank Business Credit Cards

A modern web application showcasing business credit card products for Three Rivers Bank, built with React frontend and Spring Boot backend, integrating with BIAN API v13.0.0 standards.

## 🏦 Overview

This project demonstrates a full-stack credit card comparison and information platform designed for small businesses. The application provides an intuitive interface for browsing, comparing, and learning about various business credit card offerings from Three Rivers Bank.

## 🏗️ Architecture

### Frontend
- **Framework**: React 18+ with Vite
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query)
- **UI Library**: Material-UI (MUI)
- **Styling**: Custom Three Rivers Bank theme (Navy/Teal)

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Database**: H2 In-Memory Database
- **API Integration**: BIAN Credit Card API v13.0.0 (Swagger Hub Mock)
- **Resilience**: Resilience4j Circuit Breaker
- **API Client**: Spring Cloud OpenFeign
- **Caching**: Spring Cache Abstraction

### Infrastructure
- **Containerization**: Docker
- **Registry**: Azure Container Registry
- **Deployment**: Azure Container Apps
- **CI/CD**: GitHub Actions

## 📋 Features

### Credit Card Catalog
- **5 Business Credit Cards**:
  - Business Cash Rewards (2% cashback, $0 annual fee)
  - Business Travel Rewards (3X points, $95 annual fee)
  - Business Platinum (0% intro APR 15 months, $0 annual fee)
  - Business Premium (1.5% unlimited cashback, $150 annual fee)
  - Business Flex (Tiered 3%-1% rewards, $0 annual fee)

### Card Comparison
- Side-by-side comparison table
- Advanced filtering (annual fee, APR, rewards type, card type)
- Sorting capabilities
- Responsive design for all devices

### Card Details
- Hero section with card imagery
- Quick facts card (APR, fees, rewards)
- Detailed features accordion
- Benefits showcase
- Fee schedules
- Interest rate information

### Business Features
- Expense management tools
- Employee card controls
- QuickBooks integration
- Receipt capture mobile app
- Travel insurance & purchase protection

## 🗂️ Project Structure

```
agentic-devops-demo/
├── backend/                          # Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/threeriversbank/
│   │   │   │   ├── controller/       # REST controllers
│   │   │   │   ├── service/          # Business logic
│   │   │   │   ├── repository/       # JPA repositories
│   │   │   │   ├── model/
│   │   │   │   │   ├── entity/       # JPA entities
│   │   │   │   │   └── dto/          # Data transfer objects
│   │   │   │   ├── client/           # BIAN API Feign client
│   │   │   │   └── config/           # Configuration classes
│   │   │   └── resources/
│   │   │       ├── application.yml    # App configuration
│   │   │       └── data.sql          # H2 seed data
│   │   └── test/                      # JUnit tests
│   └── pom.xml                        # Maven dependencies
│
├── frontend/                          # React application
│   ├── src/
│   │   ├── components/               # Reusable components
│   │   │   ├── cards/                # Card-related components
│   │   │   ├── common/               # Shared UI components
│   │   │   └── layout/               # Layout components
│   │   ├── pages/                    # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── CardComparisonPage.jsx
│   │   │   └── CardDetailsPage.jsx
│   │   ├── services/                 # API service layer
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── theme.js                  # MUI theme configuration
│   │   └── App.jsx                   # Root component
│   ├── package.json                  # npm dependencies
│   └── vite.config.js                # Vite configuration
│
├── tests/
│   ├── e2e/                          # Playwright E2E tests
│   │   ├── card-comparison.spec.ts
│   │   ├── card-details.spec.ts
│   │   ├── filters-and-sorting.spec.ts
│   │   ├── responsive-design.spec.ts
│   │   └── database-integration.spec.ts
│   ├── fixtures/                     # Test data fixtures
│   │   └── credit-cards.json
│   └── screenshots/                  # Visual regression baselines
│       └── baseline/
│
├── .github/
│   ├── workflows/
│   │   └── deploy.yml                # CI/CD pipeline
│   └── prompts/
│       └── plan-threeRiversBankCreditCardWebsite.prompt.md
│
├── docker/
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
│
└── README.md
```

## 🔌 API Endpoints

### REST API
- `GET /api/cards` - List all credit cards with filtering/sorting
- `GET /api/cards/{id}` - Get detailed card information
- `GET /api/cards/{id}/fees` - Get card fee schedule
- `GET /api/cards/{id}/interest` - Get interest rate details
- `GET /api/cards/{id}/transactions` - Get sample transactions (BIAN)

### Management & Documentation
- `GET /actuator/health` - Health check endpoint
- `GET /swagger-ui.html` - OpenAPI/Swagger documentation
- `GET /h2-console` - H2 database console (dev only)

## 🗄️ Database Schema

### Entities
- **CreditCard**: Core card information (name, type, APR, fees, rewards)
- **CardFeature**: Individual card features and benefits
- **FeeSchedule**: Detailed fee structure per card
- **InterestRate**: Interest rate configurations and history

## 🔗 BIAN API Integration

Integrates with BIAN Credit Card API v13.0.0 via Swagger Hub mock server:
- **Base URL**: `https://virtserver.swaggerhub.com/B154/BIAN/CreditCard/13.0.0`
- **Endpoints Used**:
  - `/CreditCard/{id}/Retrieve`
  - `/CreditCard/{id}/CardTransaction/{txid}/Retrieve`
  - `/CreditCard/{id}/Billing/{billingid}/Retrieve`

### Resilience Features
- Circuit breaker pattern (Resilience4j)
- Retry logic: 3 attempts, 5s timeout
- Fallback to H2 data on BIAN API failure
- Response caching: 5min (transactions), 1hr (billing)

## 🚀 Getting Started

### Prerequisites
- **Backend**: Java 17+, Maven 3.8+
- **Frontend**: Node.js 18+, npm 9+
- **Testing**: Playwright (installed via npm)

### Local Development

#### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
Backend runs on `http://localhost:8080`

#### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

#### H2 Console
Access H2 database console at `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:creditcards`
- Username: `sa`
- Password: (empty)

## 🧪 Testing

### Backend Tests (JUnit)
```bash
cd backend
mvn test
```

Tests include:
- `CreditCardServiceTest.java` - Service layer with H2 queries
- `CreditCardControllerTest.java` - REST API with MockMvc
- `CreditCardRepositoryTest.java` - JPA repository validation
- `BianApiClientTest.java` - BIAN API integration with WireMock

### Frontend Tests (Playwright)
```bash
cd tests
npm install
npx playwright install
npx playwright test
```

E2E tests cover:
- Card comparison functionality
- Card detail pages
- Filters and sorting
- Responsive design (3 viewports)
- Database integration
- Visual regression
- Accessibility (WCAG 2.1 AA)

**Test Configuration**:
- **Browsers**: Chromium, WebKit
- **Viewports**: Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)
- **Parallel execution** enabled

## 🐳 Docker

### Build Images
```bash
# Backend
docker build -f docker/backend.Dockerfile -t threeriversbank/backend:latest ./backend

# Frontend
docker build -f docker/frontend.Dockerfile -t threeriversbank/frontend:latest ./frontend
```

### Run Containers
```bash
# Backend
docker run -p 8080:8080 threeriversbank/backend:latest

# Frontend
docker run -p 80:80 threeriversbank/frontend:latest
```

## ☁️ Azure Deployment

### Container Apps Configuration
- **Backend**: 0.5 vCPU, 1GB RAM
- **Frontend**: 0.25 vCPU, 0.5GB RAM
- **Ingress**: HTTPS-only with custom domain support
- **Health Checks**: `/actuator/health`

### Environment Variables
- `BIAN_API_URL`: BIAN API base URL
- `H2_CONSOLE_ENABLED`: Enable/disable H2 console (false in prod)
- `LOGGING_LEVEL`: Application logging level (INFO)

### CI/CD Pipeline
GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:
1. Builds React frontend
2. Builds Spring Boot backend
3. Runs JUnit tests
4. Runs Playwright E2E tests
5. Creates Docker images
6. Pushes to Azure Container Registry
7. Deploys to Azure Container Apps

## 🎨 Branding

**Three Rivers Bank Theme**:
- **Primary Color**: Navy Blue (#003366)
- **Secondary Color**: Teal (#008080)
- **Logo**: Three Rivers Bank corporate logo
- **Typography**: Roboto (Material-UI default)

**Contact Information**:
- **Phone**: 1-800-THREE-RB
- **Email**: business@threeriversbank.com
- **Headquarters**: Pittsburgh, PA

## 📚 Documentation

This project includes comprehensive documentation to help developers and AI agents work effectively:

### For Developers
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines, development workflow, and best practices
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Complete implementation details and technical highlights
- **[docs/part-2-1-always-on-instructions.md](docs/part-2-1-always-on-instructions.md)** - Authoritative guidelines for all development activities

### For AI Agents (GitHub Copilot)
- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** - Quick reference for GitHub Copilot
- **[.github/agents/feature-builder.md](.github/agents/feature-builder.md)** - Custom agent for building features
- **[.github/skills/create-agent-skill/](.github/skills/create-agent-skill/)** - Agent skill for creating new skills

### Architecture & Planning
- **[.github/prompts/plan-threeRiversBankCreditCardWebsite.prompt.md](.github/prompts/plan-threeRiversBankCreditCardWebsite.prompt.md)** - Original architecture planning document

## 📄 License

This project is for demonstration purposes.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:
- Setting up your development environment
- Coding standards and conventions
- Testing requirements
- Pull request process
- Using GitHub Copilot effectively

For questions or feedback, please contact the repository owner or open an issue.

## 🆘 Support

### Getting Help
- **Documentation**: Start with [Always-On Instructions](docs/part-2-1-always-on-instructions.md)
- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md)
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Contact**: business@threeriversbank.com

### Useful Commands
```bash
# Backend
cd backend && mvn spring-boot:run    # Run backend server
cd backend && mvn test               # Run backend tests

# Frontend
cd frontend && npm run dev           # Run frontend dev server
cd frontend && npm run build         # Build for production

# Testing
cd tests && npx playwright test      # Run E2E tests
cd tests && npx playwright test --ui # Run tests with UI
```

---

**Built with ❤️ for Three Rivers Bank**
