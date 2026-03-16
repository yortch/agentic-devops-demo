# Contributing to Three Rivers Bank Credit Card Website

Welcome! We're excited that you want to contribute to the Three Rivers Bank Credit Card Website project. This document provides guidelines and workflows for contributing effectively.

## Table of Contents
- [Getting Started](#getting-started)
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Development Workflow](#development-workflow)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Using GitHub Copilot](#using-github-copilot)
- [Pull Request Process](#pull-request-process)
- [Code Review Guidelines](#code-review-guidelines)

## Getting Started

### Prerequisites
Before you begin, ensure you have the following installed:
- **Java 17+** - Backend development
- **Maven 3.8+** - Backend build tool
- **Node.js 18+** - Frontend development
- **npm 9+** - Frontend package manager
- **Docker** (optional) - Container testing
- **Git** - Version control

### Quick Start
```bash
# Clone the repository
git clone https://github.com/yortch/agentic-devops-demo.git
cd agentic-devops-demo

# Backend setup
cd backend
mvn clean install
mvn spring-boot:run

# Frontend setup (in a new terminal)
cd frontend
npm install
npm run dev

# Run tests
cd backend && mvn test           # Backend tests
cd tests && npx playwright test  # E2E tests
```

## Development Environment Setup

### Backend Setup
1. **Install Java 17+**
   - Download from [Eclipse Temurin](https://adoptium.net/)
   - Verify: `java -version`

2. **Install Maven 3.8+**
   - Download from [Apache Maven](https://maven.apache.org/)
   - Verify: `mvn -version`

3. **IDE Setup (IntelliJ IDEA recommended)**
   - Install Lombok plugin
   - Enable annotation processing
   - Import Maven project
   - Set JDK to Java 17+

### Frontend Setup
1. **Install Node.js 18+**
   - Download from [Node.js](https://nodejs.org/)
   - Verify: `node -v` and `npm -v`

2. **IDE Setup (VS Code recommended)**
   - Install ESLint extension
   - Install Prettier extension
   - Install ES7+ React/Redux/React-Native snippets

### Testing Setup
1. **Install Playwright**
   ```bash
   cd tests
   npm install
   npx playwright install
   ```

2. **Verify Test Environment**
   ```bash
   # Start backend and frontend
   # Then run tests
   npx playwright test --headed
   ```

## Project Structure

```
agentic-devops-demo/
├── backend/                      # Spring Boot application
│   ├── src/main/java/            # Java source code
│   ├── src/main/resources/       # Configuration and data
│   └── src/test/java/            # JUnit tests
├── frontend/                     # React application
│   ├── src/components/           # Reusable components
│   ├── src/pages/                # Page components
│   ├── src/services/             # API services
│   └── src/hooks/                # Custom hooks
├── tests/                        # E2E tests
│   ├── e2e/                      # Playwright test specs
│   └── fixtures/                 # Test data
├── .github/                      # GitHub configuration
│   ├── agents/                   # Custom Copilot agents
│   ├── skills/                   # Agent skills
│   └── workflows/                # CI/CD pipelines
└── docs/                         # Documentation
```

## Coding Standards

### Java/Spring Boot

#### Code Style
```java
// Use Lombok annotations
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditCardDTO {
    private Long id;
    private String name;
    private String cardType;
}

// Controller pattern
@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class CreditCardController {
    private final CreditCardService service;
    
    @GetMapping("/{id}")
    public ResponseEntity<CreditCardDTO> getCard(@PathVariable Long id) {
        return ResponseEntity.ok(service.getCardById(id));
    }
}

// Service pattern with circuit breaker
@Service
@RequiredArgsConstructor
public class CreditCardService {
    private final CreditCardRepository repository;
    
    @CircuitBreaker(name = "bianApi", fallbackMethod = "fallbackMethod")
    public ExternalData getExternalData(Long id) {
        return externalClient.getData(id);
    }
}
```

#### Naming Conventions
- **Classes**: PascalCase (`CreditCardService`)
- **Methods**: camelCase (`getCardById`)
- **Variables**: camelCase (`creditCard`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Packages**: lowercase (`com.threeriversbank.service`)

### React/JavaScript

#### Code Style
```javascript
// Functional components with hooks
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Card, Typography, CircularProgress } from '@mui/material';

const CreditCardList = () => {
  const { data: cards, isLoading, error } = useQuery({
    queryKey: ['cards'],
    queryFn: fetchCards,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      {cards.map(card => (
        <Card key={card.id}>
          <Typography variant="h5">{card.name}</Typography>
        </Card>
      ))}
    </Box>
  );
};

export default CreditCardList;
```

#### Naming Conventions
- **Components**: PascalCase (`CreditCardList`)
- **Functions**: camelCase (`fetchCards`)
- **Variables**: camelCase (`creditCard`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Files**: PascalCase for components (`CreditCardList.jsx`), camelCase for utilities (`cardService.js`)

## Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/add-card-filter
```

**Branch Naming:**
- `feature/<description>` - New features
- `bugfix/<description>` - Bug fixes
- `refactor/<description>` - Code refactoring
- `docs/<description>` - Documentation updates
- `test/<description>` - Test improvements

### 2. Make Changes
- Follow coding standards
- Write tests for new functionality
- Update documentation if needed
- Test locally before committing

### 3. Commit Changes
```bash
git add .
git commit -m "feat: Add credit card filtering by type

- Implement filter component
- Add backend endpoint for filtering
- Update E2E tests
- Update documentation"
```

**Commit Message Format:**
```
<type>: <short summary>

<detailed description>
- Bullet point 1
- Bullet point 2

Fixes #123
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

### 4. Push to GitHub
```bash
git push origin feature/add-card-filter
```

### 5. Create Pull Request
- Provide clear description
- Reference related issues
- Add screenshots for UI changes
- Request reviews from team members

## Testing Guidelines

### Backend Tests (JUnit)

#### Controller Tests
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
    
    @Test
    void shouldReturnCardById() throws Exception {
        mockMvc.perform(get("/api/cards/1"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(1))
               .andExpect(jsonPath("$.name").exists());
    }
}
```

#### Repository Tests
```java
@DataJpaTest
class CreditCardRepositoryTest {
    @Autowired
    private CreditCardRepository repository;
    
    @Test
    void shouldFindAllCards() {
        List<CreditCard> cards = repository.findAll();
        assertThat(cards).hasSize(5);
    }
}
```

### Frontend Tests (Playwright)

#### E2E Tests
```typescript
import { test, expect } from '@playwright/test';

test.describe('Card Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/comparison');
  });

  test('should filter cards by type', async ({ page }) => {
    await page.selectOption('[data-testid="card-type-filter"]', 'cashback');
    
    const cards = await page.locator('.card-item');
    await expect(cards).toHaveCount(2);
  });

  test('should be responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });
});
```

### Test Coverage Requirements
- **Backend**: Minimum 80% code coverage
- **Frontend**: Test critical user flows
- **E2E**: Cover main features and user journeys

### Running Tests
```bash
# Backend tests
cd backend
mvn test

# Frontend E2E tests
cd tests
npx playwright test

# Run specific test file
npx playwright test card-filtering.spec.ts

# Debug mode
npx playwright test --debug

# UI mode
npx playwright test --ui
```

## Documentation

### Code Documentation

#### JavaDoc (Backend)
```java
/**
 * Retrieves a credit card by its unique identifier.
 *
 * @param id the unique identifier of the credit card
 * @return the credit card DTO
 * @throws ResourceNotFoundException if card not found
 */
public CreditCardDTO getCardById(Long id) {
    // Implementation
}
```

#### JSDoc (Frontend)
```javascript
/**
 * Fetches all credit cards from the API.
 * @returns {Promise<Array<CreditCard>>} Array of credit cards
 * @throws {Error} If the API request fails
 */
export const fetchAllCards = async () => {
  // Implementation
};
```

### When to Update Documentation
- Adding new features
- Changing API endpoints
- Updating configuration
- Modifying build process
- Changing deployment procedures

### Documentation Files to Update
- `README.md` - Project overview and getting started
- `docs/part-2-1-always-on-instructions.md` - Comprehensive guidelines
- `.github/copilot-instructions.md` - Copilot-specific instructions
- Code comments - Complex logic and algorithms
- API documentation - Swagger/OpenAPI annotations

## Using GitHub Copilot

### Custom Instructions
This repository includes custom instructions for GitHub Copilot:
- **Main Instructions**: `.github/copilot-instructions.md`
- **Detailed Guidelines**: `docs/part-2-1-always-on-instructions.md`

### Custom Agents
We provide specialized agents for specific tasks:
- **Feature Builder**: `.github/agents/feature-builder.md` - Building new features

### Agent Skills
Reusable workflows for common tasks:
- **Create Agent Skill**: `.github/skills/create-agent-skill/` - Creating new skills

### Using Copilot Effectively
1. **Reference documentation** in your prompts
2. **Be specific** about requirements
3. **Mention testing needs** explicitly
4. **Request code review** before finalizing
5. **Follow up** on suggestions with questions

### Example Prompts
```
"Create a new API endpoint for filtering cards by annual fee,
following the patterns in CreditCardController"

"Add a React component for displaying card comparison with
Material-UI, using React Query for data fetching"

"Write Playwright tests for the new card filtering feature,
testing desktop, tablet, and mobile viewports"
```

## Pull Request Process

### Before Creating a PR
- [ ] All tests pass locally
- [ ] Code follows project conventions
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Responsive design validated
- [ ] Accessibility checked
- [ ] No secrets committed

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Refactoring
- [ ] Documentation update
- [ ] Test improvements

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Backend tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed
- [ ] Responsive design tested

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Related Issues
Fixes #123
```

### PR Review Process
1. **Submit PR** with complete description
2. **CI checks** must pass (tests, build)
3. **Code review** by at least one team member
4. **Address feedback** from reviewers
5. **Final approval** from maintainer
6. **Merge** into main branch

## Code Review Guidelines

### For Authors
- Keep PRs focused and reasonably sized
- Provide context in PR description
- Respond to feedback constructively
- Update PR based on review comments
- Request re-review after changes

### For Reviewers
Check for:
- **Correctness**: Does the code work as intended?
- **Testing**: Are there adequate tests?
- **Standards**: Does it follow coding conventions?
- **Security**: Are there security concerns?
- **Performance**: Any performance implications?
- **Documentation**: Is documentation updated?
- **Maintainability**: Is the code easy to understand?

### Review Comments
Be constructive and specific:
- ✅ "Consider using React Query's `enabled` option here to prevent unnecessary API calls"
- ❌ "This is wrong"

## Common Issues and Solutions

### Backend Issues
**Issue**: Tests fail with database errors  
**Solution**: Ensure H2 database is properly configured in `application.yml`

**Issue**: Port 8080 already in use  
**Solution**: Stop other services or change port in `application.yml`

### Frontend Issues
**Issue**: Module not found errors  
**Solution**: Run `npm install` to install dependencies

**Issue**: API calls failing  
**Solution**: Ensure backend is running on `http://localhost:8080`

### Test Issues
**Issue**: Playwright tests timeout  
**Solution**: Ensure both backend and frontend are running

**Issue**: Tests fail on CI but pass locally  
**Solution**: Check for environment-specific issues or timing problems

## Getting Help

### Resources
- **Documentation**: `docs/part-2-1-always-on-instructions.md`
- **Architecture**: `.github/prompts/plan-threeRiversBankCreditCardWebsite.prompt.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`

### Contact
- **Issues**: Open a GitHub issue
- **Discussions**: Use GitHub Discussions
- **Email**: business@threeriversbank.com

## License
This project is for demonstration purposes.

## Acknowledgments
Thank you for contributing to the Three Rivers Bank Credit Card Website! Your contributions help make this project better for everyone.

---

**Last Updated:** February 5, 2026  
**Maintained By:** Three Rivers Bank Development Team
