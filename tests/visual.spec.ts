import { test, expect, type Page } from '@playwright/test';

/**
 * Visual regression tests — baseline screenshots.
 *
 * These tests capture screenshots of the four main UI states and compare
 * them against committed baselines stored in tests/__screenshots__/.
 *
 * The wheel SVG is masked on every screenshot so that its random rotation
 * angle after a spin never causes a false failure.
 *
 * To regenerate all baselines run:
 *   pnpm test:e2e --update-snapshots --project=chromium
 */

// All visual tests run on a fixed viewport so dimensions are deterministic.
test.use({ viewport: { width: 1280, height: 800 } });

// Ensure the app always starts from a clean, predictable state.
async function freshPage(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

const wheelMask = (page: Page) => [page.locator('.wheel-container')];

test.describe('Visual regression – baseline screenshots', () => {
  test('idle wheel', async ({ page }) => {
    await freshPage(page);

    await expect(page).toHaveScreenshot('idle-wheel.png', {
      animations: 'disabled',
      mask: wheelMask(page),
    });
  });

  test('palettes panel open', async ({ page }) => {
    await freshPage(page);

    await page.locator('.palettes-trigger').click();
    await page.locator('.palettes-dropdown').waitFor({ state: 'visible' });

    await expect(page).toHaveScreenshot('palettes-open.png', {
      animations: 'disabled',
      mask: wheelMask(page),
    });
  });

  test('history drawer', async ({ page }) => {
    await freshPage(page);

    await page.locator('.view-history-link').click();
    await page.locator('.history-drawer').waitFor({ state: 'visible' });

    await expect(page).toHaveScreenshot('history-drawer.png', {
      animations: 'disabled',
      mask: wheelMask(page),
    });
  });

  test('after spin – winner overlay visible', async ({ page }) => {
    await freshPage(page);

    await page.locator('.spin-button').click();
    // Wait up to 10 s for the winner overlay to appear (default spin = 5 s).
    await page
      .locator('.winner-overlay')
      .waitFor({ state: 'visible', timeout: 10_000 });

    await expect(page).toHaveScreenshot('after-spin.png', {
      animations: 'disabled',
      // Mask elements whose content is random so they never cause false failures:
      //   .wheel-container  – random final rotation angle
      //   .winner-overlay   – random winning segment label
      //   .recent-grid      – random spin history labels
      mask: [
        ...wheelMask(page),
        page.locator('.winner-overlay'),
        page.locator('.recent-grid'),
      ],
      maskColor: '#888888',
    });
  });
});
