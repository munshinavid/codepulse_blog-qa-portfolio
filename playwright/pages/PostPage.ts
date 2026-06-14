import { type Page, type Locator, expect } from '@playwright/test';

export class PostPage {
  readonly page: Page;
  readonly postTitle: Locator;
  readonly postContent: Locator;
  readonly authorName: Locator;
  readonly publishedDate: Locator;
  readonly viewCount: Locator;
  readonly readingTime: Locator;
  readonly categoryBadges: Locator;
  readonly featuredImage: Locator;
  readonly backToHomeButton: Locator;

  // Comment section
  readonly commentsHeading: Locator;
  readonly commentTextarea: Locator;
  readonly submitCommentButton: Locator;
  readonly commentsList: Locator;
  readonly commentCards: Locator;
  readonly commentSubmitError: Locator;
  readonly noCommentsMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.postTitle = page.locator('h1.display-4');
    this.postContent = page.locator('.blog-content');
    this.authorName = page.locator('.bi-person-circle').locator('..');
    this.publishedDate = page.locator('.bi-calendar3').locator('..');
    this.viewCount = page.locator('.meta-pill').filter({ hasText: /views/i });
    this.readingTime = page.locator('.meta-pill').filter({ hasText: /min read/i });
    this.categoryBadges = page.locator('.badge.rounded-pill');
    this.featuredImage = page.locator('img.img-fluid');
    this.backToHomeButton = page.getByRole('link', { name: /Back to Home/i });

    // Comment section
    this.commentsHeading = page.getByRole('heading', { name: /Comments/i });
    this.commentTextarea = page.getByPlaceholder('Write your comment...');
    this.submitCommentButton = page.getByRole('button', { name: /Submit Comment/i });
    this.commentsList = page.locator('app-comment-section article.card');
    this.commentCards = page.locator('app-comment-section article.card');
    this.commentSubmitError = page.locator('app-comment-section .alert-danger');
    this.noCommentsMessage = page.getByText(/No comments yet/i);
  }

  async goto(urlHandle: string) {
    await this.page.goto(`/blog/${urlHandle}`);
    await this.postTitle.waitFor({ state: 'visible', timeout: 20_000 });
  }

  async expectTitleVisible() {
    await expect(this.postTitle).toBeVisible({ timeout: 15_000 });
  }

  async expectContentVisible() {
    await expect(this.postContent).toBeVisible({ timeout: 15_000 });
  }

  async getTitle(): Promise<string> {
    return (await this.postTitle.textContent()) ?? '';
  }

  async expectTitleContains(text: string) {
    await expect(this.postTitle).toContainText(text, { timeout: 15_000 });
  }

  async addComment(text: string) {
    await this.commentTextarea.waitFor({ state: 'visible', timeout: 10_000 });
    await this.commentTextarea.fill(text);
    await this.submitCommentButton.click();
  }

  async expectCommentVisible(text: string) {
    const comment = this.page.locator('app-comment-section article.card', { hasText: text });
    await expect(comment).toBeVisible({ timeout: 15_000 });
  }

  async expectCommentNotVisible(text: string) {
    const comment = this.page.locator('app-comment-section article.card', { hasText: text });
    await expect(comment).toHaveCount(0, { timeout: 15_000 });
  }

  async deleteComment(text: string) {
    const commentCard = this.page.locator('app-comment-section article.card', { hasText: text });
    
    // Handle confirm dialog
    this.page.once('dialog', dialog => dialog.accept());
    
    const deleteBtn = commentCard.getByRole('button', { name: /Delete/i });
    await deleteBtn.click();
  }

  async getCommentCount(): Promise<number> {
    // Wait a moment for comments to load
    await this.page.waitForTimeout(2_000);
    return this.commentCards.count();
  }

  async expectCommentTextareaVisible() {
    await expect(this.commentTextarea).toBeVisible({ timeout: 10_000 });
  }

  async expectSubmitButtonDisabledOrHidden() {
    // For unauthenticated users, the textarea/submit may exist but submit will fail
    // OR the submit button is disabled
    const isDisabled = await this.submitCommentButton.isDisabled().catch(() => true);
    expect(isDisabled).toBe(true);
  }
}
