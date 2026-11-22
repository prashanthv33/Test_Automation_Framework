import { test, expect } from '@fixtures';
import { env } from '@config/env';
import { buildBooking } from '@utils/dataFactory';

test.describe('Booking API — auth & negative paths', { tag: ['@api', '@regression'] }, () => {
  test('issues a token for valid credentials', { tag: '@smoke' }, async ({ authClient }) => {
    const token = await authClient.createToken(env.API_USERNAME, env.API_PASSWORD);
    expect(token).toMatch(/^[a-z0-9]+$/i);
  });

  test('rejects invalid credentials', async ({ authClient }) => {
    const res = await authClient.createTokenRaw(env.API_USERNAME, 'not-the-password');
    // The API answers 200 with a reason instead of 401 — assert the actual contract.
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ reason: 'Bad credentials' });
  });

  test('refuses update without a token', async ({ bookingClient, seededBooking }) => {
    const res = await bookingClient.updateRaw(seededBooking.bookingid, buildBooking(), {});
    expect(res.status()).toBe(403);
  });

  test('refuses delete with an invalid token', async ({ bookingClient, seededBooking }) => {
    const res = await bookingClient.deleteRaw(seededBooking.bookingid, { Cookie: 'token=invalid' });
    expect(res.status()).toBe(403);
  });

  test('returns 404 for an unknown booking', async ({ bookingClient }) => {
    expect((await bookingClient.getRaw(999_999_999)).status()).toBe(404);
  });
});
