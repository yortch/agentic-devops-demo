---
name: 'E2E Test Development'
description: 'Guidelines for Playwright E2E tests'
applyTo: 'tests/**/*.{js,ts}'
---

<!-- 
  Based on Playwright best practices and testing patterns from github/awesome-copilot
  Customized for Three Rivers Bank Credit Card Website E2E testing
-->

# E2E Test Development (Playwright)

## Project Context

This test suite validates the Three Rivers Bank Credit Card Website using:
- **Playwright** for cross-browser E2E testing
- **TypeScript** for type-safe test development
- **Test fixtures** in `/tests/fixtures/credit-cards.json` matching H2 seed data
- **Multi-browser testing**: Chromium, WebKit
- **Responsive testing**: Multiple viewport sizes (1920x1080, 768x1024, 375x667)

## Test Structure and Organization

### Test File Location

- All E2E tests in `/tests/e2e/` directory
- Test naming convention: `{feature}.spec.ts`
- Examples: `homepage.spec.ts`, `card-details.spec.ts`, `card-comparison.spec.ts`

### Test File Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Navigate to starting page
    await page.goto('/');
  });

  test('should perform specific action', async ({ page }) => {
    // Arrange: Set up test conditions
    
    // Act: Perform user actions
    
    // Assert: Verify expected outcomes
  });
  
  test.afterEach(async ({ page }) => {
    // Cleanup if needed
  });
});
```

### Test Naming Conventions

- Test descriptions should be clear and specific
- Use "should" pattern: `"should display card list on homepage"`
- Group related tests with `test.describe()`
- Use descriptive block names: `"Card Details Page"`, `"Responsive Design"`

## Playwright Configuration

### Test Execution

- Run all tests: `npx playwright test` (from `/tests/` directory)
- Run specific test: `npx playwright test homepage.spec.ts`
- Run in headed mode: `npx playwright test --headed`
- Run in debug mode: `npx playwright test --debug`
- Run specific browser: `npx playwright test --project=chromium`

### Configuration File

- Config file: `/tests/playwright.config.js`
- Base URL configured for local development
- Multiple viewports for responsive testing
- Screenshot and video on failure
- Retries configured for flaky test handling

## Locator Best Practices

### Locator Priority

1. **Role-based locators** (most resilient):
   ```typescript
   await page.getByRole('button', { name: 'View Details' }).click();
   await page.getByRole('heading', { name: 'Business Cash Rewards' });
   ```

2. **Label-based locators** (for forms):
   ```typescript
   await page.getByLabel('Card Type').selectOption('cash-back');
   ```

3. **Placeholder locators** (for inputs):
   ```typescript
   await page.getByPlaceholder('Search cards...').fill('rewards');
   ```

4. **Test ID locators** (when semantic locators aren't available):
   ```typescript
   await page.getByTestId('card-comparison-table');
   ```

5. **CSS/XPath selectors** (last resort):
   ```typescript
   await page.locator('.card-item').first();
   ```

### Locator Best Practices

- Prefer user-facing attributes (role, label, text) over implementation details
- Avoid brittle selectors based on CSS classes or DOM structure
- Use data-testid sparingly and only when semantic locators aren't viable
- Chain locators for specificity: `page.locator('.card-list').getByRole('button')`
- Wait for elements automatically - Playwright has built-in auto-waiting

## Assertions

### Common Assertions

```typescript
// Visibility
await expect(page.getByRole('heading')).toBeVisible();
await expect(page.locator('.loading')).toBeHidden();

// Text content
await expect(page.getByRole('heading')).toHaveText('Welcome');
await expect(page.locator('.error')).toContainText('error');

// Attributes
await expect(page.getByRole('link')).toHaveAttribute('href', '/cards/1');

// Count
await expect(page.getByRole('listitem')).toHaveCount(5);

// URL
await expect(page).toHaveURL('/cards/1');
await expect(page).toHaveURL(/\/cards\/\d+/);

// Screenshots (visual regression)
await expect(page).toHaveScreenshot('homepage.png');
```

### Assertion Best Practices

- Use specific assertions: `toHaveText()` over `toBeTruthy()`
- Assert on user-visible behavior, not implementation
- Use soft assertions for non-critical checks: `expect.soft()`
- Add meaningful error messages: `expect(value, 'Card should be visible').toBeVisible()`

## Page Object Model (POM)

### When to Use POM

- Consider POM for pages with many tests
- Extract common actions into page objects
- Keep POM simple - don't over-engineer
- Balance between reusability and test clarity

### POM Example

```typescript
// pages/HomePage.ts
export class HomePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  async searchCards(query: string) {
    await this.page.getByPlaceholder('Search cards...').fill(query);
    await this.page.getByRole('button', { name: 'Search' }).click();
  }

  async selectCard(cardName: string) {
    await this.page.getByRole('heading', { name: cardName }).click();
  }
}

// In test file
test('should search for cards', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await homePage.searchCards('rewards');
  await expect(page.getByRole('heading')).toContainText('Rewards');
});
```

## Test Data and Fixtures

### Using Test Fixtures

- Fixtures in `/tests/fixtures/credit-cards.json`
- Fixtures must match H2 seed data exactly
- Import fixtures for test data validation:
  ```typescript
  import cards from '../fixtures/credit-cards.json';
  
  test('should display all cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('listitem')).toHaveCount(cards.length);
  });
  ```

### Test Data Management

- Use fixtures for expected data
- Don't hardcode test data in test files
- Keep fixtures synchronized with backend seed data
- Use environment variables for URLs and configuration

## Responsive Design Testing

### Testing Multiple Viewports

```typescript
test.describe('Responsive Design', () => {
  test('should display mobile menu on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
  });

  test('should display full navigation on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.getByRole('navigation')).toBeVisible();
  });
});
```

### Viewport Breakpoints

- Mobile: 375x667 (iPhone)
- Tablet: 768x1024 (iPad)
- Desktop: 1920x1080 (Full HD)

## API Mocking and Interception

### Intercepting Network Requests

```typescript
test('should handle API errors gracefully', async ({ page }) => {
  // Mock API failure
  await page.route('**/api/cards', route => route.abort());
  
  await page.goto('/');
  await expect(page.getByText('Error loading cards')).toBeVisible();
});

test('should load cards from API', async ({ page }) => {
  // Mock API response
  await page.route('**/api/cards', route => route.fulfill({
    status: 200,
    body: JSON.stringify(mockCards)
  }));
  
  await page.goto('/');
  await expect(page.getByRole('heading')).toHaveCount(mockCards.length);
});
```

## Waiting and Timing

### Auto-Waiting

- Playwright auto-waits for elements to be actionable
- Don't add manual waits unless absolutely necessary
- Trust Playwright's auto-waiting mechanisms

### When Manual Waits Are Needed

```typescript
// Wait for navigation
await Promise.all([
  page.waitForNavigation(),
  page.getByRole('link').click()
]);

// Wait for network idle
await page.waitForLoadState('networkidle');

// Wait for specific element
await page.waitForSelector('.data-loaded');

// Wait for custom condition
await page.waitForFunction(() => window.dataLoaded === true);
```

### Avoid These Patterns

- ❌ `await page.waitForTimeout(1000)` - fragile and slow
- ❌ Arbitrary sleeps - use specific wait conditions
- ❌ Polling in loops - use `waitFor` methods

## Visual Regression Testing

### Screenshot Testing

```typescript
test('should match homepage screenshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});

test('should match card details screenshot', async ({ page }) => {
  await page.goto('/cards/1');
  await expect(page.locator('.card-details')).toHaveScreenshot('card-details.png');
});
```

### Screenshot Best Practices

- Baseline screenshots in `/tests/screenshots/baseline/`
- Use meaningful screenshot names
- Update baselines when UI changes intentionally
- Mask dynamic content (dates, times) from screenshots

## Test Organization Patterns

### Grouping Tests

```typescript
test.describe('Card Details Page', () => {
  test.describe('Desktop View', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });
    
    test('should display full details', async ({ page }) => {
      // Desktop-specific test
    });
  });

  test.describe('Mobile View', () => {
    test.use({ viewport: { width: 375, height: 667 } });
    
    test('should display condensed details', async ({ page }) => {
      // Mobile-specific test
    });
  });
});
```

### Test Isolation

- Each test should be independent
- Don't rely on test execution order
- Reset state in `beforeEach` or `afterEach`
- Use fresh browser context per test

## Debugging Tests

### Debug Mode

```bash
npx playwright test --debug  # Opens inspector
npx playwright test --headed  # See browser
npx playwright show-report  # View HTML report
```

### Console and Trace

```typescript
// Log to console
test('debug test', async ({ page }) => {
  page.on('console', msg => console.log(msg.text()));
  
  // Take screenshot for debugging
  await page.screenshot({ path: 'debug.png' });
  
  // Trace for detailed debugging
  await page.context().tracing.start();
  // ... test actions ...
  await page.context().tracing.stop({ path: 'trace.zip' });
});
```

## Performance Testing

### Measure Page Load

```typescript
test('should load homepage quickly', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000); // 3 seconds
});
```

## Accessibility Testing

### Basic Accessibility Checks

```typescript
test('should be accessible', async ({ page }) => {
  await page.goto('/');
  
  // Check for proper heading structure
  const h1 = await page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  
  // Check for alt text on images
  const images = await page.locator('img').all();
  for (const img of images) {
    await expect(img).toHaveAttribute('alt');
  }
  
  // Check for keyboard navigation
  await page.keyboard.press('Tab');
  const focused = await page.locator(':focus');
  await expect(focused).toBeVisible();
});
```

## Common Pitfalls to Avoid

1. **Don't use arbitrary waits** - Use auto-waiting or specific wait conditions
2. **Don't chain too many actions** - Break into separate, focused tests
3. **Don't test implementation details** - Test user-facing behavior
4. **Don't rely on test order** - Each test should be independent
5. **Don't ignore flaky tests** - Fix or mark as `test.fixme()`
6. **Don't over-use CSS selectors** - Prefer semantic locators

## Best Practices Summary

- ✅ Use role-based locators
- ✅ Test user behavior, not implementation
- ✅ Keep tests independent and isolated
- ✅ Use meaningful test descriptions
- ✅ Leverage Playwright's auto-waiting
- ✅ Test across multiple viewports
- ✅ Use fixtures for test data
- ✅ Handle errors and edge cases
- ✅ Keep tests maintainable and readable
- ✅ Update fixtures when backend data changes

## Key Reference Files

- Test configuration: `/tests/playwright.config.js`
- Test fixtures: `/tests/fixtures/credit-cards.json`
- E2E tests: `/tests/e2e/`
- Package file: `/tests/package.json`
- Existing test examples:
  - `/tests/e2e/homepage.spec.ts`
  - `/tests/e2e/card-details.spec.ts`
  - `/tests/e2e/card-comparison.spec.ts`
  - `/tests/e2e/responsive-design.spec.ts`
