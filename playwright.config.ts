import { defineConfig, devices, type ReporterDescription } from '@playwright/test';
import { defineBddProject } from 'playwright-bdd';
import { env } from './src/config/env';
import { STORAGE_STATE } from './src/config/constants';

const isCI = !!process.env.CI;

const reporters: ReporterDescription[] = [
  [isCI ? 'github' : 'list'],
  ['html', { open: 'never' }],
  [
    'allure-playwright',
    {
      resultsDir: 'allure-results',
      detail: true,
      suiteTitle: true,
      environmentInfo: {
        TEST_ENV: env.TEST_ENV,
        BASE_URL: env.BASE_URL,
        API_URL: env.API_URL,
        NODE_VERSION: process.version,
        OS: process.platform,
      },
    },
  ],
];
// In CI each shard writes a blob report that a later job merges into one report.
if (isCI) reporters.push(['blob']);

/** Shared settings for every browser-based project that starts logged in. */
const authenticated = {
  storageState: STORAGE_STATE,
} as const;

export default defineConfig({
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' },
  },
  reporter: reporters,
  // Baselines are per-platform: fonts render differently on Windows/macOS/Linux.
  // CI compares against the linux set (generated in the Playwright Docker image).
  snapshotPathTemplate:
    '{testDir}/__screenshots__/{platform}/{projectName}/{testFilePath}/{arg}{ext}',

  use: {
    baseURL: env.BASE_URL,
    testIdAttribute: 'data-test',
    trace: isCI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },

  projects: [
    // ---------- 1. Setup: log in once, persist the session for every UI project ----------
    {
      name: 'setup',
      testDir: './tests/setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // ---------- 2. Cross-browser UI + hybrid (UI+API) ----------
    ...(['chromium', 'firefox', 'webkit'] as const).map((browser) => ({
      name: browser,
      testDir: './tests',
      testMatch: /(ui|hybrid)\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices[
          browser === 'chromium'
            ? 'Desktop Chrome'
            : browser === 'firefox'
              ? 'Desktop Firefox'
              : 'Desktop Safari'
        ],
        ...authenticated,
      },
    })),
    {
      name: 'mobile-chrome',
      testDir: './tests/ui',
      grep: /@smoke/,
      dependencies: ['setup'],
      use: { ...devices['Pixel 7'], ...authenticated },
    },

    // ---------- 3. API only — no browser is launched ----------
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: env.API_URL },
    },

    // ---------- 4. BDD: Gherkin features compiled to Playwright specs by `bddgen` ----------
    {
      ...defineBddProject({
        name: 'bdd',
        features: 'features/**/*.feature',
        steps: 'src/steps/**/*.ts',
      }),
      use: { ...devices['Desktop Chrome'] },
    },

    // ---------- 5. Visual regression (Chromium only, stable viewport) ----------
    {
      name: 'visual',
      testDir: './tests/visual',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        ...authenticated,
      },
    },

    // ---------- 6. Accessibility (axe-core) ----------
    {
      name: 'a11y',
      testDir: './tests/a11y',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], ...authenticated },
    },
  ],
});
