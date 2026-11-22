import { z } from 'zod';

/** Contract for Restful-Booker. Used both for typing and for runtime contract tests. */
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD');

export const BookingSchema = z.strictObject({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number().int().nonnegative(),
  depositpaid: z.boolean(),
  bookingdates: z.strictObject({
    checkin: isoDate,
    checkout: isoDate,
  }),
  additionalneeds: z.string().optional(),
});

export const CreateBookingResponseSchema = z.strictObject({
  bookingid: z.number().int().positive(),
  booking: BookingSchema,
});

export const BookingIdListSchema = z.array(z.strictObject({ bookingid: z.number().int() }));

export const AuthResponseSchema = z.union([
  z.strictObject({ token: z.string().min(1) }),
  z.strictObject({ reason: z.string() }),
]);

export type Booking = z.infer<typeof BookingSchema>;
export type CreateBookingResponse = z.infer<typeof CreateBookingResponseSchema>;
export type BookingIdList = z.infer<typeof BookingIdListSchema>;
