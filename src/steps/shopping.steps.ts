import { expect } from '@playwright/test';
import type { DataTable } from 'playwright-bdd';
import { round2 } from '@pages/CheckoutPage';
import products from '@data/products.json';
import { buildCustomer } from '@utils/dataFactory';
import { Then, When } from './fixtures';

When('I add the following products to the cart:', async ({ inventoryPage }, table: DataTable) => {
  const names = table.hashes().map((row) => row.product);
  await inventoryPage.addToCart(...names);
});

When('I add {string} to the cart', async ({ inventoryPage }, name: string) => {
  await inventoryPage.addToCart(name);
});

Then('the cart badge should show {int}', async ({ inventoryPage }, count: number) => {
  await inventoryPage.header.expectCartCount(count);
});

When('I proceed to checkout', async ({ inventoryPage, cartPage }) => {
  await inventoryPage.header.openCart();
  await cartPage.checkout();
});

When('I enter valid customer details', async ({ checkoutInfoPage }) => {
  await checkoutInfoPage.submit(buildCustomer());
});

When(
  'I enter first name {string}, last name {string} and postal code {string}',
  async ({ checkoutInfoPage }, firstName: string, lastName: string, postalCode: string) => {
    await checkoutInfoPage.submit({ firstName, lastName, postalCode });
  },
);

Then('the checkout error should be {string}', async ({ checkoutInfoPage }, message: string) => {
  await checkoutInfoPage.expectError(message);
});

Then('the item total should be {string}', async ({ checkoutOverviewPage }, expected: string) => {
  const { subtotal } = await checkoutOverviewPage.totals();
  expect(subtotal).toBe(Number(expected));
});

Then('tax and total should be calculated correctly', async ({ checkoutOverviewPage }) => {
  const { subtotal, tax, total } = await checkoutOverviewPage.totals();
  expect(tax).toBe(round2(subtotal * products.taxRate));
  expect(total).toBe(round2(subtotal + tax));
});

When('I finish the order', async ({ checkoutOverviewPage }) => {
  await checkoutOverviewPage.finish();
});

Then('I should see the order confirmation', async ({ checkoutCompletePage }) => {
  await checkoutCompletePage.expectLoaded();
  await expect(checkoutCompletePage.completeHeader).toHaveText('Thank you for your order!');
});
