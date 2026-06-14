import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { AdminPage } from '../pages/AdminPage';
import { HomePage } from '../pages/HomePage';

test.describe('Admin', () => {
  test('Login as admin → admin dashboard stats visible', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginAsAdmin();
    await page.waitForURL('/', { timeout: 15_000 });

    const adminPage = new AdminPage(page);
    await adminPage.gotoDashboard();
    await adminPage.expectDashboardVisible();
    await adminPage.expectStatsVisible();
  });

  test('Create post with unique title → appears in post list', async ({ page }) => {
    const uniqueTitle = `Playwright Test ${Date.now()}`;
    const urlHandle = `playwright-test-${Date.now()}`;

    // Login as admin
    const loginPage = new LoginPage(page);
    await loginPage.loginAsAdmin();
    await page.waitForURL('/', { timeout: 15_000 });

    // Create the post
    const adminPage = new AdminPage(page);
    await adminPage.createPost(uniqueTitle, urlHandle);

    // Verify it appears in the admin blog posts list
    await page.waitForLoadState('networkidle');

    // Navigate to dashboard to see the post in the table
    await adminPage.gotoDashboard();
    await adminPage.expectPostInTable(uniqueTitle);
  });

  test('Soft-delete created post → disappears from public view', async ({ page }) => {
    const uniqueTitle = `Playwright Delete ${Date.now()}`;
    const urlHandle = `playwright-delete-${Date.now()}`;

    // Login as admin
    const loginPage = new LoginPage(page);
    await loginPage.loginAsAdmin();
    await page.waitForURL('/', { timeout: 15_000 });

    // Create a post first
    const adminPage = new AdminPage(page);
    await adminPage.createPost(uniqueTitle, urlHandle);

    // Go to dashboard and verify it exists
    await adminPage.gotoDashboard();
    await adminPage.expectPostInTable(uniqueTitle);

    // Delete the post
    await adminPage.deletePostByTitle(uniqueTitle);

    // Wait for refresh and verify it shows as Deleted
    await page.waitForTimeout(2_000);
    await adminPage.gotoDashboard();
    await adminPage.expectPostHasStatus(uniqueTitle, 'Deleted');

    // Verify it's gone from public home page
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // The deleted post should NOT appear in visible posts
    const titles = await homePage.getPostTitles();
    const found = titles.some(t => t.trim() === uniqueTitle);
    expect(found).toBe(false);
  });

  test('Restore deleted post → reappears in public view', async ({ page }) => {
    const uniqueTitle = `Playwright Restore ${Date.now()}`;
    const urlHandle = `playwright-restore-${Date.now()}`;

    // Login as admin
    const loginPage = new LoginPage(page);
    await loginPage.loginAsAdmin();
    await page.waitForURL('/', { timeout: 15_000 });

    // Create, delete, then restore
    const adminPage = new AdminPage(page);
    await adminPage.createPost(uniqueTitle, urlHandle);

    await adminPage.gotoDashboard();
    await adminPage.expectPostInTable(uniqueTitle);

    // Soft-delete
    await adminPage.deletePostByTitle(uniqueTitle);
    await page.waitForTimeout(2_000);
    await adminPage.gotoDashboard();
    await adminPage.expectPostHasStatus(uniqueTitle, 'Deleted');

    // Restore
    await adminPage.restorePostByTitle(uniqueTitle);
    await page.waitForTimeout(2_000);
    await adminPage.gotoDashboard();
    await adminPage.expectPostHasStatus(uniqueTitle, 'Published');

    // Verify it reappears on public home
    const homePage = new HomePage(page);
    await homePage.goto();

    const titles = await homePage.getPostTitles();
    const found = titles.some(t => t.trim() === uniqueTitle);
    expect(found).toBe(true);
  });
});
