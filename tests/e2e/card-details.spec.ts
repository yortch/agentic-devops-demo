import { test, expect } from '@playwright/test';

test.describe('Card Details Page', () => {
  test('should display card details for Business Cash Rewards', async ({ page }) => {
    await page.goto('/cards/1');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check card name
    await expect(page.locator('h1, h3')).toContainText('Business Cash Rewards');
    
    // Check card type chip
    await expect(page.locator('text=Cash Back')).toBeVisible();
    
    // Check annual fee
    await expect(page.locator('text=$0')).toBeVisible();
    
    // Check rewards rate
    await expect(page.locator('text=2%')).toBeVisible();
  });

  test('should display features accordion', async ({ page }) => {
    await page.goto('/cards/1');
    await page.waitForLoadState('networkidle');
    
    // Find and expand features accordion
    const featuresAccordion = page.locator('text=Card Features');
    await expect(featuresAccordion).toBeVisible();
    
    // Click to expand (if not already expanded)
    await featuresAccordion.click();
    
    // Verify features are displayed
    await expect(page.locator('text=Unlimited 2% cash back')).toBeVisible();
  });

  test('should display benefits accordion', async ({ page }) => {
    await page.goto('/cards/1');
    await page.waitForLoadState('networkidle');
    
    // Find and expand benefits accordion
    const benefitsAccordion = page.locator('text=Benefits');
    if (await benefitsAccordion.isVisible()) {
      await benefitsAccordion.click();
      
      // Verify benefits are displayed
      await expect(page.locator('text=insurance').first()).toBeVisible();
    }
  });

  test('should display fee schedule', async ({ page }) => {
    await page.goto('/cards/1');
    await page.waitForLoadState('networkidle');
    
    // Find and expand fee schedule accordion
    const feeAccordion = page.locator('text=Fee Schedule');
    if (await feeAccordion.isVisible()) {
      await feeAccordion.click();
      
      // Verify fee table is displayed
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('text=Annual Fee')).toBeVisible();
    }
  });

  test('should display interest rates', async ({ page }) => {
    await page.goto('/cards/1');
    await page.waitForLoadState('networkidle');
    
    // Find and expand interest rates accordion
    const interestAccordion = page.locator('text=Interest Rates');
    if (await interestAccordion.isVisible()) {
      await interestAccordion.click();
      
      // Verify interest table is displayed
      await expect(page.locator('table')).toBeVisible();
    }
  });

  test('should have apply now button', async ({ page }) => {
    await page.goto('/cards/1');
    await page.waitForLoadState('networkidle');
    
    // Check for Apply Now button
    await expect(page.locator('button:has-text("Apply Now")')).toBeVisible();
  });

  test('should navigate back to comparison', async ({ page }) => {
    await page.goto('/cards/1');
    await page.waitForLoadState('networkidle');
    
    // Click back button
    await page.click('button:has-text("Back")');
    
    // Verify navigation back to comparison page
    await expect(page).toHaveURL(/\/cards$/);
  });
});
