const test = require('node:test');
const assert = require('node:assert/strict');
const { createPdf } = require('../src/services/pdf.service');

test('PDF generator returns a Buffer with a valid PDF signature', async (t) => {
  if (process.env.CI && process.platform !== 'linux') {
    t.skip('Chromium is not available');
    return;
  }

  try {
    const pdf = await createPdf('<html><body><h1>Resume</h1></body></html>');
    assert.equal(Buffer.isBuffer(pdf), true);
    assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
    assert.ok(pdf.length > 1000);
  } catch (error) {
    if (/browser was not found|executablePath|ENOENT/i.test(error.message)) {
      t.skip('Local Chromium is not available');
      return;
    }
    throw error;
  }
});
