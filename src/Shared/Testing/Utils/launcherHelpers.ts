import type { Page } from '@playwright/test';

const APP_DISPLAY_NAMES: Record<string, string> = {
  'device-info': 'Device Info|Info del dispositivo',
  calendar: 'Calendar|Calendario',
  notepad: 'Notepad|Bloc de notas',
  files: 'Files|Archivos',
  settings: 'Settings|Configuración|System settings',
  pdf: 'PDF Viewer|Visor PDF|PDF',
  uploader: 'Uploader|Subir archivo|Upload',
  menuedit: 'Edit Launcher|Editar lanzador',
};

/**
 * Opens the launcher panel
 */
export async function openLauncher(page: Page): Promise<void> {
  const launcher = page.locator('[aria-label="Launcher"]');
  await launcher.click();
  await page.waitForSelector('[role="menu"][aria-label="App launcher"]', { timeout: 5000 });
}

/**
 * Closes the launcher panel
 */
export async function closeLauncher(page: Page): Promise<void> {
  const launcher = page.locator('[aria-label="Launcher"]');
  const isExpanded = await launcher.getAttribute('aria-expanded');
  if (isExpanded === 'true') {
    await launcher.click();
    await page.waitForTimeout(100);
  }
}

/**
 * Opens an app from the launcher by searching for it
 */
export async function openAppFromLauncher(page: Page, appName: string): Promise<void> {
  await openLauncher(page);

  // Get display name(s) for the app, fallback to appName
  const displayName = APP_DISPLAY_NAMES[appName] || appName;

  const searchInput = page.getByPlaceholder(/search/i);
  await searchInput.fill(appName);
  await page.waitForTimeout(200);

  // Use displayName pattern if available, otherwise use appName
  const appButton = page.getByRole('menuitem', { name: new RegExp(displayName, 'i') });
  await appButton.click();
}

/**
 * Searches for an app in the launcher (without opening it)
 */
export async function searchInLauncher(page: Page, query: string): Promise<void> {
  await openLauncher(page);

  const searchInput = page.getByPlaceholder(/search/i);
  await searchInput.fill(query);
  await page.waitForTimeout(100);
}

/**
 * Clears the launcher search input
 */
export async function clearLauncherSearch(page: Page): Promise<void> {
  const searchInput = page.getByPlaceholder(/search/i);
  await searchInput.clear();
  await page.waitForTimeout(50);
}

/**
 * Gets all visible app names in the launcher
 */
export async function getVisibleAppsInLauncher(page: Page): Promise<string[]> {
  const appButtons = await page.getByRole('menuitem').all();
  const appNames: string[] = [];
  for (const button of appButtons) {
    const text = await button.textContent();
    if (text) {
      appNames.push(text.trim());
    }
  }
  return appNames;
}
