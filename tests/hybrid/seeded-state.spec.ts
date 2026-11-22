import { test, expect } from '@fixtures';
import { seedCart } from '@utils/appState';
import { buildCustomer } from '@utils/dataFactory';

/**
 * Hybrid technique #1 — seed state programmatically, verify through the UI.
 * The test arrives at checkout in one navigation instead of ~6 UI actions,
 * which keeps the suite fast and focuses each test on the behaviour under test.
 */
test.describe('Seeded application state', { tag: ['@hybrid', '@regression'] }, () => {
  const items = ['Sauce Labs Bolt T-Shirt', 'Sauce Labs Fleece Jacket', 'Sauce Labs Onesie'];

  test(
    'cart seeded via storage is rendered by the UI',
    { tag: '@smoke' },
    async ({ page, cartPage }) => {
      await seedCart(page, items);
      await cartPage.open();

      expect(await cartPage.itemNames()).toEqual(items);
      await cartPage.header.expectCartCount(items.length);
    },
  );

  test('checkout straight from a seeded cart', async ({
    page,
    cartPage,
    checkoutInfoPage,
    checkoutOverviewPage,
  }) => {
    await seedCart(page, items);
    await cartPage.open();
    await cartPage.checkout();
    await checkoutInfoPage.submit(buildCustomer());

    const totals = await checkoutOverviewPage.totals();
    expect(totals.subtotal).toBe(await checkoutOverviewPage.sumOfItemPrices());
  });
});
