# Documentation Index

Welcome to the Three Rivers Bank Credit Card Website documentation! This guide helps you find the right documentation for your needs.

## 📋 Quick Navigation

### I'm a Developer Getting Started
Start here:
1. **[README.md](../README.md)** - Project overview, features, and quick start
2. **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Development setup and workflow
3. **[IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md)** - Technical implementation details

### I'm Contributing Code
Read these:
1. **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Contribution guidelines
2. **[docs/part-2-1-always-on-instructions.md](part-2-1-always-on-instructions.md)** - Comprehensive coding standards
3. **[.github/copilot-instructions.md](../.github/copilot-instructions.md)** - AI agent guidelines

### I'm Using GitHub Copilot
Configure your environment with:
1. **[.github/copilot-instructions.md](../.github/copilot-instructions.md)** - Quick reference instructions
2. **[docs/part-2-1-always-on-instructions.md](part-2-1-always-on-instructions.md)** - Detailed guidelines
3. **[.github/agents/feature-builder.md](../.github/agents/feature-builder.md)** - Feature builder custom agent
4. **[.github/skills/create-agent-skill/](../.github/skills/create-agent-skill/)** - Agent skill creation guide

### I Need Architecture Information
Review these:
1. **[.github/prompts/plan-threeRiversBankCreditCardWebsite.prompt.md](../.github/prompts/plan-threeRiversBankCreditCardWebsite.prompt.md)** - Original architecture plan
2. **[docs/part-2-1-always-on-instructions.md](part-2-1-always-on-instructions.md)** - Architecture principles and patterns
3. **[IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md)** - Implementation details

## 📚 Documentation Files

### Root Level Documentation
| File | Purpose | Audience |
|------|---------|----------|
| [README.md](../README.md) | Project overview, features, getting started | Everyone |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Contribution guidelines and workflow | Contributors |
| [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md) | Technical implementation details | Developers |

### Documentation Directory (`/docs/`)
| File | Purpose | Audience |
|------|---------|----------|
| [part-2-1-always-on-instructions.md](part-2-1-always-on-instructions.md) | Comprehensive always-on guidelines | Developers, AI Agents |
| [README.md](README.md) | Documentation index (this file) | Everyone |

### GitHub Configuration (`.github/`)
| Path | Purpose | Audience |
|------|---------|----------|
| [copilot-instructions.md](../.github/copilot-instructions.md) | Quick reference for GitHub Copilot | AI Agents |
| [agents/feature-builder.md](../.github/agents/feature-builder.md) | Custom agent for building features | GitHub Copilot |
| [skills/create-agent-skill/](../.github/skills/create-agent-skill/) | Agent skill for creating skills | GitHub Copilot |
| [prompts/](../.github/prompts/) | Architecture and planning documents | Developers |
| [workflows/](../.github/workflows/) | CI/CD pipeline definitions | DevOps |

## 🎯 Documentation by Topic

### Architecture & Design
- **Overview**: [README.md § Architecture](../README.md#🏗️-architecture)
- **Detailed Architecture**: [part-2-1-always-on-instructions.md § Core Architecture Principles](part-2-1-always-on-instructions.md#core-architecture-principles)
- **Original Plan**: [plan-threeRiversBankCreditCardWebsite.prompt.md](../.github/prompts/plan-threeRiversBankCreditCardWebsite.prompt.md)
- **Data Flow**: [part-2-1-always-on-instructions.md § Data Flow](part-2-1-always-on-instructions.md#data-flow)

### Development Setup
- **Quick Start**: [README.md § Getting Started](../README.md#🚀-getting-started)
- **Detailed Setup**: [CONTRIBUTING.md § Development Environment Setup](../CONTRIBUTING.md#development-environment-setup)
- **Prerequisites**: [part-2-1-always-on-instructions.md § Local Development Setup](part-2-1-always-on-instructions.md#local-development-setup)

### Coding Standards
- **Overview**: [CONTRIBUTING.md § Coding Standards](../CONTRIBUTING.md#coding-standards)
- **Detailed Standards**: [part-2-1-always-on-instructions.md § Coding Standards](part-2-1-always-on-instructions.md#coding-standards)
- **Backend Patterns**: [part-2-1-always-on-instructions.md § Backend Architecture](part-2-1-always-on-instructions.md#backend-architecture)
- **Frontend Patterns**: [part-2-1-always-on-instructions.md § Frontend Architecture](part-2-1-always-on-instructions.md#frontend-architecture)

### Testing
- **Overview**: [README.md § Testing](../README.md#🧪-testing)
- **Guidelines**: [CONTRIBUTING.md § Testing Guidelines](../CONTRIBUTING.md#testing-guidelines)
- **Detailed Testing Strategy**: [part-2-1-always-on-instructions.md § Testing Conventions](part-2-1-always-on-instructions.md#testing-conventions)
- **Test Location**: Backend: `backend/src/test/`, Frontend: `tests/e2e/`

### API Documentation
- **Endpoints Overview**: [README.md § API Endpoints](../README.md#🔌-api-endpoints)
- **Detailed API Docs**: [part-2-1-always-on-instructions.md § API Endpoints](part-2-1-always-on-instructions.md#api-endpoints)
- **BIAN Integration**: [part-2-1-always-on-instructions.md § BIAN API Integration](part-2-1-always-on-instructions.md#bian-api-integration)
- **Swagger UI**: `http://localhost:8080/swagger-ui.html` (when running)

### Database
- **Schema Overview**: [README.md § Database Schema](../README.md#🗄️-database-schema)
- **Detailed Schema**: [part-2-1-always-on-instructions.md § Database Schema](part-2-1-always-on-instructions.md#database-schema)
- **Seed Data**: `backend/src/main/resources/data.sql`
- **H2 Console**: `http://localhost:8080/h2-console` (dev only)

### Docker & Deployment
- **Docker Usage**: [README.md § Docker](../README.md#🐳-docker)
- **Deployment Config**: [part-2-1-always-on-instructions.md § Docker & Deployment](part-2-1-always-on-instructions.md#docker--deployment)
- **Azure Setup**: [part-2-1-always-on-instructions.md § Azure Container Apps](part-2-1-always-on-instructions.md#azure-container-apps)
- **CI/CD Pipeline**: `.github/workflows/deploy.yml`

### GitHub Copilot & AI Agents
- **Quick Reference**: [.github/copilot-instructions.md](../.github/copilot-instructions.md)
- **Complete Guidelines**: [part-2-1-always-on-instructions.md](part-2-1-always-on-instructions.md)
- **Custom Agents**: [.github/agents/](../.github/agents/)
- **Agent Skills**: [.github/skills/](../.github/skills/)
- **Using Copilot**: [CONTRIBUTING.md § Using GitHub Copilot](../CONTRIBUTING.md#using-github-copilot)

### Troubleshooting
- **Common Issues**: [CONTRIBUTING.md § Common Issues and Solutions](../CONTRIBUTING.md#common-issues-and-solutions)
- **Detailed Troubleshooting**: [part-2-1-always-on-instructions.md § Troubleshooting](part-2-1-always-on-instructions.md#troubleshooting)
- **Known Limitations**: [IMPLEMENTATION_SUMMARY.md § Known Limitations](../IMPLEMENTATION_SUMMARY.md#known-limitations)

## 🔄 Documentation Maintenance

### Updating Documentation
When making changes to the project:
- Update relevant documentation files
- Keep examples and code snippets current
- Update version history in changed files
- Review related documentation for consistency

### Documentation Standards
- Use Markdown format
- Include code examples where helpful
- Keep language clear and concise
- Add links to related documentation
- Include version and last updated date

## 🆘 Getting Help

### Can't Find What You Need?
1. **Search**: Use GitHub's search to find specific terms
2. **Issues**: Check existing issues for similar questions
3. **Ask**: Open a new issue with your question
4. **Contact**: Email business@threeriversbank.com

### Reporting Documentation Issues
If you find errors or gaps in documentation:
1. Open a GitHub issue with "docs:" prefix
2. Specify which document needs improvement
3. Describe what's missing or incorrect
4. Suggest improvements if possible

## 📖 External Resources

### Official Documentation
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Playwright Documentation](https://playwright.dev/)

### GitHub Copilot Resources
- [GitHub Copilot Docs](https://docs.github.com/en/copilot)
- [Custom Instructions](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions)
- [Agent Skills](https://agentskills.io/)
- [Custom Agents](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents)

## 📊 Documentation Status

| Document | Status | Last Updated |
|----------|--------|--------------|
| README.md | ✅ Current | Feb 5, 2026 |
| CONTRIBUTING.md | ✅ Current | Feb 5, 2026 |
| IMPLEMENTATION_SUMMARY.md | ✅ Current | Initial Release |
| part-2-1-always-on-instructions.md | ✅ Current | Feb 5, 2026 |
| .github/copilot-instructions.md | ✅ Current | Feb 5, 2026 |
| .github/agents/feature-builder.md | ✅ Current | Feb 5, 2026 |
| .github/skills/create-agent-skill/ | ✅ Current | Feb 5, 2026 |

---

**Last Updated:** February 5, 2026  
**Maintained By:** Three Rivers Bank Development Team  
**Questions?** Open an issue or contact business@threeriversbank.com
