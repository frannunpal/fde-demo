import type { Locator, Page } from '@playwright/test';

/**
 * Cierra TODAS las ventanas Welcome que puedan estar abiertas.
 *
 * La app abre automáticamente la ventana Welcome cuando se carga si no hay ventanas
 * (ver App.tsx). En tests con page.reload() puede haber múltiples ventanas acumuladas.
 *
 * Usa force:true para evitar problemas con elementos que interceptan clicks.
 *
 * @param page - Playwright Page object
 */
export async function closeDefaultWelcomeWindow(page: Page): Promise<void> {
  const welcomeWindows = page.locator('[data-testid="window-welcome"]');
  const startTime = Date.now();
  const maxTime = 5000; // 5 second timeout

  // Close all welcome windows with timeout
  while (Date.now() - startTime < maxTime) {
    const count = await welcomeWindows.count();
    if (count === 0) break;

    // Close all windows in parallel for speed
    const closeButtons = await welcomeWindows.locator('button[aria-label="Close"]').all();
    for (const btn of closeButtons) {
      await btn.click({ force: true, timeout: 1000 }).catch(() => {});
    }

    // Wait for DOM to update
    await page.waitForTimeout(150);
  }
}

/**
 * @deprecated Use closeDefaultWelcomeWindow instead
 */
export async function closeDefaultPdfWindow(page: Page): Promise<void> {
  await closeDefaultWelcomeWindow(page);
}

/**
 * Closes all open windows on the desktop.
 *
 * Iterates in reverse order to avoid index-shift issues as windows are removed from the DOM.
 * Use this in beforeEach to ensure test isolation when previous tests may leave windows open.
 *
 * @param page - Playwright Page object
 */
export async function closeAllWindows(page: Page): Promise<void> {
  const windows = page.locator('[data-testid^="window-"]');
  const all: Locator[] = await windows.all().catch(() => []);
  for (let i = all.length - 1; i >= 0; i--) {
    const win = all[i];
    const isVisible = await win.isVisible().catch(() => false);
    if (isVisible) {
      const closeButton = win.locator('[aria-label="Close"]').first();
      await closeButton.click().catch(() => {});
      await win.waitFor({ state: 'detached', timeout: 2000 }).catch(() => {});
    }
  }
}
