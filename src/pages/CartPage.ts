import type { Locator, Page } from '@playwright/test';
import { ProductCard } from '@components/ProductCard';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  protected readonly path = '/cart.html';
  protected readonly readyLocator: Locator;

  readonly items: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.getByTestId('cart-list').getByTestId('inventory-item');
    this.checkoutButton = page.getByTestId('checkout');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
    this.readyLocator = page.getByTestId('cart-list');
  }

  item(name: string): ProductCard {
    return new ProductCard(this.items.filter({ hasText: name }));
  }

  async itemNames(): Promise<string[]> {
    return this.items.getByTestId('inventory-item-name').allInnerTexts();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
