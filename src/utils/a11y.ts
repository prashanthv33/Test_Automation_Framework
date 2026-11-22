import AxeBuilder from '@axe-core/playwright';
import type { Page, TestInfo } from '@playwright/test';

export type Impact = 'minor' | 'moderate' | 'serious' | 'critical';

export interface A11yScanOptions {
  /** Only violations at or above this impact fail the test. Default: serious. */
  failOn?: Impact;
  /** Known issues tracked elsewhere — reported, but don't fail the build. */
  knownIssues?: string[];
  /** Limit the scan to part of the page. */
  include?: string;
}

const rank: Record<Impact, number> = { minor: 1, moderate: 2, serious: 3, critical: 4 };

/**
 * Runs an axe-core WCAG 2.1 AA scan, attaches the full JSON report to the
 * test (visible in HTML/Allure reports) and returns the blocking violations.
 */
export async function scanA11y(page: Page, testInfo: TestInfo, options: A11yScanOptions = {}) {
  const { failOn = 'serious', knownIssues = [], include } = options;

  let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']);
  if (include) builder = builder.include(include);
  const results = await builder.analyze();

  await testInfo.attach('axe-results.json', {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });

  return results.violations
    .filter((v) => rank[(v.impact ?? 'minor') as Impact] >= rank[failOn])
    .filter((v) => !knownIssues.includes(v.id))
    .map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length }));
}
