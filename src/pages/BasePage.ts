import { expect, type Locator, type Page } from '@playwright/test';
import { HeaderComponent } from '@components/HeaderComponent';

/**
 * Shared behaviour for every page object.
 * Subclasses declare their relative `path` and a `readyLocator` that proves the
 * page has rendered — `open()` and `expectLoaded()` build on those two facts.
 */
export abstract class BasePage {
  protected abstract readonly path: string;
  protected abstract readonly readyLocator: Locator;

  readonly header: HeaderComponent;

  constructor(protected readonly page: Page) {
    this.header = new HeaderComponent(page);
  }

  async open(): Promise<this> {
    await this.page.goto(this.path);
    await this.expectLoaded();
    return this;
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${escapeRegex(this.path)}$`));
    await expect(this.readyLocator).toBeVisible();
  }

  get title(): Locator {
    return this.page.getByTestId('title');
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
