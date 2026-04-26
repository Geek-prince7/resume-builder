const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function retryWithJitter(task, options = {}) {
  const retries = Number(options.retries ?? 3);
  const baseDelayMs = Number(options.baseDelayMs ?? 200);
  const maxDelayMs = Number(options.maxDelayMs ?? 3000);
  const jitterMs = Number(options.jitterMs ?? 250);
  const shouldRetry =
    options.shouldRetry ||
    ((err) => {
      const status = err?.response?.status;
      if (!status) return true;
      return status >= 500 || status === 429;
    });

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await task(attempt);
    } catch (err) {
      lastError = err;
      if (attempt >= retries || !shouldRetry(err)) {
        throw err;
      }

      const expBackoff = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
      const jitter = Math.floor(Math.random() * jitterMs);
      await sleep(expBackoff + jitter);
    }
  }

  throw lastError;
}

module.exports = { retryWithJitter };
