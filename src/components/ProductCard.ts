import type { Locator } from '@playwright/test';

/**
 * A single product tile / cart row. Scoped to its root locator so the same
 * component works on the inventory, cart and checkout-overview pages.
 */
export class ProductCard {
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly addButton: Locator;
  readonly removeButton: Locator;

  constructor(readonly root: Locator) {
    this.name = root.getByTestId('inventory-item-name');
    this.description = root.getByTestId('inventory-item-desc');
    this.price = root.getByTestId('inventory-item-price');
    this.addButton = root.getByRole('button', { name: 'Add to cart' });
    this.removeButton = root.getByRole('button', { name: 'Remove' });
  }

  async add(): Promise<void> {
    await this.addButton.click();
  }

  async remove(): Promise<void> {
    await this.removeButton.click();
  }

  async priceValue(): Promise<number> {
    return parsePrice(await this.price.innerText());
  }
}

export function parsePrice(text: string): number {
  const match = text.match(/\$?(\d+(?:\.\d+)?)/);
  if (!match) throw new Error(`Cannot parse price from "${text}"`);
  return Number(match[1]);
}
