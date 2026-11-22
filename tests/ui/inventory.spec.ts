import { test, expect } from '@fixtures';
import products from '@data/products.json';
import type { SortOption } from '@pages/InventoryPage';

test.describe('Inventory', { tag: '@regression' }, () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.open();
  });

  test(
    'shows the full product catalog with correct prices',
    { tag: '@smoke' },
    async ({ inventoryPage }) => {
      await expect(inventoryPage.items).toHaveCount(products.catalog.length);
      for (const { name, price } of products.catalog) {
        await expect(inventoryPage.product(name).price).toHaveText(`$${price}`);
      }
    },
  );

  const names = products.catalog.map((p) => p.name);
  const prices = products.catalog.map((p) => p.price);

  // Expected orders are derived from the test data, not from the page under test.
  const nameSorts: { option: SortOption; label: string; expected: string[] }[] = [
    { option: 'az', label: 'name A→Z', expected: [...names].sort((a, b) => a.localeCompare(b)) },
    { option: 'za', label: 'name Z→A', expected: [...names].sort((a, b) => b.localeCompare(a)) },
  ];
  const priceSorts: { option: SortOption; label: string; expected: number[] }[] = [
    { option: 'lohi', label: 'price low→high', expected: [...prices].sort((a, b) => a - b) },
    { option: 'hilo', label: 'price high→low', expected: [...prices].sort((a, b) => b - a) },
  ];

  for (const { option, label, expected } of nameSorts) {
    test(`sorts products by ${label}`, async ({ inventoryPage }) => {
      await inventoryPage.sortBy(option);
      expect(await inventoryPage.productNames()).toEqual(expected);
    });
  }

  for (const { option, label, expected } of priceSorts) {
    test(`sorts products by ${label}`, async ({ inventoryPage }) => {
      await inventoryPage.sortBy(option);
      expect(await inventoryPage.productPrices()).toEqual(expected);
    });
  }
});
