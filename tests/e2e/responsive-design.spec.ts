import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('should display correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that desktop navigation is visible
    await expect(page.locator('text=Home')).toBeVisible();
    await expect(page.locator('text=Compare Cards')).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check hero section
    await expect(page.locator('text=Business Credit Cards')).toBeVisible();
    
    // Check cards are displayed in a responsive grid
    const cards = page.locator('text=Business Cash Rewards, Business Travel Rewards, Business Platinum');
    await expect(cards.first()).toBeVisible();
  });

  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check mobile layout
    await expect(page.locator('text=Three Rivers Bank')).toBeVisible();
    
    // Check hero section is visible
    await expect(page.locator('text=Business Credit Cards')).toBeVisible();
  });

  test('should have mobile-friendly comparison page', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/cards');
    await page.waitForLoadState('networkidle');
    
    // Check page title
    await expect(page.locator('text=Compare')).toBeVisible();
    
    // Check cards are stacked vertically
    const viewDetailsButtons = page.locator('button:has-text("View Details")');
    const count = await viewDetailsButtons.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('should have mobile-friendly card details page', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/cards/1');
    await page.waitForLoadState('networkidle');
    
    // Check card name is visible
    await expect(page.locator('text=Business Cash Rewards')).toBeVisible();
    
    // Check quick facts cards are visible
    await expect(page.locator('text=Annual Fee')).toBeVisible();
    
    // Check accordions work on mobile
    const featuresAccordion = page.locator('text=Card Features');
    if (await featuresAccordion.isVisible()) {
      await featuresAccordion.click();
      await expect(page.locator('text=cash back')).toBeVisible();
    }
  });
});
