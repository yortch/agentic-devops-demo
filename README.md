# Three Rivers Bank Business Credit Cards

> 🌐 **[Walkthrough Site](https://yortch.github.io/agentic-devops-demo/)** — See the full Agentic DevOps walkthrough
>
> 🤖 **[Azure SRE Agent Setup Guide](SRE-AGENT-SETUP.md)** — Step-by-step instructions for configuring Azure SRE Agent

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

#### Configuration & Environment Variables

The application uses standard Spring Boot and Vite environment variable mappings:

- **Backend (Spring Boot)**  
  - `bian.api.base-url` &rightarrow; overridden via env var **`BIAN_API_BASE_URL`**  
  - `spring.h2.console.enabled` &rightarrow; overridden via env var **`SPRING_H2_CONSOLE_ENABLED`**

- **Frontend (Vite React)**  
  - Build-time API base URL: **`VITE_API_BASE_URL`**  
  - Optional runtime override: **`window.APP_CONFIG.API_BASE_URL`**

Make sure to use these exact names in Azure Container Apps, Docker, and local `.env` files; variables like
`BIAN_API_URL`, `H2_CONSOLE_ENABLED`, or `REACT_APP_API_URL` will not be picked up by this application.
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
│   │   └── build-deploy.yml          # CI/CD pipeline
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
- `POST /api/cards/{id}/apply` - Submit a credit card application
- `GET /api/cards/applications/{id}` - Get application status by application ID

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
- **CardApplication**: Credit card application submissions (name, email, business info, status)

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
- **Azure Deployment**: Azure CLI (`az`), Azure Developer CLI (`azd`), Terraform 1.1+

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

This project uses **Azure Developer CLI (azd)** with **Terraform** for deploying to Azure Container Apps. CI/CD is handled by two separate GitHub Actions workflows.

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

### Quick Start with azd CLI (Local)

```bash
# Login to Azure
az login
azd auth login

# Deploy everything to Azure (state backend is bootstrapped automatically)
azd up
```

> **Note:** The `preprovision` hook in `azure.yaml` automatically runs `setup-tfstate.sh`
> before each provision, creating the Terraform state storage account and configuring
> the azd environment. No manual setup is needed.

### CI/CD Pipeline

The pipeline is split into two workflows:

- **CI** (`.github/workflows/ci.yml`): Builds backend/frontend, runs unit and E2E tests on every push and PR.
- **CD** (`.github/workflows/cd.yml`): Deploys to Azure with `azd up` automatically after a successful CI run on `main` or `iac` branches. Can also be triggered manually via `workflow_dispatch`.

When configuring Azure Container Apps or other deployment targets, ensure the following environment
variables are set so they correctly override the app configuration:

- Backend: `BIAN_API_BASE_URL` (for `bian.api.base-url`), `SPRING_H2_CONSOLE_ENABLED` (for `spring.h2.console.enabled`)
- Frontend: `VITE_API_BASE_URL` (and optional `window.APP_CONFIG.API_BASE_URL` at runtime)

### Setting Up the Service Principal for GitHub Actions (OIDC)

This project uses **federated credentials (OIDC)** for secure, secretless authentication between GitHub Actions and Azure.

#### 1. Create an App Registration

```bash
# Create the app registration
az ad app create --display-name "agentic-devops-demo-cicd"

# Note the appId and id (objectId) from the output
# Example:
#   appId:    xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
#   objectId: yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy
```

#### 2. Create the Service Principal

```bash
az ad sp create --id <appId>
```

#### 3. Assign Roles

```bash
# Contributor role for resource management
az role assignment create \
  --assignee <appId> \
  --role "Contributor" \
  --scope "/subscriptions/<subscription-id>"
```

#### 4. Bootstrap Terraform State Storage and Assign Storage Role

The Terraform remote state backend uses an Azure Storage account with Azure AD auth.
Run `setup-tfstate.sh` once locally to create the storage resources, then assign the
**Storage Blob Data Contributor** role to the CI service principal:

```bash
# Create the state storage account (idempotent)
source ./setup-tfstate.sh

# Assign Storage Blob Data Contributor to the CI service principal
SP_OBJECT_ID=$(az ad sp show --id <appId> --query id -o tsv)
az role assignment create \
  --assignee-object-id "$SP_OBJECT_ID" \
  --assignee-principal-type ServicePrincipal \
  --role "Storage Blob Data Contributor" \
  --scope "$(az storage account show --name "sttf$(echo '<subscription-id>' | tr -d '-' | cut -c1-12)" --resource-group rg-tfstate --query id -o tsv)"
```

> **Note**: The CI service principal has Contributor role which cannot self-assign
> RBAC roles. This one-time step must be done by a user with Owner or User Access
> Administrator permissions.

#### 5. Create Federated Credentials for GitHub OIDC

Create a credential for each branch that the CD workflow deploys from:

```bash
# For main branch
az ad app federated-credential create --id <objectId> --parameters '{
  "name": "github-main",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:<owner>/<repo>:ref:refs/heads/main",
  "audiences": ["api://AzureADTokenExchange"]
}'

# For iac branch (or any other deploy branch)
az ad app federated-credential create --id <objectId> --parameters '{
  "name": "github-iac",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:<owner>/<repo>:ref:refs/heads/iac",
  "audiences": ["api://AzureADTokenExchange"]
}'
```

#### 6. Configure GitHub Repository Variables

Set these as **repository variables** (not secrets — OIDC doesn't need secrets):

```bash
gh variable set AZURE_CLIENT_ID     --body "<appId>"
gh variable set AZURE_TENANT_ID     --body "<tenantId>"
gh variable set AZURE_SUBSCRIPTION_ID --body "<subscriptionId>"
gh variable set AZURE_LOCATION      --body "eastus2"
```

> **Note**: No `AZURE_CLIENT_SECRET` is needed with OIDC. The GitHub Actions workflow exchanges a short-lived token with Azure using the federated credential.

### Environment Variables
- `BIAN_API_URL`: BIAN API base URL
- `H2_CONSOLE_ENABLED`: Enable/disable H2 console (false in prod)
- `LOGGING_LEVEL`: Application logging level (INFO)
- `SPRING_PROFILES_ACTIVE`: Spring profile (production)
- `VITE_API_BASE_URL`: Backend API URL for frontend (injected at runtime)

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

## 🤖 Azure SRE Agent Demo

This repository includes a complete Azure SRE Agent demo setup for showcasing AI-driven site reliability engineering:

| Component | File | Purpose |
|---|---|---|
| **Setup Guide** | [`SRE-AGENT-SETUP.md`](SRE-AGENT-SETUP.md) | Step-by-step guide to configure Azure SRE Agent monitoring |
| **Chaos Script** | [`sre/scripts/chaos-engineering.sh`](sre/scripts/chaos-engineering.sh) | az CLI script to inject infrastructure-level faults into Azure Container Apps |
| **Chaos Workflow** | [`.github/workflows/chaos-engineering.md`](.github/workflows/chaos-engineering.md) | Agentic workflow that introduces code-level breaking changes via PR |
| **Auto-assign** | [`.github/workflows/auto-assign-copilot.yml`](.github/workflows/auto-assign-copilot.yml) | Auto-assigns Copilot Coding Agent to SRE-detected issues |
| **Issue Template** | [`.github/ISSUE_TEMPLATE/sre-agent-incident.yml`](.github/ISSUE_TEMPLATE/sre-agent-incident.yml) | Structured template for SRE Agent incident reports |

### Demo Flow
```
Option A: Chaos Script (az CLI) → Modifies Live Azure Config ─┐
Option B: Agentic Workflow → Creates PR with Bad Code Commit ─┤
                                                              ↓
            SRE Agent Detects & Diagnoses → Creates GitHub Issue with RCA
              → Copilot Coding Agent Creates Fix PR
```

See [`SRE-AGENT-SETUP.md`](SRE-AGENT-SETUP.md) for the full walkthrough.

## 📄 License

This project is for demonstration purposes.

## 🤝 Contributing

This is a demonstration project. For questions or feedback, please contact the repository owner.

---

**Built with ❤️ for Three Rivers Bank**
