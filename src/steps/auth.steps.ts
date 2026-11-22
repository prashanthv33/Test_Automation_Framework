import { expect } from '@playwright/test';
import { env } from '@config/env';
import { Given, Then, When } from './fixtures';

Given('I am on the login page', async ({ loginPage }) => {
  await loginPage.open();
});

Given('I am logged in as the standard user', async ({ loginPage, inventoryPage }) => {
  await loginPage.open();
  await loginPage.login(env.UI_USERNAME, env.UI_PASSWORD);
  await inventoryPage.expectLoaded();
});

When(
  'I log in with username {string} and password {string}',
  async ({ loginPage }, username: string, password: string) => {
    await loginPage.login(username, password);
  },
);

When('I log in with valid credentials', async ({ loginPage }) => {
  await loginPage.login(env.UI_USERNAME, env.UI_PASSWORD);
});

Then('I should see the products page', async ({ inventoryPage }) => {
  await inventoryPage.expectLoaded();
  await expect(inventoryPage.title).toHaveText('Products');
});

Then('I should see the login error {string}', async ({ loginPage }, message: string) => {
  await loginPage.expectError(message);
});
