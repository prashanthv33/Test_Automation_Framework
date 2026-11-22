import { expect, type Locator, type Page } from '@playwright/test';

/** Header + burger menu, present on every authenticated page. */
export class HeaderComponent {
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  private readonly openMenuButton: Locator;
  private readonly logoutLink: Locator;
  private readonly resetAppLink: Locator;

  constructor(page: Page) {
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    // The data-test="open-menu" <img> is covered by the real <button>, so target the button.
    this.openMenuButton = page.getByRole('button', { name: 'Open Menu' });
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.resetAppLink = page.getByTestId('reset-sidebar-link');
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async logout(): Promise<void> {
    await this.openMenuButton.click();
    await this.logoutLink.click();
  }

  async resetAppState(): Promise<void> {
    await this.openMenuButton.click();
    await this.resetAppLink.click();
  }

  async expectCartCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.cartBadge).toBeHidden();
    } else {
      await expect(this.cartBadge).toHaveText(String(count));
    }
  }
}
