import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';

test.describe('Authentication', () => {
  test('Valid admin login → dashboard visible', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginAsAdmin();

    // After admin login, user is redirected to home; verify logged-in state
    await page.waitForURL('/', { timeout: 15_000 });

    const homePage = new HomePage(page);
    await homePage.expectLogoutButtonVisible();
    await homePage.expectUserEmailVisible('admin@myblog.com');

    // Admin should be able to navigate to dashboard
    await page.goto('/admin/dashboard');
    await expect(page.getByRole('heading', { name: /Admin Dashboard/i })).toBeVisible({ timeout: 15_000 });
  });

  test('Valid reader login → home page visible', async ({ page }) => {
    // First register a unique reader
    const uniqueEmail = `reader_${Date.now()}@test.com`;
    const password = 'Reader@123456';

    // Register via API
    const registerResponse = await page.request.post('https://api.blog.munshinavid.me/api/Auth/register', {
      data: { email: uniqueEmail, password },
    });
    expect(registerResponse.ok()).toBeTruthy();

    // Login via UI
    const loginPage = new LoginPage(page);
    await loginPage.loginAsReader(uniqueEmail, password);

    // Should be redirected to home
    await page.waitForURL('/', { timeout: 15_000 });

    const homePage = new HomePage(page);
    await homePage.expectLogoutButtonVisible();
    await homePage.expectUserEmailVisible(uniqueEmail);
  });

  test('Invalid credentials → error message visible', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('nonexistent@test.com', 'wrongpassword');

    await loginPage.expectErrorVisible();
    await loginPage.expectErrorContains('Invalid email or password');
  });

  test('Logout → login page shown', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginAsAdmin();

    await page.waitForURL('/', { timeout: 15_000 });

    const homePage = new HomePage(page);
    await homePage.expectLogoutButtonVisible();
    await homePage.clickLogout();

    // After logout, Login link should reappear in navbar
    await homePage.expectLoginLinkVisible();
  });
});
