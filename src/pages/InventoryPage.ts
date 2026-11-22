import type { Locator, Page } from '@playwright/test';
import { ProductCard } from '@components/ProductCard';
import { BasePage } from './BasePage';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage extends BasePage {
  protected readonly path = '/inventory.html';
  protected readonly readyLocator: Locator;

  readonly items: Locator;
  readonly sortSelect: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.getByTestId('inventory-item');
    this.sortSelect = page.getByTestId('product-sort-container');
    this.readyLocator = page.getByTestId('inventory-list');
  }

  product(name: string): ProductCard {
    return new ProductCard(this.items.filter({ hasText: name }));
  }

  async addToCart(...names: string[]): Promise<void> {
    for (const name of names) await this.product(name).add();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption(option);
  }

  async productNames(): Promise<string[]> {
    return this.items.getByTestId('inventory-item-name').allInnerTexts();
  }

  async productPrices(): Promise<number[]> {
    const texts = await this.items.getByTestId('inventory-item-price').allInnerTexts();
    return texts.map((t) => Number(t.replace('$', '')));
  }
}
