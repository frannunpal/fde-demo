import { useRef, useState, useCallback, useEffect, type RefObject } from 'react';
import type { DosEmulatorState } from '@/Shared/Interfaces/IDosEmulator';
import { JsDosAdapter } from '@/Infrastructure/Adapters/JsDosAdapter';
import { fileSystem } from '@fde-desktop/fde-core';
import { resolveUrl, getBaseUrl } from '@fde-desktop/fde-core';

const resolveBundleUrl = async (url: string): Promise<string> => {
  if (url.startsWith('idb://')) {
    const blobUrl = await fileSystem.toBlobUrl(url);
    return blobUrl ?? url;
  }
  return resolveUrl(url);
};

interface UseJsDosOptions {
  autoLoad?: {
    url: string;
    name?: string;
  };
}

interface UseJsDosReturn {
  containerRef: RefObject<HTMLDivElement | null>;
  isRunning: boolean;
  isPaused: boolean;
  isMuted: boolean;
  volume: number;
  isLoading: boolean;
  error: string | null;
  bundleName: string | null;
  loadBundle: (url: string, name?: string) => Promise<void>;
  exit: () => Promise<void>;
  restart: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  mute: () => void;
  unmute: () => void;
  setVolume: (level: number) => void;
}

export function useJsDos(options?: UseJsDosOptions): UseJsDosReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const adapterRef = useRef<JsDosAdapter | null>(null);
  const autoLoadOptions = options?.autoLoad;

  const [state, setState] = useState<DosEmulatorState>({
    isRunning: false,
    isPaused: false,
    isMuted: true,
    volume: 0,
    isLoading: !!autoLoadOptions,
    error: null,
    bundleUrl: null,
    bundleName: null,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      window.dispatchEvent(new Event('resize'));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const adapter = new JsDosAdapter({
      onStateChange: partial => setState(prev => ({ ...prev, ...partial })),
      onExit: () => setState(prev => ({ ...prev, isRunning: false })),
      pathPrefix: `${getBaseUrl()}js-dos/emulators/`,
    });
    adapterRef.current = adapter;

    if (autoLoadOptions && container) {
      resolveBundleUrl(autoLoadOptions.url)
        .then((resolved: string) => adapter.loadBundle(container, resolved, autoLoadOptions.name))
        .catch((err: unknown) => {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load bundle';
          setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
        });
    }

    return () => {
      adapter.destroy();
      adapterRef.current = null;
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [autoLoadOptions]);

  const loadBundle = useCallback(async (url: string, name?: string) => {
    if (!containerRef.current) {
      setState(prev => ({ ...prev, error: 'Container not ready', isLoading: false }));
      return;
    }

    if (!adapterRef.current) {
      setState(prev => ({ ...prev, error: 'Emulator not initialized', isLoading: false }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const resolved = await resolveBundleUrl(url);
      await adapterRef.current.loadBundle(containerRef.current, resolved, name);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load bundle';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
    }
  }, []);

  const exit = useCallback(async () => {
    await adapterRef.current?.exit();
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  }, []);

  const restart = useCallback(async () => {
    const adapter = adapterRef.current;
    if (!adapter || !containerRef.current) return;

    const { bundleUrl, bundleName } = adapter.getState();
    if (!bundleUrl) return;

    await adapter.exit();
    containerRef.current.innerHTML = '';

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await adapter.loadBundle(containerRef.current, bundleUrl, bundleName ?? undefined);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reload bundle';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
    }
  }, []);

  const pause = useCallback(() => {
    adapterRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    adapterRef.current?.resume();
  }, []);

  const mute = useCallback(() => {
    adapterRef.current?.mute();
  }, []);

  const unmute = useCallback(() => {
    adapterRef.current?.unmute();
  }, []);

  const setVolume = useCallback((level: number) => {
    adapterRef.current?.setVolume(level);
  }, []);

  return {
    containerRef,
    isRunning: state.isRunning,
    isPaused: state.isPaused,
    isMuted: state.isMuted,
    volume: state.volume,
    isLoading: state.isLoading,
    error: state.error,
    bundleName: state.bundleName,
    loadBundle,
    exit,
    restart,
    pause,
    resume,
    mute,
    unmute,
    setVolume,
  };
}
