# Getting started — guide for new testers

This guide takes you from a fresh clone to running, debugging and writing tests —
first against the built-in demo apps, then against **your own application**.
No prior Playwright experience needed; basic TypeScript/JavaScript helps.

**Contents**

1. [Set up your machine](#1-set-up-your-machine)
2. [Run your first tests](#2-run-your-first-tests)
3. [Read the reports](#3-read-the-reports)
4. [Debug a test](#4-debug-a-test)
5. [Where things live](#5-where-things-live)
6. [Test your own application](#6-test-your-own-application)
7. [Common problems](#7-common-problems)
8. [Before you open a pull request](#8-before-you-open-a-pull-request)

---

## 1. Set up your machine

| Tool                                                   | Version | Check           |
| ------------------------------------------------------ | ------- | --------------- |
| [Node.js](https://nodejs.org)                          | 20+     | `node -v`       |
| [Git](https://git-scm.com)                             | any     | `git --version` |
| [VS Code](https://code.visualstudio.com) (recommended) | any     |                 |
| Java (only for the Allure report)                      | 17+     | `java -version` |

```bash
git clone https://github.com/prashanthv33/Test_Automation_Framework.git
cd Test_Automation_Framework
npm ci                          # install dependencies (exact versions from package-lock.json)
npx playwright install --with-deps   # download Chromium, Firefox and WebKit
```

When you open the folder in VS Code, accept the **recommended extensions** prompt. The
**Playwright Test for VS Code** extension adds a ▶ button next to every test.

## 2. Run your first tests

```bash
npm run test:api      # API tests only — no browser, ~10 seconds
npm run test:smoke    # the most important checks across UI, API and BDD, ~1 minute
```

Both should finish with `N passed`. Other ways to run:

| You want to…                         | Command                                                         |
| ------------------------------------ | --------------------------------------------------------------- |
| Run one file                         | `npx playwright test tests/ui/login.spec.ts --project=chromium` |
| Run tests whose title matches a text | `npx playwright test -g "checkout" --project=chromium`          |
| Run by tag                           | `npx playwright test --grep @smoke`                             |
| Watch the browser                    | `npm run test:headed`                                           |
| Pick and re-run tests in a UI        | `npm run test:ui-mode` ← best way to explore                    |
| Run everything                       | `npm test`                                                      |

> **What is `--project`?** Each project is a combination of test folder + browser/settings
> (see `playwright.config.ts`): `chromium`, `firefox`, `webkit`, `mobile-chrome` (UI),
> `api`, `bdd`, `visual`, `a11y`. Without `--project`, a file may run once per matching project.

## 3. Read the reports

After any run:

```bash
npm run report          # Playwright HTML report
npm run report:allure   # Allure report (needs Java)
```

- Every browser test has a **screenshot** of its final state attached — passed or failed.
- Failed tests also have a **video** and a **trace**. Open the trace (click it in the HTML
  report) to step through every action with DOM snapshots, network calls and console logs —
  usually the fastest way to understand a failure.
- Accessibility tests attach the full axe-core results as JSON.

## 4. Debug a test

| Technique                       | How                                                                    |
| ------------------------------- | ---------------------------------------------------------------------- |
| Step through with the inspector | `npx playwright test tests/ui/cart.spec.ts --project=chromium --debug` |
| Pause at a specific line        | add `await page.pause();` in the test, run with `--headed`             |
| Find a good locator             | `npx playwright codegen https://www.saucedemo.com` and click around    |
| See every API call              | `LOG_LEVEL=debug npx playwright test --project=api`                    |
| Reproduce random data exactly   | `FAKER_SEED=123 npx playwright test ...`                               |

## 5. Where things live

```
config/env/      URLs and credentials per environment (.env.qa, .env.staging, your .env.local)
src/pages/       Page objects — one class per page: its locators + user actions
src/components/  Parts shared by several pages (header, product card)
src/api/         API clients + response schemas
src/fixtures/    Wires page objects and API clients into tests (the framework's backbone)
src/data/        Test data files (JSON/CSV)
src/utils/       Helpers: random data, CSV reader, accessibility scan, logger
tests/<kind>/    The tests — the folder decides which project (browser) runs them
features/        BDD scenarios in plain English (Gherkin)
templates/       Copy-paste starters for your own page objects and tests
```

**Golden rule:** tests describe _what_ the user does (`loginPage.login(...)`); page objects
know _how_ (selectors, clicks). If a selector changes, you fix one page object, not 20 tests.

## 6. Test your own application

The steps below give you **one working UI test and one working API test** against your app.
Ready-made starters are in [`templates/`](../templates) — they run unchanged against the demo
apps, so you can confirm your setup before editing anything.

### Step 1 — point the framework at your app

Create `config/env/.env.local` (git-ignored, so credentials never get committed):

```bash
BASE_URL=https://your-app.example.com
API_URL=https://api.your-app.example.com
UI_USERNAME=your-test-user
UI_PASSWORD=your-test-password
API_USERNAME=your-api-user
API_PASSWORD=your-api-password
```

Values here override the committed defaults. If something is missing or not a valid URL, the
run stops immediately with a message naming the bad setting.

### Step 2 — a functional (UI) test

1. Copy [`templates/MyPage.template.ts`](../templates/MyPage.template.ts) to
   `src/pages/HomePage.ts`, rename the class, set `path`, `readyLocator` and the locators for
   your page.
2. Copy [`templates/my-ui.template.spec.ts`](../templates/my-ui.template.spec.ts) to
   `tests/ui/home.spec.ts` and change the import to `import { HomePage } from '@pages/HomePage';`.
3. Run it:

   ```bash
   npx playwright test tests/ui/home.spec.ts --project=chromium --no-deps
   ```

   `--no-deps` skips the **login setup** step, which is still written for the demo app.

**Finding locators:** run `npx playwright codegen https://your-app.example.com`, click the
element, and copy the suggested `getByRole(...)` / `getByLabel(...)` into your page object.

### Step 3 — an API test

1. Copy [`templates/my-api.template.spec.ts`](../templates/my-api.template.spec.ts) to
   `tests/api/items.spec.ts`.
2. Change the endpoints, request body and expected status codes. `apiRequest` already uses
   `API_URL`, so write relative paths like `'/items'`.
3. Run it:

   ```bash
   npx playwright test tests/api/items.spec.ts --project=api
   ```

If your API needs a token, add the header per request
(`headers: { Authorization: \`Bearer ${token}\` }`) or, better, create an API client like
`src/api/BookingClient.ts` and register it as a fixture (see
[CONTRIBUTING.md](CONTRIBUTING.md#add-an-api-client)).

> Tests that **create** data should also **delete** it. The `seededBooking` fixture in
> `src/fixtures/index.ts` shows the pattern: create → `use()` → delete, even if the test fails.

### Step 4 — log in once for all UI tests (optional, recommended)

When most of your pages need a logged-in user, edit
[`tests/setup/auth.setup.ts`](../tests/setup/auth.setup.ts) so it logs in to **your** app and
saves the session. Then:

- drop `--no-deps` — every UI test starts already logged in;
- keep `test.use({ storageState: loggedOut })` only in tests that must start logged out
  (e.g. login page tests).

### Step 5 — make it permanent

- Register your page objects as fixtures in `src/fixtures/index.ts` so tests receive them
  directly: `async ({ homePage }) => { ... }` (see [CONTRIBUTING.md](CONTRIBUTING.md)).
- Tag tests (`@smoke`, `@regression`) so CI picks them up.
- Add a new environment by creating `config/env/.env.<name>` and adding `<name>` to the list
  in `src/config/env.ts`.

## 7. Common problems

| Symptom                                                          | Cause and fix                                                                                                                                        |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Invalid test environment configuration … BASE_URL: Invalid URL` | A setting in `.env.local` / `.env.<env>` is missing or malformed — fix the named variable.                                                           |
| All UI tests **skipped**                                         | The `setup` project (login) failed, so everything depending on it was skipped. Check the setup test's error, or use `--no-deps` while experimenting. |
| `Executable doesn't exist … chromium`                            | Browsers not installed: `npx playwright install --with-deps`.                                                                                        |
| Visual test fails on your machine only                           | Screenshots differ per operating system. Generate yours with `npm run test:visual:update`; CI uses its own linux set.                                |
| No HTML/Allure report after a run                                | `--reporter=...` on the command line replaces the configured reporters. Run without it.                                                              |
| `locator … resolved to 0 elements` / timeout                     | The locator doesn't match. Check it with `codegen` or in UI mode's "Pick locator", and prefer `getByRole`/`getByTestId` over CSS.                    |
| Test passes locally, fails in CI                                 | Open the CI run's report artifact and look at the trace; CI is slower and runs on Linux.                                                             |

## 8. Before you open a pull request

```bash
npm run lint && npm run format:check && npm run typecheck
npm run test:smoke
```

The pre-commit hook runs lint, formatting and the type check automatically on `git commit`.
CI runs the same checks plus the smoke suite on every pull request.
