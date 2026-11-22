import type { Page } from '@playwright/test';
import products from '@data/products.json';

/**
 * Programmatic state seeding — skip slow UI steps that aren't under test.
 * SauceDemo keeps the cart in localStorage['cart-contents'] as product ids.
 */
export async function seedCart(page: Page, productNames: string[]): Promise<void> {
  const ids = productNames.map((name) => {
    const product = products.catalog.find((p) => p.name === name);
    if (!product) throw new Error(`Unknown product "${name}"`);
    return product.id;
  });
  // Runs before any page script on every navigation in this page.
  await page.addInitScript((value) => {
    window.localStorage.setItem('cart-contents', value);
  }, JSON.stringify(ids));
}
