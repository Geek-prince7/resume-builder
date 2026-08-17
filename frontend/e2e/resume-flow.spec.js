import { test, expect } from '@playwright/test';

test('signup, generate, preview, and download a resume', async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;
  await page.goto('/signup');
  await page.getByPlaceholder('John Doe').fill('Test User');
  await page.getByPlaceholder('you@example.com').fill(email);
  await page.getByPlaceholder('At least 6 characters').fill('password123');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page).toHaveURL(/profile/);
  await page.goto('/generate');
  await page.getByPlaceholder('e.g. Google').fill('Example Corp');
  await page.getByPlaceholder('e.g. Senior Software Engineer').fill('Backend Engineer');
  await page.getByPlaceholder('Paste the full job description here...').fill('Build Node.js APIs and reliable backend services.');
  await page.getByRole('button', { name: 'Generate Resume' }).click();
  await expect(page).toHaveURL(/resume\//, { timeout: 30000 });
  await expect(page.getByText('Truthful ATS analysis')).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PDF' }).click();
  expect((await download).suggestedFilename()).toMatch(/test_user_backend_engineer_example_corp\.pdf/);
});
