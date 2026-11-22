import { test, expect } from '@fixtures';
import {
  BookingIdListSchema,
  BookingSchema,
  CreateBookingResponseSchema,
} from '@api/schemas/booking.schema';
import { buildBooking } from '@utils/dataFactory';

/**
 * Contract tests: validate response *shape* (types, required fields, no
 * unexpected fields) independently of business values. A breaking API change
 * fails here with a precise zod message rather than somewhere downstream.
 */
test.describe('Booking API — contract', { tag: ['@api', '@regression'] }, () => {
  test('GET /booking matches the id-list schema', async ({ apiRequest }) => {
    const res = await apiRequest.get('/booking', { headers: { Accept: 'application/json' } });
    expect(res.ok()).toBeTruthy();
    expect(BookingIdListSchema.safeParse(await res.json()).success).toBe(true);
  });

  test('POST /booking response matches the create schema', async ({
    apiRequest,
    bookingClient,
  }) => {
    const res = await apiRequest.post('/booking', {
      data: buildBooking(),
      headers: { Accept: 'application/json' },
    });
    const body = await res.json();
    const parsed = CreateBookingResponseSchema.safeParse(body);

    expect(parsed.error?.issues ?? []).toEqual([]);
    await bookingClient.deleteRaw(body.bookingid);
  });

  test('GET /booking/:id matches the booking schema', async ({ apiRequest, seededBooking }) => {
    const res = await apiRequest.get(`/booking/${seededBooking.bookingid}`, {
      headers: { Accept: 'application/json' },
    });
    const parsed = BookingSchema.safeParse(await res.json());

    expect(parsed.error?.issues ?? []).toEqual([]);
  });

  test('responds within the performance budget', async ({ bookingClient, seededBooking }) => {
    const started = Date.now();
    await bookingClient.get(seededBooking.bookingid);
    expect(Date.now() - started, 'GET /booking/:id latency (ms)').toBeLessThan(3_000);
  });
});
