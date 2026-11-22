/** Where the setup project saves the logged-in browser session. */
export const STORAGE_STATE = '.auth/standard_user.json';

/** Tags used across specs and features. Filter with `--grep @smoke` etc. */
export const Tags = {
  smoke: '@smoke',
  regression: '@regression',
  api: '@api',
  hybrid: '@hybrid',
  visual: '@visual',
  a11y: '@a11y',
} as const;
