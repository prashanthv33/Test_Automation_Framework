import { test as bddBase, createBdd } from 'playwright-bdd';
import {
  fixtureDefinitions,
  type ApiFixtures,
  type PageFixtures,
  type WorkerFixtures,
} from '@fixtures';

/**
 * BDD gets the very same page objects, API clients and teardown logic as the
 * spec-style tests — only the authoring style differs.
 */
export const test = bddBase.extend<PageFixtures & ApiFixtures, WorkerFixtures>(fixtureDefinitions);

export const { Given, When, Then } = createBdd(test);
