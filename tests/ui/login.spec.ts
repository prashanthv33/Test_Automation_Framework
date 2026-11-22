import { test, loggedOut } from '@fixtures';
import { env } from '@config/env';
import users from '@data/users.json';

// Login tests must start without the shared session from the setup project.
test.use({ storageState: loggedOut });

test.describe('Login', { tag: '@regression' }, () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test(
    'standard user can log in and out',
    { tag: '@smoke' },
    async ({ loginPage, inventoryPage }) => {
      await loginPage.login(env.UI_USERNAME, env.UI_PASSWORD);
      await inventoryPage.expectLoaded();

      await inventoryPage.header.logout();
      await loginPage.expectLoaded();
    },
  );

  // Data-driven: one test generated per row in users.json
  for (const user of users.valid) {
    test(`valid login: ${user.description}`, async ({ loginPage, inventoryPage }) => {
      await loginPage.login(user.username, env.UI_PASSWORD);
      await inventoryPage.expectLoaded();
    });
  }

  for (const user of users.invalid) {
    test(`rejected login: ${user.description}`, async ({ loginPage }) => {
      await loginPage.login(user.username, user.password);
      await loginPage.expectError(user.error);
    });
  }

  test('protected pages redirect to login when logged out', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');
    await loginPage.expectError("You can only access '/inventory.html' when you are logged in");
  });
});
