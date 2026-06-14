import { type Page, type Locator, expect } from '@playwright/test';

export class AdminPage {
  readonly page: Page;
  readonly dashboardHeading: Locator;
  readonly totalPostsStat: Locator;
  readonly publishedStat: Locator;
  readonly draftsStat: Locator;
  readonly trashStat: Locator;
  readonly statsCards: Locator;
  readonly addPostButton: Locator;
  readonly manageContentHeading: Locator;
  readonly postRows: Locator;
  readonly postTable: Locator;
  readonly refreshButton: Locator;

  // Add Post form elements
  readonly titleInput: Locator;
  readonly urlHandleInput: Locator;
  readonly authorInput: Locator;
  readonly publishedDateInput: Locator;
  readonly descriptionInput: Locator;
  readonly contentInput: Locator;
  readonly isVisibleSwitch: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dashboardHeading = page.getByRole('heading', { name: /Admin Dashboard/i });
    this.totalPostsStat = page.locator('.stat-card').filter({ hasText: /Total Posts/i });
    this.publishedStat = page.locator('.stat-card').filter({ hasText: /Published/i });
    this.draftsStat = page.locator('.stat-card').filter({ hasText: /Drafts/i });
    this.trashStat = page.locator('.stat-card').filter({ hasText: /Trash/i });
    this.statsCards = page.locator('.stat-card');
    this.addPostButton = page.getByRole('link', { name: /Add Post/i });
    this.manageContentHeading = page.getByRole('heading', { name: /Manage Content/i });
    this.postRows = page.locator('table tbody tr');
    this.postTable = page.locator('table');
    this.refreshButton = page.getByRole('button', { name: /Refresh/i });

    // Add Post form
    this.titleInput = page.getByPlaceholder('Enter post title');
    this.urlHandleInput = page.getByPlaceholder('e.g., my-first-post');
    this.authorInput = page.getByPlaceholder('Author name');
    this.publishedDateInput = page.locator('input[type="date"]');
    this.descriptionInput = page.getByPlaceholder('A brief summary of the post...');
    this.contentInput = page.getByPlaceholder(/Write your post in Markdown/i);
    this.isVisibleSwitch = page.locator('#isVisible');
    this.saveButton = page.getByRole('button', { name: /Save Blog Post/i });
  }

  async gotoDashboard() {
    await this.page.goto('/admin/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoAddPost() {
    await this.page.goto('/admin/blogposts/add');
    await this.page.waitForLoadState('networkidle');
  }

  async expectDashboardVisible() {
    await expect(this.dashboardHeading).toBeVisible({ timeout: 15_000 });
  }

  async expectStatsVisible() {
    await expect(this.totalPostsStat).toBeVisible({ timeout: 15_000 });
    await expect(this.publishedStat).toBeVisible({ timeout: 15_000 });
  }

  async createPost(title: string, urlHandle: string) {
    await this.gotoAddPost();
    await this.titleInput.waitFor({ state: 'visible', timeout: 15_000 });

    await this.titleInput.fill(title);
    await this.urlHandleInput.fill(urlHandle);
    await this.authorInput.fill('Playwright Bot');
    
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    await this.publishedDateInput.fill(today);

    // Featured Image URL is required by the form validators
    const featuredImgUrlInput = this.page.getByPlaceholder('https://...');
    await featuredImgUrlInput.fill('https://placehold.co/600x400/1a1a3e/818cf8?text=Playwright+Test');

    await this.descriptionInput.fill('Automated test post created by Playwright');
    await this.contentInput.fill(`# ${title}\n\nThis is an automated test post.\n\nCreated at ${new Date().toISOString()}`);

    // Ensure isVisible is checked
    if (!(await this.isVisibleSwitch.isChecked())) {
      await this.isVisibleSwitch.check();
    }

    await this.saveButton.click();

    // Wait for navigation back to blog posts list
    await this.page.waitForURL(/\/admin\/blogposts/i, { timeout: 15_000 });
  }

  async findPostRowByTitle(title: string): Promise<Locator> {
    return this.postTable.locator('tr', { hasText: title });
  }

  async deletePostByTitle(title: string) {
    const row = await this.findPostRowByTitle(title);
    
    // Handle confirm dialog
    this.page.once('dialog', dialog => dialog.accept());
    
    const deleteButton = row.getByRole('button', { name: /Delete/i });
    await deleteButton.click();

    // Wait for the page to refresh
    await this.page.waitForLoadState('networkidle');
  }

  async restorePostByTitle(title: string) {
    const row = await this.findPostRowByTitle(title);

    // Handle confirm dialog
    this.page.once('dialog', dialog => dialog.accept());

    const restoreButton = row.getByRole('button', { name: /Restore/i });
    await restoreButton.click();

    // Wait for the page to refresh
    await this.page.waitForLoadState('networkidle');
  }

  async expectPostInTable(title: string) {
    const row = await this.findPostRowByTitle(title);
    await expect(row).toBeVisible({ timeout: 15_000 });
  }

  async expectPostNotInTable(title: string) {
    const row = this.postTable.locator('tr', { hasText: title });
    await expect(row).toHaveCount(0, { timeout: 15_000 });
  }

  async expectPostHasStatus(title: string, status: string) {
    const row = await this.findPostRowByTitle(title);
    await expect(row.locator('.badge', { hasText: status })).toBeVisible({ timeout: 10_000 });
  }
}
