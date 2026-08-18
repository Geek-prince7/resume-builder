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

test('all premium themes render print-safe HTML', () => {
  const templates = ['modern', 'minimal', 'classic', 'executive', 'creative', 'editorial', 'swiss', 'atlas', 'noir', 'ivy', 'coastal', 'slate', 'aurora', 'monogram', 'compact'];
  for (const template of templates) {
    const html = renderResumeHtml({ name: 'Jordan Patel', summary: 'Engineering leader' }, template, { pageSize: 'A4' });
    assert.match(html, /Jordan Patel/);
    assert.match(html, /@page\{size:A4;margin:/);
    assert.match(html, /break-inside:avoid/);
  }
});
