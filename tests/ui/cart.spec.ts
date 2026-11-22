import { test, expect } from '@fixtures';

const BACKPACK = 'Sauce Labs Backpack';
const BIKE_LIGHT = 'Sauce Labs Bike Light';
const ONESIE = 'Sauce Labs Onesie';

test.describe('Cart', { tag: '@regression' }, () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.open();
  });

  test(
    'adding products updates the badge and cart contents',
    { tag: '@smoke' },
    async ({ inventoryPage, cartPage }) => {
      await inventoryPage.addToCart(BACKPACK, BIKE_LIGHT);
      await inventoryPage.header.expectCartCount(2);

      await inventoryPage.header.openCart();
      await cartPage.expectLoaded();
      expect(await cartPage.itemNames()).toEqual([BACKPACK, BIKE_LIGHT]);
    },
  );

  test('removing a product from the inventory page', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(BACKPACK, ONESIE);
    await inventoryPage.product(BACKPACK).remove();

    await inventoryPage.header.expectCartCount(1);
    await expect(inventoryPage.product(BACKPACK).addButton).toBeVisible();
  });

  test('removing a product from the cart page', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(BACKPACK, ONESIE);
    await cartPage.open();
    await cartPage.item(ONESIE).remove();

    expect(await cartPage.itemNames()).toEqual([BACKPACK]);
    await cartPage.header.expectCartCount(1);
  });

  test('cart persists across navigation', async ({ inventoryPage, cartPage, page }) => {
    await inventoryPage.addToCart(BIKE_LIGHT);
    await page.reload();
    await inventoryPage.header.expectCartCount(1);

    await cartPage.open();
    await cartPage.continueShoppingButton.click();
    await inventoryPage.expectLoaded();
    await inventoryPage.header.expectCartCount(1);
  });
});
