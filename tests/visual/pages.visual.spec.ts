import { test, expect, loggedOut } from '@fixtures';
import { seedCart } from '@utils/appState';

/**
 * Visual regression. Baselines live in tests/visual/__screenshots__/<platform>/.
 * Regenerate after an intended UI change:  npm run test:visual:update
 * (CI uses the linux baselines, produced inside the Playwright Docker image.)
 */
test.describe('Visual regression', { tag: '@visual' }, () => {
  test.describe('logged out', () => {
    test.use({ storageState: loggedOut });

    test('login page', async ({ page, loginPage }) => {
      await loginPage.open();
      await expect(page).toHaveScreenshot('login.png', { fullPage: true });
    });
  });

  test('inventory page', async ({ page, inventoryPage }) => {
    await inventoryPage.open();
    await expect(page).toHaveScreenshot('inventory.png', {
      fullPage: true,
      // Footer contains the current year — mask anything that changes over time.
      mask: [page.getByTestId('footer-copy')],
    });
  });

  test('single product card component', async ({ inventoryPage }) => {
    await inventoryPage.open();
    await expect(inventoryPage.product('Sauce Labs Backpack').root).toHaveScreenshot(
      'product-card.png',
    );
  });

  test('cart with items', async ({ page, cartPage }) => {
    await seedCart(page, ['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
    await cartPage.open();
    await expect(page).toHaveScreenshot('cart.png', {
      fullPage: true,
      mask: [page.getByTestId('footer-copy')],
    });
  });
});
