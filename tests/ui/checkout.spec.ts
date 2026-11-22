import { test, expect } from '@fixtures';
import products from '@data/products.json';
import { readCsv } from '@utils/csvReader';
import { buildCustomer } from '@utils/dataFactory';
import { round2 } from '@pages/CheckoutPage';

interface CheckoutValidationRow extends Record<string, string> {
  scenario: string;
  firstName: string;
  lastName: string;
  postalCode: string;
  expectedError: string;
}

const validationRows = readCsv<CheckoutValidationRow>('checkout.csv');

test.describe('Checkout', { tag: '@regression' }, () => {
  test.beforeEach(async ({ inventoryPage, cartPage }) => {
    await inventoryPage.open();
    await inventoryPage.addToCart('Sauce Labs Backpack', 'Sauce Labs Fleece Jacket');
    await cartPage.open();
    await cartPage.checkout();
  });

  test(
    'completes an order end-to-end with correct totals',
    { tag: '@smoke' },
    async ({ checkoutInfoPage, checkoutOverviewPage, checkoutCompletePage }) => {
      await checkoutInfoPage.submit(buildCustomer());
      await checkoutOverviewPage.expectLoaded();

      const itemsSum = await checkoutOverviewPage.sumOfItemPrices();
      const totals = await checkoutOverviewPage.totals();

      expect(totals.subtotal).toBe(itemsSum);
      expect(totals.tax).toBe(round2(itemsSum * products.taxRate));
      expect(totals.total).toBe(round2(totals.subtotal + totals.tax));

      await checkoutOverviewPage.finish();
      await checkoutCompletePage.expectLoaded();
      await expect(checkoutCompletePage.completeHeader).toHaveText('Thank you for your order!');
      await checkoutCompletePage.header.expectCartCount(0);
    },
  );

  // Data-driven from CSV: each row is a separate, individually reported test.
  for (const row of validationRows) {
    test(`form validation: ${row.scenario}`, async ({ checkoutInfoPage }) => {
      await checkoutInfoPage.submit(row);
      await checkoutInfoPage.expectError(row.expectedError);
    });
  }
});
