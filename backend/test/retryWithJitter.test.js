const test = require('node:test');
const assert = require('node:assert/strict');
const { retryWithJitter } = require('../src/utils/retryWithJitter');

test('does not duplicate a request after an axios timeout', async () => {
  let attempts = 0;
  const timeout = Object.assign(new Error('timeout of 30000ms exceeded'), {
    code: 'ECONNABORTED',
  });

  await assert.rejects(
    retryWithJitter(async () => {
      attempts += 1;
      throw timeout;
    }, { retries: 3, baseDelayMs: 0, jitterMs: 0 }),
    timeout
  );
  assert.equal(attempts, 1);
});
