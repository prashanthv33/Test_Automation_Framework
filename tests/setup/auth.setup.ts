import fs from 'node:fs';
import path from 'node:path';
import { test as setup } from '@fixtures';
import { env } from '@config/env';
import { STORAGE_STATE } from '@config/constants';

/**
 * Logs in through the real UI once and saves cookies to disk.
 * Every authenticated project depends on this, so individual tests start
 * already logged in instead of repeating the login flow hundreds of times.
 */
setup('authenticate as standard user', async ({ loginPage, inventoryPage, page }) => {
  await loginPage.open();
  await loginPage.login(env.UI_USERNAME, env.UI_PASSWORD);
  await inventoryPage.expectLoaded();

  // SauceDemo's session cookie lives only 10 minutes; a full cross-browser run
  // can outlast that. Extend it in the saved state so late tests stay logged in.
  const state = await page.context().storageState();
  const oneDay = Date.now() / 1000 + 24 * 60 * 60;
  state.cookies = state.cookies.map((c) =>
    c.name === 'session-username' ? { ...c, expires: oneDay } : c,
  );

  fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true });
  fs.writeFileSync(STORAGE_STATE, JSON.stringify(state, null, 2));
});
