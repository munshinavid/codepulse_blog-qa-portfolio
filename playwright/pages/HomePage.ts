import { type Page, type Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly heroTitle: Locator;
  readonly latestPostsHeading: Locator;
  readonly blogCards: Locator;
  readonly blogCardTitles: Locator;
  readonly readMoreButtons: Locator;
  readonly postsContainer: Locator;
  readonly navbarBrand: Locator;
  readonly loginNavLink: Locator;
  readonly logoutButton: Locator;
  readonly userEmail: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heroTitle = page.locator('.hero-title');
    this.latestPostsHeading = page.getByRole('heading', { name: /Latest Posts/i });
    this.blogCards = page.locator('.blog-card');
    this.blogCardTitles = page.locator('.blog-card .card-title');
    this.readMoreButtons = page.getByRole('link', { name: /Read More/i });
    this.postsContainer = page.locator('#posts');
    this.navbarBrand = page.locator('.navbar-brand');
    this.loginNavLink = page.getByRole('link', { name: /^Login$/i });
    this.logoutButton = page.getByRole('button', { name: /Logout/i });
    this.userEmail = page.locator('.navbar .small');
  }

  async goto() {
    await this.page.goto('/');
    await this.heroTitle.waitFor({ state: 'visible', timeout: 15_000 });
  }

  async expectPostsVisible(minCount = 1) {
    await this.blogCards.first().waitFor({ state: 'visible', timeout: 15_000 });
    const count = await this.blogCards.count();
    expect(count).toBeGreaterThanOrEqual(minCount);
  }

  async clickFirstPost() {
    await this.readMoreButtons.first().waitFor({ state: 'visible', timeout: 15_000 });
    await this.readMoreButtons.first().click();
  }

  async getPostTitles(): Promise<string[]> {
    await this.blogCardTitles.first().waitFor({ state: 'visible', timeout: 15_000 });
    return this.blogCardTitles.allTextContents();
  }

  async expectLogoutButtonVisible() {
    await expect(this.logoutButton).toBeVisible({ timeout: 10_000 });
  }

  async expectLoginLinkVisible() {
    await expect(this.loginNavLink).toBeVisible({ timeout: 10_000 });
  }

  async clickLogout() {
    await this.logoutButton.click();
  }

  async searchPosts(query: string) {
    // The home page uses query params for search — navigate directly
    await this.page.goto(`/?query=${encodeURIComponent(query)}`);
  }

  async expectPostTitleContains(text: string) {
    const titles = await this.getPostTitles();
    const found = titles.some(t => t.toLowerCase().includes(text.toLowerCase()));
    expect(found).toBe(true);
  }

  async expectUserEmailVisible(email: string) {
    await expect(this.userEmail).toContainText(email, { timeout: 10_000 });
  }
}
