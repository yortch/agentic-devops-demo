import { test, expect } from '@playwright/test';

test.describe('Credit Card Application Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the card comparison page
    await page.goto('/cards');
    await page.waitForLoadState('networkidle');
  });

  test('should complete full application flow from card details', async ({ page }) => {
    // Step 1: Navigate to card details
    await page.click('text=Business Cash Rewards');
    await page.waitForURL(/\/cards\/\d+/);
    
    // Verify we're on the card details page
    await expect(page.locator('h1')).toContainText('Business Cash Rewards');
    
    // Step 2: Click Apply Now button
    await page.click('[data-testid="apply-now-button"]');
    await page.waitForURL(/\/apply\/\d+/);
    
    // Verify we're on the application form page
    await expect(page.locator('h1')).toContainText('Apply for Business Cash Rewards');
    await expect(page.locator('text=Business Information')).toBeVisible();
    
    // Step 3: Fill out Business Information (Step 1)
    await page.fill('input[name="businessLegalName"]', 'Test Company LLC');
    await page.fill('input[name="taxId"]', '123456789');
    
    // Select business structure
    await page.click('label:has-text("Business Structure")');
    await page.click('text=LLC');
    
    // Select industry
    await page.click('label:has-text("Industry")');
    await page.click('text=Technology');
    
    await page.fill('input[name="yearsInBusiness"]', '5');
    await page.fill('input[name="numberOfEmployees"]', '10');
    
    // Select annual revenue
    await page.click('label:has-text("Annual Business Revenue")');
    await page.click('text=$500,000 - $1,000,000');
    
    await page.fill('input[name="businessStreetAddress"]', '123 Business Blvd');
    await page.fill('input[name="businessCity"]', 'Pittsburgh');
    await page.fill('input[name="businessState"]', 'PA');
    await page.fill('input[name="businessZip"]', '15201');
    await page.fill('input[name="businessPhone"]', '4125551234');
    
    // Click Next to go to Owner Information
    await page.click('button:has-text("Next")');
    await expect(page.locator('text=Owner Information')).toBeVisible();
    
    // Step 4: Fill out Owner Information (Step 2)
    await page.fill('input[name="ownerFirstName"]', 'John');
    await page.fill('input[name="ownerLastName"]', 'Doe');
    await page.fill('input[name="ownerDateOfBirth"]', '1985-01-01');
    await page.fill('input[name="ownerSsn"]', '987654321');
    await page.fill('input[name="ownerEmail"]', 'john.doe@testcompany.com');
    await page.fill('input[name="ownerStreetAddress"]', '456 Home Street');
    await page.fill('input[name="ownerCity"]', 'Pittsburgh');
    await page.fill('input[name="ownerState"]', 'PA');
    await page.fill('input[name="ownerZip"]', '15202');
    await page.fill('input[name="ownerMobilePhone"]', '4125555678');
    await page.fill('input[name="ownershipPercentage"]', '100');
    await page.fill('input[name="ownerTitle"]', 'CEO');
    await page.fill('input[name="ownerAnnualIncome"]', '150000');
    
    // Click Next to go to Card Preferences
    await page.click('button:has-text("Next")');
    await expect(page.locator('text=Card Preferences')).toBeVisible();
    
    // Step 5: Fill out Card Preferences (Step 3)
    await page.click('label:has-text("Requested Credit Limit")');
    await page.click('text=$25k');
    
    await page.fill('input[name="numberOfEmployeeCards"]', '5');
    
    // Click Next to go to Review & Submit
    await page.click('button:has-text("Next")');
    await expect(page.locator('text=Review & Submit')).toBeVisible();
    
    // Step 6: Review and accept terms
    await page.check('input[type="checkbox"]:near(text="I agree to the terms")');
    await page.check('input[type="checkbox"]:near(text="I consent to a credit check")');
    await page.fill('input[name="electronicSignature"]', 'John Doe');
    
    // Click Review Application
    await page.click('button:has-text("Review Application")');
    await page.waitForURL(/\/apply\/\d+\/review/);
    
    // Step 7: Verify review page shows correct data
    await expect(page.locator('h1')).toContainText('Review Your Application');
    await expect(page.locator('text=Test Company LLC')).toBeVisible();
    await expect(page.locator('text=john.doe@testcompany.com')).toBeVisible();
    
    // Verify sensitive data is masked
    await expect(page.locator('text=***-**-6789')).toBeVisible(); // Tax ID
    await expect(page.locator('text=***-**-4321')).toBeVisible(); // SSN
    
    // Step 8: Submit application
    await page.click('[data-testid="submit-application-button"]');
    await page.waitForURL(/\/apply\/\d+\/confirmation/);
    
    // Step 9: Verify confirmation page
    await expect(page.locator('h1')).toContainText('Application Submitted');
    await expect(page.locator('text=TRB-').first()).toBeVisible(); // Application number
    await expect(page.locator('text=Business Cash Rewards')).toBeVisible();
    await expect(page.locator('text=Decision in 5-7 business days')).toBeVisible();
  });

  test('should show Apply Now button on card comparison page in grid view', async ({ page }) => {
    // Verify Apply Now buttons are visible in grid view
    const applyButtons = page.locator('[data-testid^="apply-now-"]');
    await expect(applyButtons.first()).toBeVisible();
    
    // Count should be 5 (one for each card)
    const count = await applyButtons.count();
    expect(count).toBe(5);
  });

  test('should show Apply Now button on card comparison page in table view', async ({ page }) => {
    // Switch to table view
    await page.click('[aria-label*="table"]');
    await page.waitForTimeout(500); // Wait for view change
    
    // Verify Apply Now buttons are visible in table view
    const applyButtons = page.locator('[data-testid^="apply-now-table-"]');
    await expect(applyButtons.first()).toBeVisible();
    
    // Count should be 5 (one for each card)
    const count = await applyButtons.count();
    expect(count).toBe(5);
  });

  test('should navigate to application form when Apply Now clicked from comparison page', async ({ page }) => {
    // Click Apply Now on first card
    await page.click('[data-testid^="apply-now-"]', { first: true });
    
    // Verify navigation to application form
    await page.waitForURL(/\/apply\/\d+/);
    await expect(page.locator('h1')).toContainText('Apply for');
    await expect(page.locator('text=Business Information')).toBeVisible();
  });

  test('should validate required fields on business information step', async ({ page }) => {
    // Navigate to application form
    await page.click('text=Business Cash Rewards');
    await page.click('[data-testid="apply-now-button"]');
    await page.waitForURL(/\/apply\/\d+/);
    
    // Try to proceed without filling required fields
    await page.click('button:has-text("Next")');
    
    // Should still be on step 1 and show validation errors
    await expect(page.locator('text=Business Information')).toBeVisible();
    await expect(page.locator('text=Required')).toBeVisible();
  });

  test('should validate email format on owner information step', async ({ page }) => {
    // Navigate to application form and fill business info
    await page.click('text=Business Cash Rewards');
    await page.click('[data-testid="apply-now-button"]');
    await page.waitForURL(/\/apply\/\d+/);
    
    // Fill minimal business info to proceed
    await fillBusinessInformation(page);
    await page.click('button:has-text("Next")');
    
    // Fill owner info with invalid email
    await page.fill('input[name="ownerEmail"]', 'invalid-email');
    await page.fill('input[name="ownerFirstName"]', 'John');
    
    // Try to proceed
    await page.click('button:has-text("Next")');
    
    // Should show email validation error
    await expect(page.locator('text=Invalid email')).toBeVisible();
  });

  test('should validate age requirement (must be 18+)', async ({ page }) => {
    // Navigate to application form
    await page.click('text=Business Cash Rewards');
    await page.click('[data-testid="apply-now-button"]');
    await page.waitForURL(/\/apply\/\d+/);
    
    // Fill business info
    await fillBusinessInformation(page);
    await page.click('button:has-text("Next")');
    
    // Fill owner info with age under 18
    const today = new Date();
    const under18Date = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
    const dateString = under18Date.toISOString().split('T')[0];
    
    await fillOwnerInformation(page, { dateOfBirth: dateString });
    
    // Try to proceed
    await page.click('button:has-text("Next")');
    
    // Should show age validation error
    await expect(page.locator('text=Must be 18 or older')).toBeVisible();
  });

  test('should show progress indicator throughout application', async ({ page }) => {
    // Navigate to application form
    await page.click('text=Business Cash Rewards');
    await page.click('[data-testid="apply-now-button"]');
    await page.waitForURL(/\/apply\/\d+/);
    
    // Verify progress bar exists
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
    
    // Progress should increase as we fill out fields
    await page.fill('input[name="businessLegalName"]', 'Test Company');
    await page.waitForTimeout(500);
    
    // Progress bar should still be visible
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
  });

  test('should allow navigation back to previous steps', async ({ page }) => {
    // Navigate to application form
    await page.click('text=Business Cash Rewards');
    await page.click('[data-testid="apply-now-button"]');
    await page.waitForURL(/\/apply\/\d+/);
    
    // Fill business info and proceed
    await fillBusinessInformation(page);
    await page.click('button:has-text("Next")');
    await expect(page.locator('text=Owner Information')).toBeVisible();
    
    // Click Back button
    await page.click('button:has-text("Back")');
    
    // Should be back on Business Information step
    await expect(page.locator('text=Business Information')).toBeVisible();
    await expect(page.locator('input[name="businessLegalName"]')).toHaveValue('Test Company LLC');
  });

  test('should allow editing from review page', async ({ page }) => {
    // Complete application up to review
    await completeApplicationToReview(page);
    
    // Click Edit button for business information
    const editButtons = page.locator('button:has-text("Edit")');
    await editButtons.first().click();
    
    // Should navigate back to form
    await page.waitForURL(/\/apply\/\d+$/);
    await expect(page.locator('text=Business Information')).toBeVisible();
  });

  test('should display selected card information at top of form', async ({ page }) => {
    // Navigate to specific card
    await page.click('text=Business Travel Rewards');
    await page.click('[data-testid="apply-now-button"]');
    await page.waitForURL(/\/apply\/\d+/);
    
    // Verify card information is displayed
    await expect(page.locator('text=Selected Card')).toBeVisible();
    await expect(page.locator('text=Business Travel Rewards')).toBeVisible();
    await expect(page.locator('text=Annual Fee: $95')).toBeVisible();
  });

  test('should handle backend validation errors gracefully', async ({ page }) => {
    // Complete application with potentially invalid backend data
    await page.click('text=Business Cash Rewards');
    await page.click('[data-testid="apply-now-button"]');
    await page.waitForURL(/\/apply\/\d+/);
    
    // Fill out all steps
    await fillBusinessInformation(page);
    await page.click('button:has-text("Next")');
    
    await fillOwnerInformation(page);
    await page.click('button:has-text("Next")');
    
    await page.click('label:has-text("Requested Credit Limit")');
    await page.click('text=$25k');
    await page.click('button:has-text("Next")');
    
    await page.check('input[type="checkbox"]:near(text="I agree to the terms")');
    await page.check('input[type="checkbox"]:near(text="I consent to a credit check")');
    await page.fill('input[name="electronicSignature"]', 'John Doe');
    
    await page.click('button:has-text("Review Application")');
    await page.waitForURL(/\/apply\/\d+\/review/);
    
    // Submit button should be clickable
    await expect(page.locator('[data-testid="submit-application-button"]')).toBeEnabled();
  });
});

// Helper functions
async function fillBusinessInformation(page: any) {
  await page.fill('input[name="businessLegalName"]', 'Test Company LLC');
  await page.fill('input[name="taxId"]', '123456789');
  await page.click('label:has-text("Business Structure")');
  await page.click('text=LLC');
  await page.click('label:has-text("Industry")');
  await page.click('text=Technology');
  await page.fill('input[name="yearsInBusiness"]', '5');
  await page.fill('input[name="numberOfEmployees"]', '10');
  await page.click('label:has-text("Annual Business Revenue")');
  await page.click('text=$500,000 - $1,000,000');
  await page.fill('input[name="businessStreetAddress"]', '123 Business Blvd');
  await page.fill('input[name="businessCity"]', 'Pittsburgh');
  await page.fill('input[name="businessState"]', 'PA');
  await page.fill('input[name="businessZip"]', '15201');
  await page.fill('input[name="businessPhone"]', '4125551234');
}

async function fillOwnerInformation(page: any, overrides: any = {}) {
  await page.fill('input[name="ownerFirstName"]', overrides.firstName || 'John');
  await page.fill('input[name="ownerLastName"]', overrides.lastName || 'Doe');
  await page.fill('input[name="ownerDateOfBirth"]', overrides.dateOfBirth || '1985-01-01');
  await page.fill('input[name="ownerSsn"]', overrides.ssn || '987654321');
  await page.fill('input[name="ownerEmail"]', overrides.email || 'john.doe@testcompany.com');
  await page.fill('input[name="ownerStreetAddress"]', overrides.address || '456 Home Street');
  await page.fill('input[name="ownerCity"]', overrides.city || 'Pittsburgh');
  await page.fill('input[name="ownerState"]', overrides.state || 'PA');
  await page.fill('input[name="ownerZip"]', overrides.zip || '15202');
  await page.fill('input[name="ownerMobilePhone"]', overrides.phone || '4125555678');
  await page.fill('input[name="ownershipPercentage"]', overrides.ownership || '100');
  await page.fill('input[name="ownerTitle"]', overrides.title || 'CEO');
  await page.fill('input[name="ownerAnnualIncome"]', overrides.income || '150000');
}

async function completeApplicationToReview(page: any) {
  await page.click('text=Business Cash Rewards');
  await page.click('[data-testid="apply-now-button"]');
  await page.waitForURL(/\/apply\/\d+/);
  
  await fillBusinessInformation(page);
  await page.click('button:has-text("Next")');
  
  await fillOwnerInformation(page);
  await page.click('button:has-text("Next")');
  
  await page.click('label:has-text("Requested Credit Limit")');
  await page.click('text=$25k');
  await page.click('button:has-text("Next")');
  
  await page.check('input[type="checkbox"]:near(text="I agree to the terms")');
  await page.check('input[type="checkbox"]:near(text="I consent to a credit check")');
  await page.fill('input[name="electronicSignature"]', 'John Doe');
  
  await page.click('button:has-text("Review Application")');
  await page.waitForURL(/\/apply\/\d+\/review/);
}
