/**
 * Config for `playwright merge-reports` in CI. The visual job runs inside a
 * Docker container, so its blob report has a different root path than the
 * shard reports; Playwright needs a common testDir to merge them.
 */
export default {
  testDir: '.',
  reporter: [['html', { open: 'never' }]],
};
