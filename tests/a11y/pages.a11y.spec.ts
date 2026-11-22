import { test, expect, loggedOut } from '@fixtures';
import { scanA11y } from '@utils/a11y';
import { seedCart } from '@utils/appState';

/**
 * Accessibility checks (axe-core, WCAG 2.1 AA).
 * Fails on serious/critical violations. Issues the team has accepted are
 * listed in KNOWN_ISSUES so they stay visible in the report without
 * blocking every build — remove an entry once it's fixed.
 */
const KNOWN_ISSUES: string[] = [];

test.describe('Accessibility', { tag: '@a11y' }, () => {
  test.describe('logged out', () => {
    test.use({ storageState: loggedOut });

    test('login page has no serious violations', async ({ page, loginPage }, testInfo) => {
      await loginPage.open();
      expect(await scanA11y(page, testInfo, { knownIssues: KNOWN_ISSUES })).toEqual([]);
    });
  });

  test('inventory page has no serious violations', async ({ page, inventoryPage }, testInfo) => {
    await inventoryPage.open();
    expect(await scanA11y(page, testInfo, { knownIssues: KNOWN_ISSUES })).toEqual([]);
  });

  test('cart page has no serious violations', async ({ page, cartPage }, testInfo) => {
    await seedCart(page, ['Sauce Labs Backpack']);
    await cartPage.open();
    expect(await scanA11y(page, testInfo, { knownIssues: KNOWN_ISSUES })).toEqual([]);
  });

  test('checkout form has no serious violations', async ({
    page,
    cartPage,
    checkoutInfoPage,
  }, testInfo) => {
    await seedCart(page, ['Sauce Labs Backpack']);
    await cartPage.open();
    await cartPage.checkout();
    await checkoutInfoPage.expectLoaded();
    expect(await scanA11y(page, testInfo, { knownIssues: KNOWN_ISSUES })).toEqual([]);
  });
});
