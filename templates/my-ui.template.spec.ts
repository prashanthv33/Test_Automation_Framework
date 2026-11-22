/**
 * TEMPLATE — functional (UI) test.
 *
 * 1. Copy to tests/ui/<feature>.spec.ts
 * 2. Import your page object instead of MyPage.
 * 3. Run:  npx playwright test tests/ui/<feature>.spec.ts --project=chromium --no-deps
 *          (--no-deps skips the demo app's login setup — see docs/GETTING_STARTED.md)
 *
 * As written it runs against the demo app and passes.
 */
import { test, expect, loggedOut } from '@fixtures';
import { MyPage } from './MyPage.template'; // TODO: '@pages/<YourPage>'

// Start without a logged-in session. Remove this line once your own
// login setup is in place (tests/setup/auth.setup.ts).
test.use({ storageState: loggedOut });

test.describe('My feature', { tag: '@regression' }, () => {
  test('page loads', { tag: '@smoke' }, async ({ page }) => {
    const myPage = new MyPage(page);

    await myPage.open(); // navigates and waits until readyLocator is visible
    await expect(myPage.mainButton).toBeEnabled();
  });

  test('shows a validation error when submitted empty', async ({ page }) => {
    const myPage = new MyPage(page);
    await myPage.open();

    await myPage.submit();

    await myPage.expectError('Username is required'); // TODO: your app's message
  });
});
