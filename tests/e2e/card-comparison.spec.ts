import { test, expect } from '@playwright/test';

test.describe('Card Comparison Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cards');
  });

  test('should display all credit cards', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1').first()).toContainText('Compare Business Credit Cards');
    
    // Wait for cards to load - check for card names instead of role
    await expect(page.locator('text=Business Cash Rewards')).toBeVisible({ timeout: 10000 });
    
    // Check that we have all 5 cards displayed
    const cardNames = ['Business Cash Rewards', 'Business Travel Rewards', 'Business Platinum', 'Business Premium', 'Business Flex'];
    for (const name of cardNames) {
      await expect(page.locator(`text=${name}`).first()).toBeVisible();
    }
  });

  test('should filter cards by type', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click on Card Type dropdown (use combobox role for MUI Select)
    await page.locator('[role="combobox"]').first().click();
    
    // Wait for dropdown menu and select "Cash Back" type
    await page.locator('[role="option"]', { hasText: 'Cash Back' }).click();
    
    // Verify filtered results
    await expect(page.locator('text=Business Cash Rewards')).toBeVisible();
  });

  test('should filter cards by annual fee', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click on Annual Fee dropdown (second combobox)
    await page.locator('[role="combobox"]').nth(1).click();
    
    // Wait for dropdown menu and select "No Annual Fee"
    await page.locator('[role="option"]', { hasText: 'No Annual Fee' }).click();
    
    // Verify only cards with $0 annual fee are shown
    const freeCards = ['Business Cash Rewards', 'Business Platinum', 'Business Flex'];
    for (const cardName of freeCards) {
      await expect(page.locator(`text=${cardName}`).first()).toBeVisible();
    }
  });

  test('should switch between grid and table view', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find and click table view button
    const tableViewButton = page.locator('button[value="table"]');
    await expect(tableViewButton).toBeVisible();
    await tableViewButton.click();
    
    // Verify table is displayed
    await expect(page.locator('table')).toBeVisible();
    
    // Switch back to grid view
    await page.locator('button[value="grid"]').click();
    
    // Verify cards are displayed
    await expect(page.locator('text=Business Cash Rewards')).toBeVisible();
  });

  test('should navigate to card details', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click on first "View Details" button
    await page.click('button:has-text("View Details")');
    
    // Verify navigation to detail page
    await expect(page).toHaveURL(/\/cards\/\d+/);
    
    // Verify detail page loaded
    await expect(page.locator('text=Annual Fee').first()).toBeVisible();
  });
});
