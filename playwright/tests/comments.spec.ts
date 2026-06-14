import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { PostPage } from '../pages/PostPage';
import { HomePage } from '../pages/HomePage';

test.describe('Comments', () => {
  const API_BASE = 'https://api.blog.munshinavid.me';

  test('Login as reader → add comment on first post → comment appears', async ({ page }) => {
    const uniqueEmail = `commenter_${Date.now()}@munshinavid.me`;
    const password = 'Reader@123456';
    const commentText = `Playwright comment ${Date.now()}`;

    // Register reader via API
    const registerRes = await page.request.post(`${API_BASE}/api/Auth/register`, {
      data: { email: uniqueEmail, password },
    });
    expect(registerRes.ok()).toBeTruthy();

    // Login via UI
    const loginPage = new LoginPage(page);
    await loginPage.loginAsReader(uniqueEmail, password);
    await page.waitForURL('/', { timeout: 15_000 });

    // Navigate to first post
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.expectPostsVisible(1);
    await homePage.clickFirstPost();
    await page.waitForURL(/\/blog\/.+/, { timeout: 15_000 });

    // Add comment
    const postPage = new PostPage(page);
    await postPage.addComment(commentText);

    // Verify comment appears
    await postPage.expectCommentVisible(commentText);
  });

  test('Delete own comment → comment removed from list', async ({ page }) => {
    const uniqueEmail = `delcomment_${Date.now()}@munshinavid.me`;
    const password = 'Reader@123456';
    const commentText = `Delete me ${Date.now()}`;

    // Register reader via API
    await page.request.post(`${API_BASE}/api/Auth/register`, {
      data: { email: uniqueEmail, password },
    });

    // Login via UI
    const loginPage = new LoginPage(page);
    await loginPage.loginAsReader(uniqueEmail, password);
    await page.waitForURL('/', { timeout: 15_000 });

    // Navigate to first post
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.expectPostsVisible(1);
    await homePage.clickFirstPost();
    await page.waitForURL(/\/blog\/.+/, { timeout: 15_000 });

    // Add a comment first
    const postPage = new PostPage(page);
    await postPage.addComment(commentText);
    await postPage.expectCommentVisible(commentText);

    // Delete the comment
    await postPage.deleteComment(commentText);

    // Verify it's removed
    await postPage.expectCommentNotVisible(commentText);
  });

  test('Unauthenticated user → comment submit blocked', async ({ page }) => {
    // Navigate to first post without logging in
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.expectPostsVisible(1);
    await homePage.clickFirstPost();
    await page.waitForURL(/\/blog\/.+/, { timeout: 15_000 });

    const postPage = new PostPage(page);

    // The textarea exists but submitting should fail (API returns 401)
    // Try to type a comment and submit
    const textareaVisible = await postPage.commentTextarea.isVisible().catch(() => false);

    if (textareaVisible) {
      await postPage.commentTextarea.fill('This should fail');
      await postPage.submitCommentButton.click();

      // Wait for the error message to appear
      await expect(postPage.commentSubmitError).toBeVisible({ timeout: 10_000 });
    }
    
  });
});
