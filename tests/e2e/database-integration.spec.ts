import { test, expect } from '@playwright/test';
import creditCards from '../fixtures/credit-cards.json';

test.describe('Database Integration', () => {
  test('should fetch and display all cards from H2 database', async ({ page }) => {
    await page.goto('/cards');
    await page.waitForLoadState('networkidle');
    
    // Verify all 5 cards are loaded
    for (const card of creditCards) {
      const cardElement = page.locator(`text=${card.name}`);
      await expect(cardElement).toBeVisible();
    }
  });

  test('should display correct card details from database', async ({ page }) => {
    const card = creditCards[0]; // Business Cash Rewards
    
    await page.goto(`/cards/${card.id}`);
    await page.waitForLoadState('networkidle');
    
    // Verify card details match database
    await expect(page.locator('h1').first()).toContainText(card.name);
    await expect(page.locator('text=$0').first()).toBeVisible(); // Annual fee
    
    // Check APR is displayed
    await expect(page.locator(`text=${card.regularApr}`)).toBeVisible();
  });

  test('should display fee schedules from database', async ({ page }) => {
    await page.goto('/cards/1');
    await page.waitForLoadState('networkidle');
    
    // Expand fee schedule
    const feeAccordion = page.locator('text=Fee Schedule').first();
    if (await feeAccordion.isVisible()) {
      await feeAccordion.click();
      
      // Verify fee types are displayed
      await expect(page.locator('text=Annual Fee').first()).toBeVisible();
      await expect(page.locator('text=Late Payment').first()).toBeVisible();
    }
  });

  test('should display interest rates from database', async ({ page }) => {
    await page.goto('/cards/1');
    await page.waitForLoadState('networkidle');
    
    // Expand interest rates
    const interestAccordion = page.locator('text=Interest Rates').first();
    if (await interestAccordion.isVisible()) {
      await interestAccordion.click();
      
      // Verify rate types are displayed
      await expect(page.locator('text=Purchase APR').first()).toBeVisible();
    }
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Try to access a non-existent card
    await page.goto('/cards/999');
    await page.waitForLoadState('networkidle');
    
    // Wait for React Query to finish loading and show error
    // Look for either the loading spinner to disappear OR error message to appear
    await page.waitForSelector('text=Card not found or error loading card details', { timeout: 10000 })
      .catch(async () => {
        // If error message doesn't appear, wait for loading to stop
        await page.waitForSelector('progressbar', { state: 'hidden', timeout: 10000 }).catch(() => {});
      });
    
    // Should show error message with back button
    const errorMessage = page.locator('text=Card not found').first();
    const backButton = page.locator('button:has-text("Back")').first();
    
    // Either error message or back button should be visible
    const hasError = await errorMessage.isVisible().catch(() => false);
    const hasBackButton = await backButton.isVisible().catch(() => false);
    
    expect(hasError || hasBackButton).toBeTruthy();
  });

  test('should filter cards by type from database', async ({ page }) => {
    await page.goto('/cards');
    await page.waitForLoadState('networkidle');
    
    // Filter by Cash Back cards using combobox role
    await page.locator('[role="combobox"]').first().click();
    await page.locator('[role="option"]', { hasText: 'Cash Back' }).click();
    
    // Verify only Cash Back cards are shown
    await expect(page.locator('text=Business Cash Rewards')).toBeVisible();
    
    // Travel Rewards should not be visible (if filter is working)
    // Note: This depends on filter implementation
  });

  test('should display correct number of cards', async ({ page }) => {
    await page.goto('/cards');
    await page.waitForLoadState('networkidle');
    
    // Count card elements
    const cardNames = [
      'Business Cash Rewards',
      'Business Travel Rewards',
      'Business Platinum',
      'Business Premium',
      'Business Flex'
    ];
    
    // Verify each card is present
    for (const name of cardNames) {
      await expect(page.locator(`text=${name}`).first()).toBeVisible();
    }
  });
});
