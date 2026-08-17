const puppeteer = require('puppeteer-core');

function executablePath() {
  return process.env.CHROMIUM_PATH || (process.platform === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : '/usr/bin/chromium-browser');
}

async function createPdf(html, pageSize = 'Letter') {
  const browser = await puppeteer.launch({
    executablePath: executablePath(),
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    return await page.pdf({ format: pageSize === 'A4' ? 'A4' : 'Letter', printBackground: true, preferCSSPageSize: true });
  } finally {
    await browser.close();
  }
}

module.exports = { createPdf };
