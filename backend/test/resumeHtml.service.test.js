const test = require('node:test');
const assert = require('node:assert/strict');
const { renderResumeHtml } = require('../src/services/resumeHtml.service');

test('print stylesheet applies margins to every PDF page', () => {
  const html = renderResumeHtml({ name: 'Test User' }, 'modern', {
    pageSize: 'Letter',
    density: 'standard',
  });

  assert.match(html, /@page\{size:Letter;margin:13mm 15mm\}/);
  assert.match(html, /main\{padding:0\}/);
  assert.match(html, /break-after:avoid/);
});
