import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display hero section', async ({ page }) => {
    // Check hero title
    await expect(page.locator('text=Business Credit Cards')).toBeVisible();
    
    // Check hero description
    await expect(page.locator('text=Earn rewards')).toBeVisible();
    
    // Check CTA button
    await expect(page.locator('button:has-text("Compare")')).toBeVisible();
  });

  test('should display featured cards', async ({ page }) => {
    // Wait for cards to load
    await page.waitForLoadState('networkidle');
    
    // Check section title
    await expect(page.locator('text=Featured Business Credit Cards')).toBeVisible();
    
    // Check that at least 3 cards are displayed
    const viewDetailsButtons = page.locator('button:has-text("View Details")');
    const count = await viewDetailsButtons.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('should navigate to card details from featured card', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Click first "View Details" button
    await page.locator('button:has-text("View Details")').first().click();
    
    // Verify navigation
    await expect(page).toHaveURL(/\/cards\/\d+/);
  });

  test('should navigate to comparison page from hero CTA', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Click Compare button
    await page.click('button:has-text("Compare")');
    
    // Verify navigation
    await expect(page).toHaveURL(/\/cards$/);
  });

  test('should navigate to comparison page from "View All Cards"', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Find and click "View All Cards" button
    const viewAllButton = page.locator('button:has-text("View All Cards")');
    if (await viewAllButton.isVisible()) {
      await viewAllButton.click();
      
      // Verify navigation
      await expect(page).toHaveURL(/\/cards$/);
    }
  });

  test('should display benefits section', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check benefits section title
    await expect(page.locator('text=Why Choose Three Rivers Bank?')).toBeVisible();
    
    // Check for benefit items
    await expect(page.locator('text=Competitive Rewards')).toBeVisible();
    await expect(page.locator('text=Expense Management')).toBeVisible();
  });

  test('should have working header navigation', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check header is visible
    await expect(page.locator('text=Three Rivers Bank').first()).toBeVisible();
    
    // Check navigation links
    await expect(page.locator('text=Home')).toBeVisible();
    await expect(page.locator('text=Compare Cards')).toBeVisible();
  });

  test('should have footer with contact information', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check footer content
    await expect(page.locator('text=1-800-THREE-RB')).toBeVisible();
    await expect(page.locator('text=business@threeriversbank.com')).toBeVisible();
    await expect(page.locator('text=Pittsburgh, PA')).toBeVisible();
  });
});
