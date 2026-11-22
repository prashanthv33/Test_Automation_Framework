import type { APIResponse } from '@playwright/test';
import { ApiClient } from './ApiClient';
import { AuthResponseSchema } from './schemas/booking.schema';

export class AuthClient extends ApiClient {
  /** Raw call — for negative tests that need to inspect the response. */
  async createTokenRaw(username: string, password: string): Promise<APIResponse> {
    return this.send('POST', '/auth', { data: { username, password } });
  }

  /** Returns a token or throws — for use as a precondition. */
  async createToken(username: string, password: string): Promise<string> {
    const body = await this.parse(
      await this.createTokenRaw(username, password),
      AuthResponseSchema,
    );
    if (!('token' in body)) throw new Error(`Authentication failed: ${body.reason}`);
    return body.token;
  }
}
