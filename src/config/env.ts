import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

/**
 * Environment loader.
 *
 * Precedence (highest first):
 *   1. Real process env vars (CI secrets, shell exports)
 *   2. config/env/.env.local      (personal overrides, git-ignored)
 *   3. config/env/.env.<TEST_ENV> (committed per-environment defaults)
 *
 * The result is validated with zod so a misconfigured run fails fast with a
 * readable message instead of a confusing timeout deep inside a test.
 */
// CI passes unset secrets as empty strings; treat those as "not provided" so
// the committed defaults below still apply.
for (const [key, value] of Object.entries(process.env)) {
  if (value === '') delete process.env[key];
}

const TEST_ENV = process.env.TEST_ENV ?? 'qa';
const envDir = path.resolve(__dirname, '../../config/env');

dotenv.config({ path: path.join(envDir, '.env.local'), quiet: true });
dotenv.config({ path: path.join(envDir, `.env.${TEST_ENV}`), quiet: true });

const EnvSchema = z.object({
  TEST_ENV: z.enum(['qa', 'staging']).default('qa'),
  BASE_URL: z.url(),
  API_URL: z.url(),
  UI_USERNAME: z.string().min(1),
  UI_PASSWORD: z.string().min(1),
  API_USERNAME: z.string().min(1),
  API_PASSWORD: z.string().min(1),
});

const parsed = EnvSchema.safeParse({ ...process.env, TEST_ENV });

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Invalid test environment configuration (TEST_ENV=${TEST_ENV}):\n${issues}`);
}

export const env = parsed.data;
export type Env = typeof env;
