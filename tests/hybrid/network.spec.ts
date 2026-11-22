import { test, expect } from '@fixtures';

/**
 * Hybrid technique #2 — control the network layer from the test.
 * page.route() lets a UI test block, stub or fault-inject any request.
 */
test.describe('Network control', { tag: ['@hybrid', '@regression'] }, () => {
  test('third-party telemetry can be blocked without breaking the app', async ({
    page,
    inventoryPage,
  }) => {
    const telemetry = /events\.backtrace\.io/;
    const completed: string[] = [];
    page.on('requestfinished', (req) => {
      if (telemetry.test(req.url())) completed.push(req.url());
    });
    await page.route(telemetry, (route) => route.abort());

    await inventoryPage.open();
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.header.expectCartCount(1);
    // The app kept working, and no telemetry request completed.
    expect(completed).toEqual([]);
  });

  test('product images are replaced with a stubbed response', async ({ page, inventoryPage }) => {
    const placeholder =
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>';
    await page.route(/\.jpg$/, (route) =>
      route.fulfill({ status: 200, contentType: 'image/svg+xml', body: placeholder }),
    );

    await inventoryPage.open();
    const firstImage = inventoryPage.items.first().locator('img');
    await expect(firstImage).toHaveJSProperty('complete', true);
    await expect(firstImage).toHaveJSProperty('naturalWidth', 10);
  });

  test('app stays usable when every product image fails to load', async ({
    page,
    inventoryPage,
    cartPage,
  }) => {
    await page.route(/\.jpg$/, (route) => route.abort('failed'));

    await inventoryPage.open();
    await expect(inventoryPage.items).toHaveCount(6);
    await expect(inventoryPage.items.first().locator('img')).toHaveJSProperty('naturalWidth', 0);

    await inventoryPage.addToCart('Sauce Labs Onesie');
    await cartPage.open();
    expect(await cartPage.itemNames()).toEqual(['Sauce Labs Onesie']);
  });
});
