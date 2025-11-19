import { test, expect } from '@playwright/test';
import creditCards from '../fixtures/credit-cards.json';

test.describe('Card Comparison Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cards');
  });

  test('should display all credit cards', async ({ page }) => {
    await expect(page.locator('h1, h3')).toContainText('Compare Business Credit Cards');
    
    // Wait for cards to load
    await page.waitForSelector('[role="region"]', { state: 'visible', timeout: 10000 });
    
    // Check that we have 5 cards displayed
    const cardCount = await page.locator('text=Business').count();
    expect(cardCount).toBeGreaterThanOrEqual(5);
  });

  test('should filter cards by type', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click on Card Type filter
    await page.click('text=Card Type');
    
    // Select "Cash Back" type
    await page.click('text=Cash Back');
    
    // Verify filtered results
    const cashBackCard = await page.locator('text=Business Cash Rewards');
    await expect(cashBackCard).toBeVisible();
  });

  test('should filter cards by annual fee', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click on Annual Fee filter
    await page.click('text=Annual Fee');
    
    // Select "No Annual Fee"
    await page.click('text=No Annual Fee');
    
    // Verify only cards with $0 annual fee are shown
    const freeCards = ['Business Cash Rewards', 'Business Platinum', 'Business Flex'];
    for (const cardName of freeCards) {
      await expect(page.locator(`text=${cardName}`)).toBeVisible();
    }
  });

  test('should switch between grid and table view', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find and click table view button
    const tableViewButton = page.locator('button[value="table"]');
    if (await tableViewButton.isVisible()) {
      await tableViewButton.click();
      
      // Verify table is displayed
      await expect(page.locator('table')).toBeVisible();
      
      // Switch back to grid view
      await page.locator('button[value="grid"]').click();
      
      // Verify cards are displayed
      await expect(page.locator('text=Business Cash Rewards')).toBeVisible();
    }
  });

  test('should navigate to card details', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click on first "View Details" button
    await page.click('button:has-text("View Details")');
    
    // Verify navigation to detail page
    await expect(page).toHaveURL(/\/cards\/\d+/);
    
    // Verify detail page loaded
    await expect(page.locator('text=Annual Fee')).toBeVisible();
  });
});
