import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('homepage title and screenshot', async ({ page, browserName }, testInfo) => {
  // Use baseURL from playwright.config.ts, so '/' resolves to http://localhost:7357
  await page.goto('/');

  // Verify the page title
  await expect(page).toHaveTitle('Vibe Spin');

  // Build a descriptive, filesystem-safe filename including project (browser) and test title
  const safeTitle = testInfo.title.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9-_\.]/g, '');
  const fileName = `${testInfo.project.name}-${browserName}-${safeTitle}.png`;

  // Save screenshots to a persistent folder outside Playwright temp dirs
  // const outDir = path.resolve(process.cwd(), 'e2e-artifacts', 'screenshots');
  // fs.mkdirSync(outDir, { recursive: true });
  // const filePath = path.join(outDir, fileName);

  // Save the screenshot (this file will remain after the test completes)
  // await page.screenshot({ path: filePath, fullPage: true });
  // const screenshotBuffer = await page.screenshot({ path: filePath, fullPage: true });
  const screenshotBuffer = await page.screenshot({ fullPage: true });
  await testInfo.attach(fileName, {
    body: screenshotBuffer,
    contentType: 'image/png'
  });
  // Also log the final path so it's easy to find in test output
  // console.log('Saved persistent screenshot to:', filePath);
});
