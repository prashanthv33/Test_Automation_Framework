/**
 * TEMPLATE — API test.
 *
 * 1. Copy to tests/api/<resource>.spec.ts
 * 2. Change the endpoints and expected values.
 * 3. Run:  npx playwright test tests/api/<resource>.spec.ts --project=api
 *
 * `apiRequest` is already pointed at API_URL, so use relative paths.
 * As written it runs against the demo API (Restful-Booker) and passes.
 */
import { z } from 'zod';
import { test, expect } from '@fixtures';

// TODO: describe the response shape your endpoint should return.
const ItemListSchema = z.array(z.object({ bookingid: z.number() }));

test.describe('My API', { tag: ['@api', '@regression'] }, () => {
  test('GET list returns 200 and the agreed shape', { tag: '@smoke' }, async ({ apiRequest }) => {
    const res = await apiRequest.get('/booking', {
      // TODO: your endpoint
      headers: { Accept: 'application/json' },
    });

    expect(res.status()).toBe(200);
    // Contract check: fails with a precise message if the shape changes.
    expect(ItemListSchema.safeParse(await res.json()).error?.issues ?? []).toEqual([]);
  });

  test('POST creates an item', async ({ apiRequest }) => {
    const payload = {
      // TODO: your request body
      firstname: 'Jane',
      lastname: 'Tester',
      totalprice: 100,
      depositpaid: true,
      bookingdates: { checkin: '2030-01-01', checkout: '2030-01-05' },
    };

    const res = await apiRequest.post('/booking', {
      data: payload,
      headers: { Accept: 'application/json' },
    });

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.booking).toMatchObject(payload);
  });

  test('unknown item returns 404', async ({ apiRequest }) => {
    const res = await apiRequest.get('/booking/999999999');
    expect(res.status()).toBe(404);
  });
});
