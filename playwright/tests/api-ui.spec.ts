import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { PostPage } from '../pages/PostPage';

test.describe('API ↔ UI Integration', () => {
  const API_BASE = 'https://api.blog.munshinavid.me';

  /**
   * Helper: Login as admin via API and return the JWT cookie value.
   */
  async function getAdminCookie(page: import('@playwright/test').Page): Promise<string> {
    const loginRes = await page.request.post(`${API_BASE}/api/Auth/login`, {
      data: { email: 'admin@myblog.com', password: '1234' },
    });
    expect(loginRes.ok()).toBeTruthy();

    // Extract jwtToken from Set-Cookie header
    const setCookie = loginRes.headers()['set-cookie'] ?? '';
    const match = setCookie.match(/jwtToken=([^;]+)/);
    expect(match).toBeTruthy();
    return match![1];
  }

  /**
   * Helper: Create a category via API (required for post creation).
   */
  async function ensureCategory(page: import('@playwright/test').Page): Promise<string> {
    const res = await page.request.get(`${API_BASE}/api/Categories`);
    const categories = await res.json();

    if (categories.length > 0) {
      return categories[0].id;
    }

    // Create one if none exist
    const createRes = await page.request.post(`${API_BASE}/api/Categories`, {
      data: { name: 'Playwright Cat', urlHandle: 'playwright-cat' },
    });
    const created = await createRes.json();
    return created.id;
  }

  test('Create post via API → verify title appears in UI home page', async ({ page }) => {
    const uniqueTitle = `API Post ${Date.now()}`;
    const urlHandle = `api-post-${Date.now()}`;
    const token = await getAdminCookie(page);
    const categoryId = await ensureCategory(page);

    // Create post via API
    const createRes = await page.request.post(`${API_BASE}/api/BlogPosts`, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: `jwtToken=${token}`,
      },
      data: {
        title: uniqueTitle,
        content: `# ${uniqueTitle}\n\nAPI-created post for Playwright test.`,
        publishedDate: new Date().toISOString(),
        description: 'Playwright API test post',
        author: 'Playwright Bot',
        featuredImgUrl: '',
        urlHandle,
        isVisible: true,
        categoryIds: [categoryId],
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const createdPost = await createRes.json();
    const postId = createdPost.id;

    // Verify it appears in UI
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.expectPostsVisible(1);

    const titles = await homePage.getPostTitles();
    const found = titles.some(t => t.trim() === uniqueTitle);
    expect(found).toBe(true);

    // Cleanup: hard-delete the post
    await page.request.delete(`${API_BASE}/api/BlogPosts/hard-delete/${postId}`, {
      headers: { Cookie: `jwtToken=${token}` },
    });
  });

  test('Delete post via API → verify post removed from UI', async ({ page }) => {
    const uniqueTitle = `API Delete ${Date.now()}`;
    const urlHandle = `api-delete-${Date.now()}`;
    const token = await getAdminCookie(page);
    const categoryId = await ensureCategory(page);

    // Create a post via API
    const createRes = await page.request.post(`${API_BASE}/api/BlogPosts`, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: `jwtToken=${token}`,
      },
      data: {
        title: uniqueTitle,
        content: `# ${uniqueTitle}\n\nPost to be deleted.`,
        publishedDate: new Date().toISOString(),
        description: 'Delete test post',
        author: 'Playwright Bot',
        featuredImgUrl: '',
        urlHandle,
        isVisible: true,
        categoryIds: [categoryId],
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const createdPost = await createRes.json();
    const postId = createdPost.id;

    // Verify it's visible first
    const homePage = new HomePage(page);
    await homePage.goto();
    let titles = await homePage.getPostTitles();
    let found = titles.some(t => t.trim() === uniqueTitle);
    expect(found).toBe(true);

    // Soft-delete via API
    const deleteRes = await page.request.delete(`${API_BASE}/api/BlogPosts/${postId}`, {
      headers: { Cookie: `jwtToken=${token}` },
    });
    expect(deleteRes.status()).toBe(204);

    // Verify it's gone from UI
    await homePage.goto();
    titles = await homePage.getPostTitles();
    found = titles.some(t => t.trim() === uniqueTitle);
    expect(found).toBe(false);

    // Cleanup: hard-delete
    await page.request.delete(`${API_BASE}/api/BlogPosts/hard-delete/${postId}`, {
      headers: { Cookie: `jwtToken=${token}` },
    });
  });

  test('Create comment via API → verify comment count increases in UI', async ({ page }) => {
    const token = await getAdminCookie(page);

    // Get a post to comment on
    const postsRes = await page.request.get(`${API_BASE}/api/BlogPosts?page=1&pageSize=1`);
    const postsData = await postsRes.json();
    expect(postsData.items.length).toBeGreaterThan(0);

    const targetPost = postsData.items[0];
    const postId = targetPost.id;
    const postUrlHandle = targetPost.urlHandle;

    // Get current comment count from API
    const commentsBeforeRes = await page.request.get(`${API_BASE}/api/Comments/post/${postId}`);
    const commentsBefore = await commentsBeforeRes.json();
    const countBefore = commentsBefore.length;

    // Add comment via API
    const commentText = `API comment ${Date.now()}`;
    const addCommentRes = await page.request.post(`${API_BASE}/api/Comments`, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: `jwtToken=${token}`,
      },
      data: {
        content: commentText,
        blogPostId: postId,
      },
    });
    expect(addCommentRes.ok()).toBeTruthy();
    const createdComment = await addCommentRes.json();

    // Navigate to the post in UI and verify the comment is visible
    const loginPage = new LoginPage(page);
    await loginPage.loginAsAdmin();
    await page.waitForURL('/', { timeout: 15_000 });

    const postPage = new PostPage(page);
    await postPage.goto(postUrlHandle);

    // Verify comment appears in UI
    await postPage.expectCommentVisible(commentText);

    // Verify comment count increased
    const countAfter = await postPage.getCommentCount();
    expect(countAfter).toBeGreaterThan(countBefore);

    // Cleanup: delete the comment via API
    await page.request.delete(`${API_BASE}/api/Comments/${createdComment.id}`, {
      headers: { Cookie: `jwtToken=${token}` },
    });
  });
});
