import { test, expect } from '@fixtures';
import { buildBooking } from '@utils/dataFactory';

test.describe('Booking API — CRUD', { tag: ['@api', '@regression'] }, () => {
  test('creates a booking and reads it back', { tag: '@smoke' }, async ({ bookingClient }) => {
    const payload = buildBooking();
    const { bookingid, booking } = await bookingClient.create(payload);

    expect(booking).toEqual(payload);
    expect(await bookingClient.get(bookingid)).toEqual(payload);

    await bookingClient.deleteRaw(bookingid);
  });

  test('fully updates a booking (PUT)', async ({ bookingClient, seededBooking }) => {
    const updated = buildBooking({ firstname: 'Updated', depositpaid: true });

    expect(await bookingClient.update(seededBooking.bookingid, updated)).toEqual(updated);
    expect(await bookingClient.get(seededBooking.bookingid)).toEqual(updated);
  });

  test('partially updates a booking (PATCH)', async ({ bookingClient, seededBooking }) => {
    const result = await bookingClient.patch(seededBooking.bookingid, { totalprice: 999 });

    expect(result).toEqual({ ...seededBooking.booking, totalprice: 999 });
  });

  test('deletes a booking', async ({ bookingClient }) => {
    const { bookingid } = await bookingClient.create(buildBooking());

    const del = await bookingClient.deleteRaw(bookingid);
    expect(del.status()).toBe(201); // Restful-Booker returns 201 Created on delete
    expect((await bookingClient.getRaw(bookingid)).status()).toBe(404);
  });

  test('filters bookings by name', async ({ bookingClient, seededBooking }) => {
    const { firstname, lastname } = seededBooking.booking;
    const ids = await bookingClient.list({ firstname, lastname });

    expect(ids.map((b) => b.bookingid)).toContain(seededBooking.bookingid);
  });
});
