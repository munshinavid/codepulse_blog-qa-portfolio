import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorAlert: Locator;
  readonly heading: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByPlaceholder('Enter your email');
    this.passwordInput = page.getByPlaceholder('Enter your password');
    this.loginButton = page.getByRole('button', { name: /Login/i });
    this.errorAlert = page.locator('.alert-danger');
    this.heading = page.getByRole('heading', { name: /Welcome Back/i });
    this.registerLink = page.getByRole('link', { name: /Register here/i });
  }

  async goto() {
    await this.page.goto('/login');
    await this.heading.waitFor({ state: 'visible', timeout: 15_000 });
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginAsAdmin() {
    await this.goto();
    await this.login('admin@myblog.com', '1234');
  }

  async loginAsReader(email: string, password: string) {
    await this.goto();
    await this.login(email, password);
  }

  async expectErrorVisible() {
    await expect(this.errorAlert).toBeVisible({ timeout: 10_000 });
  }

  async expectErrorContains(text: string) {
    await expect(this.errorAlert).toContainText(text, { timeout: 10_000 });
  }
}
