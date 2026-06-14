import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';

test.describe('RBAC — Role Based Access Control', () => {
  const API_BASE = 'https://api.blog.munshinavid.me';

  /**
   * Helper: register and login a new reader user via UI.
   */
  async function loginAsNewReader(page: import('@playwright/test').Page) {
    const uniqueEmail = `rbac_reader_${Date.now()}@munshinavid.me`;
    const password = 'Reader@123456';

    await page.request.post(`${API_BASE}/api/Auth/register`, {
      data: { email: uniqueEmail, password },
    });

    const loginPage = new LoginPage(page);
    await loginPage.loginAsReader(uniqueEmail, password);
    await page.waitForURL('/', { timeout: 15_000 });
  }

  test('Reader navigates to /admin → redirected or blocked', async ({ page }) => {
    await loginAsNewReader(page);

    // Try to navigate to admin dashboard
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // The adminGuard should redirect the reader away from the dashboard.
    // They should NOT see the Admin Dashboard heading.
    const dashboardHeading = page.getByRole('heading', { name: /Admin Dashboard/i });
    const isVisible = await dashboardHeading.isVisible().catch(() => false);
    expect(isVisible).toBe(false);

    // Verify we're not on the admin dashboard URL (redirected to home or login)
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/admin/dashboard');
  });

  test('Reader cannot see Create Post button', async ({ page }) => {
    await loginAsNewReader(page);

    const homePage = new HomePage(page);
    await homePage.goto();

    // Admin Panel dropdown should NOT be visible for readers
    const adminPanelLink = page.getByText('Admin Panel');
    const isAdminPanelVisible = await adminPanelLink.isVisible().catch(() => false);
    expect(isAdminPanelVisible).toBe(false);

    // The "Add Post" link (in admin dashboard) should not be accessible
    const addPostLink = page.getByRole('link', { name: /Add Post/i });
    const isAddPostVisible = await addPostLink.isVisible().catch(() => false);
    expect(isAddPostVisible).toBe(false);
  });

  test('Reader cannot access dashboard stats page', async ({ page }) => {
    await loginAsNewReader(page);

    // Try to hit the admin stats API directly
    const statsResponse = await page.request.get(`${API_BASE}/api/BlogPosts/stats`);
    // Should be 401 or 403 since reader is not admin
    expect([401, 403]).toContain(statsResponse.status());

    // Try navigating to dashboard via UI
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Should be redirected; dashboard stats should not be visible
    const statsCards = page.locator('.stat-card');
    const count = await statsCards.count();
    expect(count).toBe(0);
  });
});
