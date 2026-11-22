# Contributing / extending the framework

## Add a page object

1. Create `src/pages/MyPage.ts` extending `BasePage`. Declare `path` and a `readyLocator` that proves
   the page has rendered.
2. Prefer `page.getByTestId()` (configured to read `data-test`) or `getByRole()`. Avoid CSS/XPath.
3. Expose **actions** (`login()`, `addToCart()`) and **assertion helpers** named `expectXxx()` — the
   ESLint `expect-expect` rule treats `expectXxx()` calls as assertions.
4. Register it in `src/fixtures/index.ts` (interface `PageFixtures` + one line in
   `fixtureDefinitions`). It is now available to specs **and** BDD steps.

## Add an API client

1. Add zod schemas in `src/api/schemas/`. Export the inferred types.
2. Extend `ApiClient`. Give each endpoint a typed method (uses `parse()` → contract check) and,
   where negative tests need it, a `xxxRaw()` method that returns the raw `APIResponse`.
3. Register the client as a fixture.

## Add a test

```ts
import { test, expect } from '@fixtures';

test('does something', { tag: ['@regression'] }, async ({ inventoryPage }) => {
  await inventoryPage.open();
  // ...
});
```

- Place it under the folder that matches its kind: `tests/ui`, `tests/api`, `tests/hybrid`, etc.
  The folder decides which Playwright project (and browser) runs it.
- Tests that must start logged out: `test.use({ storageState: loggedOut })`.
- Need data? Use `buildBooking()` / `buildCustomer()` from `@utils/dataFactory`, or add rows to
  `src/data/*.json|csv` for data-driven cases.
- Need state but not the UI flow that creates it? Seed it (see `@utils/appState`).

## Add a BDD scenario

1. Write the scenario in `features/*.feature`. Reuse existing step wording where you can.
2. Add any missing steps in `src/steps/*.steps.ts`, importing `Given/When/Then` from
   `./fixtures` — every framework fixture is available as a step argument.
3. `npm run test:bdd` (runs `bddgen` first). Missing steps are reported with ready-to-paste snippets.

## Visual baselines

- Local: `npm run test:visual:update` (writes baselines for your OS).
- CI (linux): run the **Update visual baselines** workflow, or `npm run test:visual:docker`.
- Mask anything dynamic (dates, counters) with the `mask` option.

## Before committing

The pre-commit hook runs ESLint, Prettier and `tsc`. To run them yourself:
`npm run lint && npm run format:check && npm run typecheck`.

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/)
(`feat:`, `fix:`, `test:`, `ci:`, `docs:`).
