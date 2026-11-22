/**
 * TEMPLATE — page object for one page of YOUR application.
 *
 * 1. Copy to src/pages/<YourPage>.ts and rename the class.
 * 2. Set `path` to the page's URL path (relative to BASE_URL).
 * 3. Set `readyLocator` to an element that proves the page has loaded.
 * 4. Add a locator per element you interact with, and a method per user action.
 *
 * As written it targets the demo app's login page, so it works unchanged.
 */
import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';

export class MyPage extends BasePage {
  // TODO: URL path of your page, e.g. '/dashboard'
  protected readonly path = '/';
  protected readonly readyLocator: Locator;

  // TODO: one locator per element. Prefer, in order:
  //   getByRole()  →  getByLabel()  →  getByTestId()  →  CSS (last resort)
  readonly mainButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.mainButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.getByTestId('error');
    this.readyLocator = this.mainButton;
  }

  // TODO: one method per user action — tests call these, never raw locators.
  async submit(): Promise<void> {
    await this.mainButton.click();
  }

  // Assertion helpers start with "expect" (the linter recognises them).
  async expectError(text: string): Promise<void> {
    await expect(this.errorMessage).toContainText(text);
  }
}
