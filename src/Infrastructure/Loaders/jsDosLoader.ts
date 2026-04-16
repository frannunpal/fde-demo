import { getBaseUrl } from '@fde-desktop/fde-core';

let loaded = false;
let loading = false;
const callbacks: Array<() => void> = [];

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

async function loadJsDos(): Promise<void> {
  if (loaded) return;
  if (loading) {
    return new Promise(resolve => {
      callbacks.push(resolve);
    });
  }

  loading = true;
  const baseUrl = getBaseUrl();
  const emulatorsBase = `${baseUrl}js-dos/emulators/`;

  // Load CSS
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = `${baseUrl}js-dos/js-dos.css`;
  document.head.appendChild(css);

  try {
    // Load emulators.js first and set pathPrefix so it finds the WASM files
    await loadScript(`${emulatorsBase}emulators.js`);
    if (typeof (window as unknown as Record<string, unknown>).emulators !== 'undefined') {
      (window as unknown as Record<string, { pathPrefix: string }>).emulators.pathPrefix =
        emulatorsBase;
    }

    // Then load js-dos.js
    await loadScript(`${baseUrl}js-dos/js-dos.js`);

    if (typeof (window as unknown as Record<string, unknown>).Dos === 'undefined') {
      throw new Error('js-dos loaded but window.Dos is not available');
    }

    loaded = true;
    loading = false;
    callbacks.forEach(cb => cb());
    callbacks.length = 0;
  } catch (e) {
    loading = false;
    throw e;
  }
}

export async function ensureJsDosLoaded(): Promise<void> {
  await loadJsDos();
}
