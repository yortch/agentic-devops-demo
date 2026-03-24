# Three Rivers Bank — Application Architecture

## Overview
Three Rivers Bank is a credit card comparison platform:
- **Backend**: Spring Boot (Java 17) REST API on Azure Container Apps
- **Frontend**: React (Vite) + Material-UI served via Nginx on Azure Container Apps
- **Database**: H2 in-memory (embedded, primary data source)
- **External API**: BIAN v13.0.0 (Swagger Hub mock) for supplementary transaction data

## API Endpoints
| Endpoint | Method | Source | Description |
|----------|--------|--------|-------------|
| `/api/cards` | GET | H2 Database | List all credit cards |
| `/api/cards/{id}` | GET | H2 Database | Get card details |
| `/api/cards/{id}/fees` | GET | H2 Database | Get card fee schedule |
| `/api/cards/{id}/interest` | GET | H2 Database | Get interest rates |
| `/api/cards/{id}/transactions` | GET | BIAN API | Get transactions (circuit breaker) |
| `/actuator/health` | GET | Spring Boot | Health check endpoint |

## Key Files
| Path | Purpose |
|------|---------|
| `backend/src/main/java/com/threeriversbank/controller/CreditCardController.java` | REST controller |
| `backend/src/main/java/com/threeriversbank/service/CreditCardService.java` | Business logic |
| `backend/src/main/java/com/threeriversbank/client/BianApiClient.java` | BIAN API client |
| `backend/src/main/resources/application.yml` | Spring Boot config |
| `backend/src/main/resources/data.sql` | H2 seed data (5 cards) |
| `frontend/src/pages/HomePage.jsx` | Landing page |
| `frontend/src/pages/CardComparisonPage.jsx` | Card comparison |
| `frontend/src/theme.js` | MUI theme (Navy #003366, Teal #008080) |
| `infra/terraform/main.tf` | Infrastructure as Code |
| `docker/backend.Dockerfile` | Backend container image |
| `docker/frontend.Dockerfile` | Frontend container image |

## Deployment
- Backend: 0.5 vCPU, 1GB RAM on Azure Container Apps
- Frontend: 0.25 vCPU, 0.5GB RAM on Azure Container Apps
- CI/CD: GitHub Actions → Azure Container Registry → Container Apps

## Environment Variables (Backend)
| Variable | Expected Value |
|----------|----------------|
| `BIAN_API_BASE_URL` | `https://virtserver.swaggerhub.com/B154/BIAN/CreditCard/13.0.0` |
| `SPRING_PROFILES_ACTIVE` | `production` |
| `SPRING_H2_CONSOLE_ENABLED` | `false` (production) |

## GitHub Repository
- Owner: yortch
- Repo: agentic-devops-demo
- Labels: `sre-agent-detected`, `chaos-engineering`
