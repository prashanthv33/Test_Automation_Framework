import type { APIRequestContext, APIResponse } from '@playwright/test';
import { ApiClient } from './ApiClient';
import {
  BookingIdListSchema,
  BookingSchema,
  CreateBookingResponseSchema,
  type Booking,
  type BookingIdList,
  type CreateBookingResponse,
} from './schemas/booking.schema';

export interface BookingFilter {
  firstname?: string;
  lastname?: string;
  checkin?: string;
  checkout?: string;
}

export class BookingClient extends ApiClient {
  /** @param token optional auth token, required for update/delete calls */
  constructor(
    request: APIRequestContext,
    private readonly token?: string,
  ) {
    super(request);
  }

  private authHeaders(): Record<string, string> {
    if (!this.token) throw new Error('BookingClient: this operation needs an auth token');
    return { Cookie: `token=${this.token}` };
  }

  // ---- typed helpers (validate the contract) ----

  async list(filter: BookingFilter = {}): Promise<BookingIdList> {
    return this.parse(
      await this.send('GET', '/booking', { params: { ...filter } }),
      BookingIdListSchema,
    );
  }

  async get(id: number): Promise<Booking> {
    return this.parse(await this.getRaw(id), BookingSchema);
  }

  async create(booking: Booking): Promise<CreateBookingResponse> {
    return this.parse(await this.createRaw(booking), CreateBookingResponseSchema);
  }

  async update(id: number, booking: Booking): Promise<Booking> {
    return this.parse(await this.updateRaw(id, booking), BookingSchema);
  }

  async patch(id: number, partial: Partial<Booking>): Promise<Booking> {
    const res = await this.send('PATCH', `/booking/${id}`, {
      data: partial,
      headers: this.authHeaders(),
    });
    return this.parse(res, BookingSchema);
  }

  // ---- raw calls (for status-code / negative assertions) ----

  getRaw(id: number): Promise<APIResponse> {
    return this.send('GET', `/booking/${id}`);
  }

  createRaw(booking: unknown): Promise<APIResponse> {
    return this.send('POST', '/booking', { data: booking });
  }

  updateRaw(id: number, booking: Booking, headers?: Record<string, string>): Promise<APIResponse> {
    return this.send('PUT', `/booking/${id}`, {
      data: booking,
      headers: headers ?? this.authHeaders(),
    });
  }

  deleteRaw(id: number, headers?: Record<string, string>): Promise<APIResponse> {
    return this.send('DELETE', `/booking/${id}`, { headers: headers ?? this.authHeaders() });
  }
}
