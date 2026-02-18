import { test, expect, Page } from '@playwright/test';
import creditCards from '../fixtures/credit-cards.json';
import applicationFixture from '../fixtures/card-application.json';

type ApplicationFixture = {
  cardId: number;
  personal: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    homeAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  business: {
    businessLegalName: string;
    businessType: string;
    yearsInBusiness: string;
    taxIdLast4: string;
    businessAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  incomeEmployment: {
    annualPersonalIncome: string;
    annualBusinessRevenue: string;
    employmentStatus: string;
    employerName: string;
    jobTitle: string;
    yearsEmployed: string;
  };
  invalid: {
    email: string;
    phone: string;
  };
};

class CardApplicationPage {
  constructor(private readonly page: Page) {}

  async gotoCardDetails(cardId: number) {
    await this.page.goto(`/cards/${cardId}`);
    await this.page.waitForLoadState('networkidle');
  }

  async gotoApplication(cardId: number) {
    await this.page.goto(`/cards/${cardId}/apply`);
    await this.page.waitForLoadState('networkidle');
    await expect(this.page.getByRole('heading', { name: 'Credit Card Application' })).toBeVisible();
  }

  async clickApplyNow() {
    await this.page.getByTestId('apply-now-button').click();
  }

  async clickNext() {
    await this.page.getByTestId('application-next-button').click();
  }

  async clickBack() {
    await this.page.getByTestId('application-back-button').click();
  }

  async fillPersonalStep(data: ApplicationFixture['personal']) {
    await this.page.getByLabel('First Name').fill(data.firstName);
    await this.page.getByLabel('Last Name').fill(data.lastName);
    await this.page.getByLabel('Email Address').fill(data.email);
    await this.page.getByLabel('Phone Number').fill(data.phone);
    await this.page.getByLabel('Date of Birth').fill(data.dateOfBirth);
    await this.page.getByLabel('Street Address').first().fill(data.homeAddress.street);
    await this.page.getByLabel('City').first().fill(data.homeAddress.city);
    await this.page.getByLabel('State').first().fill(data.homeAddress.state);
    await this.page.getByLabel('Zip Code').first().fill(data.homeAddress.zipCode);
  }

  async fillBusinessStep(data: ApplicationFixture['business']) {
    await this.page.getByLabel('Legal Business Name').fill(data.businessLegalName);
    await this.page.getByLabel('Business Type').click();
    await this.page.getByRole('option', { name: data.businessType }).click();
    await this.page.getByLabel('Years in Business').fill(data.yearsInBusiness);
    await this.page.getByLabel('Tax ID (Last 4 digits)').fill(data.taxIdLast4);

    await this.page.locator('#businessStreet').fill(data.businessAddress.street);
    await this.page.locator('#businessCity').fill(data.businessAddress.city);
    await this.page.locator('#businessState').fill(data.businessAddress.state);
    await this.page.locator('#businessZipCode').fill(data.businessAddress.zipCode);
  }

  async fillIncomeEmploymentStep(data: ApplicationFixture['incomeEmployment']) {
    await this.page.getByLabel('Annual Personal Income').fill(data.annualPersonalIncome);
    await this.page.getByLabel('Annual Business Revenue').fill(data.annualBusinessRevenue);
    await this.page.getByLabel('Employment Status').click();
    await this.page.getByRole('option', { name: data.employmentStatus, exact: true }).click();

    await this.page.getByLabel('Employer Name').fill(data.employerName);
    await this.page.getByLabel('Job Title').fill(data.jobTitle);
    await this.page.getByLabel('Years at Current Job').fill(data.yearsEmployed);
  }

  async submitApplication() {
    await this.page.getByTestId('application-submit-button').click();
  }
}

const fixtureData = applicationFixture as ApplicationFixture;

test.describe('Credit Card Application Flow', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Runs this flow on Chromium desktop for deterministic coverage.');

  test('navigate to application form from card details', async ({ page }) => {
    const applicationPage = new CardApplicationPage(page);
    const selectedCard = creditCards.find((card) => card.id === fixtureData.cardId);

    await applicationPage.gotoCardDetails(fixtureData.cardId);
    await applicationPage.clickApplyNow();

    await expect(page).toHaveURL(new RegExp(`/cards/${fixtureData.cardId}/apply$`));
    await expect(page.getByRole('heading', { name: 'Credit Card Application' })).toBeVisible();
    await expect(page.getByText(`Applying for: ${selectedCard?.name}`)).toBeVisible();
  });

  test('complete multi-step form - happy path', async ({ page }) => {
    const applicationPage = new CardApplicationPage(page);

    await applicationPage.gotoApplication(fixtureData.cardId);

    await expect(page.getByRole('heading', { name: 'Personal Information' })).toBeVisible();
    await applicationPage.fillPersonalStep(fixtureData.personal);
    await applicationPage.clickNext();

    await expect(page.getByRole('heading', { name: 'Business Information' })).toBeVisible();
    await applicationPage.clickBack();
    await expect(page.getByRole('heading', { name: 'Personal Information' })).toBeVisible();

    await applicationPage.clickNext();
    await expect(page.getByRole('heading', { name: 'Business Information' })).toBeVisible();
    await applicationPage.fillBusinessStep(fixtureData.business);
    await applicationPage.clickNext();

    await expect(page.getByRole('heading', { name: 'Income & Employment' })).toBeVisible();
    await applicationPage.fillIncomeEmploymentStep(fixtureData.incomeEmployment);
    await applicationPage.clickNext();

    await expect(page.getByRole('heading', { name: 'Review Application' })).toBeVisible();
    await applicationPage.submitApplication();

    await expect(page).toHaveURL(/\/applications\/.+\/submitted$/);
    await expect(page.getByTestId('application-submitted-title')).toHaveText('Application Submitted');

    const trackingIdLocator = page.getByTestId('application-tracking-id');
    await expect(trackingIdLocator).toBeVisible();
    await expect(trackingIdLocator).not.toHaveText('');
  });

  test('form validation shows required and format errors', async ({ page }) => {
    const applicationPage = new CardApplicationPage(page);

    await applicationPage.gotoApplication(fixtureData.cardId);

    await applicationPage.clickNext();

    await expect(page.getByText('First name must be at least 2 characters.')).toBeVisible();
    await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
    await expect(page.getByText('Please enter a valid 10-digit phone number.')).toBeVisible();

    await page.getByLabel('First Name').fill(fixtureData.personal.firstName);
    await page.getByLabel('Last Name').fill(fixtureData.personal.lastName);
    await page.getByLabel('Email Address').fill(fixtureData.invalid.email);
    await page.getByLabel('Phone Number').fill(fixtureData.invalid.phone);
    await page.getByLabel('Date of Birth').fill(fixtureData.personal.dateOfBirth);
    await page.getByLabel('Street Address').first().fill(fixtureData.personal.homeAddress.street);
    await page.getByLabel('City').first().fill(fixtureData.personal.homeAddress.city);
    await page.getByLabel('State').first().fill(fixtureData.personal.homeAddress.state);
    await page.getByLabel('Zip Code').first().fill(fixtureData.personal.homeAddress.zipCode);

    await applicationPage.clickNext();

    await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
    await expect(page.getByText('Please enter a valid 10-digit phone number.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Personal Information' })).toBeVisible();
  });

  test('step-by-step validation blocks navigation until valid', async ({ page }) => {
    const applicationPage = new CardApplicationPage(page);

    await applicationPage.gotoApplication(fixtureData.cardId);

    await page.getByLabel('First Name').fill(fixtureData.personal.firstName);
    await applicationPage.clickNext();

    await expect(page.getByRole('heading', { name: 'Personal Information' })).toBeVisible();
    await expect(page.getByText('Please enter a valid email address.')).toBeVisible();

    await page.getByLabel('Last Name').fill(fixtureData.personal.lastName);
    await page.getByLabel('Email Address').fill(fixtureData.personal.email);
    await page.getByLabel('Phone Number').fill(fixtureData.personal.phone);
    await page.getByLabel('Date of Birth').fill(fixtureData.personal.dateOfBirth);
    await page.getByLabel('Street Address').first().fill(fixtureData.personal.homeAddress.street);
    await page.getByLabel('City').first().fill(fixtureData.personal.homeAddress.city);
    await page.getByLabel('State').first().fill(fixtureData.personal.homeAddress.state);
    await page.getByLabel('Zip Code').first().fill(fixtureData.personal.homeAddress.zipCode);

    await applicationPage.clickNext();

    await expect(page.getByRole('heading', { name: 'Business Information' })).toBeVisible();
  });
});
