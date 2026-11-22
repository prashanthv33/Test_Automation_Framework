import {
  test as base,
  expect,
  request as playwrightRequest,
  type APIRequestContext,
  type Fixtures,
  type PlaywrightTestArgs,
  type PlaywrightTestOptions,
  type PlaywrightWorkerArgs,
  type PlaywrightWorkerOptions,
} from '@playwright/test';
import { env } from '@config/env';
import { LoginPage } from '@pages/LoginPage';
import { InventoryPage } from '@pages/InventoryPage';
import { CartPage } from '@pages/CartPage';
import { CheckoutCompletePage, CheckoutInfoPage, CheckoutOverviewPage } from '@pages/CheckoutPage';
import { AuthClient } from '@api/AuthClient';
import { BookingClient } from '@api/BookingClient';
import type { CreateBookingResponse } from '@api/schemas/booking.schema';
import { buildBooking } from '@utils/dataFactory';
import { logger } from '@utils/logger';

/** Page objects — one fresh instance per test, bound to that test's `page`. */
export interface PageFixtures {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutInfoPage: CheckoutInfoPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
}

/** API clients + data that is created before and cleaned up after the test. */
export interface ApiFixtures {
  authClient: AuthClient;
  bookingClient: BookingClient;
  /** A booking created via API for this test and deleted afterwards. */
  seededBooking: CreateBookingResponse;
}

/** Shared across all tests in a worker: one API context + one auth token. */
export interface WorkerFixtures {
  apiRequest: APIRequestContext;
  authToken: string;
}

/**
 * Fixture definitions are exported as a plain object so the exact same
 * wiring can be applied to both `@playwright/test` and `playwright-bdd`'s
 * test object (see src/steps/fixtures.ts). One source of truth, two styles.
 */
export const fixtureDefinitions: Fixtures<
  PageFixtures & ApiFixtures,
  WorkerFixtures,
  PlaywrightTestArgs & PlaywrightTestOptions,
  PlaywrightWorkerArgs & PlaywrightWorkerOptions
> = {
  // ---------- worker scope ----------
  apiRequest: [
    async ({}, use) => {
      const ctx = await playwrightRequest.newContext({ baseURL: env.API_URL });
      await use(ctx);
      await ctx.dispose();
    },
    { scope: 'worker' },
  ],
  authToken: [
    async ({ apiRequest }, use) => {
      await use(await new AuthClient(apiRequest).createToken(env.API_USERNAME, env.API_PASSWORD));
    },
    { scope: 'worker' },
  ],

  // ---------- pages ----------
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutInfoPage: async ({ page }, use) => use(new CheckoutInfoPage(page)),
  checkoutOverviewPage: async ({ page }, use) => use(new CheckoutOverviewPage(page)),
  checkoutCompletePage: async ({ page }, use) => use(new CheckoutCompletePage(page)),

  // ---------- api ----------
  authClient: async ({ apiRequest }, use) => use(new AuthClient(apiRequest)),
  bookingClient: async ({ apiRequest, authToken }, use) =>
    use(new BookingClient(apiRequest, authToken)),
  seededBooking: async ({ bookingClient }, use) => {
    const created = await bookingClient.create(buildBooking());
    await use(created);
    // Teardown runs even if the test fails, so the shared demo API stays clean.
    const res = await bookingClient.deleteRaw(created.bookingid);
    if (!res.ok()) logger.warn(`Cleanup of booking ${created.bookingid} returned ${res.status()}`);
  },
};

export const test = base.extend<PageFixtures & ApiFixtures, WorkerFixtures>(fixtureDefinitions);
export { expect };

/** Empty storage state — use in tests that must start logged out. */
export const loggedOut = { cookies: [], origins: [] };
