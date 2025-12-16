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
├── infra/                            # Infrastructure as Code
│   ├── terraform/                    # Terraform IaC (default)
│   │   ├── main.tf                   # Main Terraform configuration
│   │   ├── variables.tf              # Input variables
│   │   ├── outputs.tf                # Output values
│   │   └── main.tfvars.json          # Variable defaults for azd
│   │
│   └── bicep/                        # Bicep IaC (alternative)
│       ├── main.bicep                # Main Bicep template
│       ├── main.parameters.json      # Parameters for azd
│       └── modules/                  # Reusable Bicep modules
│           ├── container-registry.bicep
│           ├── log-analytics.bicep
│           ├── container-apps-environment.bicep
│           └── container-app.bicep
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
│   │   └── build-deploy.yml          # CI/CD pipeline
│   └── prompts/
│       └── plan-threeRiversBankCreditCardWebsite.prompt.md
│
├── docker/
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
│
├── azure.yaml                        # azd config (Terraform)
├── azure.bicep.yaml                  # azd config (Bicep)
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

This project includes comprehensive Infrastructure as Code (IaC) using Azure Developer CLI (azd) with **two provider options**: Terraform and Bicep. Both options deploy identical infrastructure to Azure Container Apps.

### Quick Start with azd CLI

```bash
# Login to Azure
az login
azd auth login

# Deploy with Terraform (default)
azd up

# Or deploy with Bicep
cp azure.bicep.yaml azure.yaml
azd up
```

### Infrastructure Providers

#### Terraform (Default)
- Location: `infra/terraform/`
- Files: `main.tf`, `variables.tf`, `outputs.tf`
- Configuration: `azure.yaml` (default)

#### Bicep (Alternative)
- Location: `infra/bicep/`
- Files: `main.bicep`, `main.parameters.json`, `modules/`
- Configuration: `azure.bicep.yaml`

To switch between providers, use the corresponding `azure.yaml` file:
```bash
# Use Bicep
cp azure.bicep.yaml azure.yaml

# Or revert to Terraform
git checkout azure.yaml
```

### Infrastructure Components
- **Resource Group**: Contains all Azure resources
- **Container Registry**: Stores application Docker images
- **Container App Environment**: Managed serverless container platform  
- **Log Analytics Workspace**: Centralized logging and monitoring
- **Container Apps**: Backend (Spring Boot) and Frontend (React/Nginx)

### Container Apps Configuration
- **Backend**: 0.5 vCPU, 1GB RAM, auto-scale 1-3 replicas
- **Frontend**: 0.25 vCPU, 0.5GB RAM, auto-scale 1-3 replicas
- **Ingress**: HTTPS-only with automatic SSL certificates
- **Health Checks**: Backend `/actuator/health`, Frontend root path

### Environment Variables
- `BIAN_API_URL`: BIAN API base URL
- `H2_CONSOLE_ENABLED`: Enable/disable H2 console (false in prod)
- `LOGGING_LEVEL`: Application logging level (INFO)
- `SPRING_PROFILES_ACTIVE`: Spring profile (production)
- `REACT_APP_API_URL`: Backend URL for frontend

### CI/CD Pipeline Options

#### Option 1: GitHub Actions with Docker Images
Workflow: `.github/workflows/build-deploy.yml` (existing)
1. Builds and tests applications
2. Creates Docker images
3. Pushes to GitHub Container Registry
4. Deploys to Azure Container Apps

#### Option 2: GitHub Actions with azd CLI  
Workflow: `.github/workflows/azure-azd-deploy.yml` (new)
1. Validates Terraform infrastructure
2. Builds and tests applications  
3. Provisions infrastructure with `azd provision`
4. Deploys applications with `azd deploy`
5. Runs smoke tests
6. Cleanup on failure

### Repository Setup for GitHub Actions

1. **Create Azure Service Principal**:
```bash
az ad sp create-for-rbac --name "three-rivers-bank-github" \
  --role contributor \
  --scopes /subscriptions/{subscription-id} \
  --sdk-auth
```

2. **Configure GitHub Secrets**:
   - `AZURE_CLIENT_ID`: Service principal client ID
   - `AZURE_CLIENT_SECRET`: Service principal secret
   - `AZURE_TENANT_ID`: Azure tenant ID  
   - `AZURE_SUBSCRIPTION_ID`: Azure subscription ID

3. **Configure GitHub Variables**:
   - `AZURE_CLIENT_ID`: Same as secret (for OIDC)
   - `AZURE_TENANT_ID`: Same as secret (for OIDC)
   - `AZURE_SUBSCRIPTION_ID`: Same as secret (for OIDC)

### Local Development with Docker
```bash
# Run full application stack
docker-compose up --build

# Backend: http://localhost:8080
# Frontend: http://localhost:3000
```

### Management Commands
```bash
# View deployed applications
azd show

# View application logs  
azd logs --service backend
azd logs --service frontend

# Update application configuration
azd env set LOGGING_LEVEL DEBUG
azd deploy

# Scale applications (Azure CLI)
az containerapp update --name <backend-app> --resource-group <rg> --min-replicas 2 --max-replicas 10

# Clean up all resources
azd down --purge
```

For detailed deployment instructions, see [Azure Deployment Guide](README-AZURE-DEPLOYMENT.md).

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

## 📄 License

This project is for demonstration purposes.

## 🤝 Contributing

This is a demonstration project. For questions or feedback, please contact the repository owner.

---

**Built with ❤️ for Three Rivers Bank**
