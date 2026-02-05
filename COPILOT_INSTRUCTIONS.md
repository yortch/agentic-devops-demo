# Copilot Instructions for Three Rivers Bank Credit Card Website

This document explains the file-based instruction system for GitHub Copilot in this monorepo.

## Overview

File-based instructions provide context-aware guidance to GitHub Copilot based on the files you're working on. When you edit files matching specific patterns, Copilot automatically receives tailored guidelines for that area of the codebase.

## Instruction Files

This repository uses three file-based instruction files located in `.github/instructions/`:

### 1. Backend Java Instructions (`.github/instructions/backend.instructions.md`)

**Applies to:** `backend/**/*.java`

**Purpose:** Provides Spring Boot-specific guidance for backend Java development

**Key Topics:**
- Spring Boot REST API conventions
- Spring annotations best practices (`@RestController`, `@Service`, `@Repository`)
- Spring Data JPA patterns and entity relationships
- Circuit breaker pattern with Resilience4j
- Feign client configuration for external APIs
- H2 database configuration and usage
- Actuator and health checks
- Caching strategies
- Modern Java features (Records, Streams, Optional)
- Maven build and testing patterns

**Based on:** [github/awesome-copilot Java instructions](https://github.com/github/awesome-copilot/blob/main/instructions/java.instructions.md)

**Local Customizations:**
- Emphasis on H2 as primary data source, not BIAN API
- Circuit breaker patterns for external API calls
- Three Rivers Bank specific package structure
- RequestInterceptor bean naming to avoid conflicts
- Project-specific REST API endpoint patterns

### 2. Frontend React Instructions (`.github/instructions/frontend.instructions.md`)

**Applies to:** `frontend/**/*.{jsx,tsx,js,ts}`

**Purpose:** Provides React, Vite, and Material-UI guidance for frontend development

**Key Topics:**
- Vite build tool and dev server patterns
- Material-UI component usage and theming
- React Query (TanStack Query) for server state (NOT Redux)
- React Router v6 navigation patterns
- Component architecture and organization
- Functional components with hooks
- Performance optimization with memoization and code splitting
- Three Rivers Bank branding and theme
- Accessibility best practices
- Common pitfalls to avoid

**Based on:** [github/awesome-copilot React instructions](https://github.com/github/awesome-copilot/blob/main/instructions/reactjs.instructions.md)

**Local Customizations:**
- Vite-specific configuration and patterns
- Material-UI theme integration (Navy #003366, Teal #008080)
- React Query instead of Redux for state management
- Project-specific component structure (`/pages/`, `/components/cards/`, etc.)
- Three Rivers Bank branding guidelines

### 3. E2E Test Instructions (`.github/instructions/tests.instructions.md`)

**Applies to:** `tests/**/*.{js,ts}`

**Purpose:** Provides Playwright E2E testing guidance

**Key Topics:**
- Playwright test structure and organization
- Locator best practices (role-based, semantic)
- Assertion patterns and strategies
- Page Object Model (when to use)
- Test fixtures synchronized with backend data
- Responsive design testing across viewports
- API mocking and interception
- Auto-waiting and timing patterns
- Visual regression testing with screenshots
- Debugging techniques

**Based on:** Playwright best practices and testing patterns

**Local Customizations:**
- Project-specific test structure (`/tests/e2e/`)
- Fixture synchronization with H2 seed data
- Multi-viewport testing (mobile, tablet, desktop)
- Three Rivers Bank specific test scenarios

## Pattern Matching Approach

File-based instructions use glob patterns in the `applyTo` field to determine when they activate:

```yaml
applyTo: 'backend/**/*.java'     # Matches all Java files in backend/
applyTo: 'frontend/**/*.{jsx,tsx,js,ts}'  # Matches JS/TS/JSX/TSX in frontend/
applyTo: 'tests/**/*.{js,ts}'    # Matches JS/TS files in tests/
```

**Non-overlapping patterns:**
- Each instruction file targets a specific area of the codebase
- Patterns are mutually exclusive to avoid conflicts
- When you edit a file, only the relevant instruction file activates

## How It Works

1. **Automatic activation:** When you open or edit a file matching an `applyTo` pattern, Copilot loads the corresponding instruction file
2. **Context-aware suggestions:** Copilot uses the instructions to provide relevant code suggestions
3. **Consistent patterns:** All developers get the same guidance, ensuring code consistency
4. **Always-on context:** Instructions supplement (not replace) the main `.github/copilot-instructions.md`

## Integration with Existing Instructions

This file-based instruction system works alongside:

- **`.github/copilot-instructions.md`** - Always-on instructions for the entire project
- **`docs/part-2-1-always-on-instructions.md`** - Comprehensive development guidelines
- **`CONTRIBUTING.md`** - Development workflow and contribution guidelines

File-based instructions provide focused, area-specific guidance, while always-on instructions provide project-wide context.

## Source Materials

All instruction files reference and adapt from:

- **Java guidelines:** [github/awesome-copilot/instructions/java.instructions.md](https://github.com/github/awesome-copilot/blob/main/instructions/java.instructions.md)
- **React guidelines:** [github/awesome-copilot/instructions/reactjs.instructions.md](https://github.com/github/awesome-copilot/blob/main/instructions/reactjs.instructions.md)
- **File-based instructions guide:** [Norman-Norman-Norman/customize-your-repo](https://github.com/Norman-Norman-Norman/customize-your-repo/blob/main/docs/part-2-2-file-based-instructions.md)

## Repo-Specific Customizations

Key customizations made for this project:

### Backend (Spring Boot)
- H2 in-memory database as primary source (not BIAN API)
- Circuit breaker pattern with Resilience4j for external calls
- Feign client configuration with unique bean names
- Three Rivers Bank package structure: `com.threeriversbank/{controller,service,repository,model,client,config}`

### Frontend (React)
- Vite as build tool (not Create React App or Webpack)
- Material-UI with custom Three Rivers Bank theme
- React Query for ALL server state (no Redux)
- Specific component organization: `/pages/`, `/components/cards/`, `/components/common/`, `/components/layout/`

### Tests (Playwright)
- Test fixtures synchronized with H2 seed data
- Multi-browser and multi-viewport testing
- Visual regression testing baseline screenshots
- Role-based locator priority for resilience

## Benefits

1. **Consistency:** All developers follow the same patterns
2. **Context-aware:** Different guidance for backend vs. frontend vs. tests
3. **Low overhead:** Instructions load automatically based on file patterns
4. **Easy maintenance:** Update instructions in one place
5. **Scalable:** Easy to add new instruction files for new areas

## Updating Instructions

To update or add instructions:

1. Edit the appropriate `.md` file in `.github/instructions/`
2. Ensure YAML frontmatter is valid
3. Test that patterns don't overlap with existing files
4. Document any new customizations in this file
5. Update this documentation if adding new instruction files

## Additional Resources

- **GitHub Copilot Documentation:** https://docs.github.com/en/copilot
- **File-Based Instructions Guide:** https://github.com/Norman-Norman-Norman/customize-your-repo/blob/main/docs/part-2-2-file-based-instructions.md
- **Awesome Copilot Repository:** https://github.com/github/awesome-copilot
- [**Issue #24**](../../issues/24)

## Questions or Issues?

If you encounter issues with Copilot instructions or have suggestions for improvements:

1. Check that your file matches an `applyTo` pattern
2. Verify the instruction file has valid YAML frontmatter
3. Open an issue on the repository
4. Reference this documentation and the specific instruction file
