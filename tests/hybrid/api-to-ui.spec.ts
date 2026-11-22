import { test, expect } from '@fixtures';
import { seedCart } from '@utils/appState';

/**
 * Hybrid technique #3 — API and browser fixtures in the same test.
 * A guest record is created through the API (and deleted by the fixture's
 * teardown); its data then drives a UI checkout. The two demo systems are
 * independent, but the pattern is what matters: back-end setup and
 * front-end verification in one test, with automatic cleanup.
 */
test.describe('API data drives a UI flow', { tag: ['@hybrid', '@regression'] }, () => {
  test('guest from the booking API completes a purchase', async ({
    page,
    bookingClient,
    seededBooking,
    cartPage,
    checkoutInfoPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    const guest = await bookingClient.get(seededBooking.bookingid);

    await seedCart(page, ['Sauce Labs Backpack']);
    await cartPage.open();
    await cartPage.checkout();
    await checkoutInfoPage.submit({
      firstName: guest.firstname,
      lastName: guest.lastname,
      postalCode: String(seededBooking.bookingid),
    });
    await checkoutOverviewPage.finish();

    await expect(checkoutCompletePage.completeHeader).toHaveText('Thank you for your order!');
  });
});
