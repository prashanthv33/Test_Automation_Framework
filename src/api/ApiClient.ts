import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { z } from 'zod';
import { logger } from '@utils/logger';

export interface RequestOptions {
  data?: unknown;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Thin wrapper over Playwright's APIRequestContext.
 * - Central place for default headers and logging.
 * - `parse()` validates a response body against a zod schema, so every typed
 *   call is also a contract check.
 */
export abstract class ApiClient {
  constructor(protected readonly request: APIRequestContext) {}

  protected defaultHeaders(): Record<string, string> {
    return { Accept: 'application/json', 'Content-Type': 'application/json' };
  }

  protected async send(
    method: Method,
    url: string,
    options: RequestOptions = {},
  ): Promise<APIResponse> {
    const started = Date.now();
    const response = await this.request.fetch(url, {
      method,
      data: options.data,
      params: options.params,
      headers: { ...this.defaultHeaders(), ...options.headers },
    });
    logger.debug(`${method} ${url} -> ${response.status()} (${Date.now() - started}ms)`);
    return response;
  }

  protected async parse<S extends z.ZodType>(
    response: APIResponse,
    schema: S,
  ): Promise<z.infer<S>> {
    if (!response.ok()) {
      throw new Error(
        `${response.url()} returned ${response.status()}: ${(await response.text()).slice(0, 200)}`,
      );
    }
    const result = schema.safeParse(await response.json());
    if (!result.success) {
      throw new Error(`Contract violation for ${response.url()}:\n${result.error.message}`);
    }
    return result.data;
  }
}
