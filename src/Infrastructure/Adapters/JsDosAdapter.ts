import type { DosEmulatorState } from '@/Shared/Interfaces/IDosEmulator';
import type { DosPlayer } from '@/Shared/Types/js-dos';
import { ensureJsDosLoaded } from '@infrastructure/Loaders/jsDosLoader';

export interface JsDosAdapterCallbacks {
  onStateChange: (state: Partial<DosEmulatorState>) => void;
  onExit: () => void;
  pathPrefix?: string;
}

export class JsDosAdapter {
  private player: DosPlayer | null = null;
  private callbacks: JsDosAdapterCallbacks;
  private destroyed = false;
  private volume = 0; // 0-1 float, start muted
  private previousVolume = 1; // 0-1 float, restore to full on unmute
  private currentState: DosEmulatorState = {
    isRunning: false,
    isPaused: false,
    isMuted: true,
    volume: 0,
    isLoading: false,
    error: null,
    bundleUrl: null,
    bundleName: null,
  };

  constructor(callbacks: JsDosAdapterCallbacks) {
    this.callbacks = callbacks;
  }

  async loadBundle(element: HTMLElement, url: string, name?: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      console.log('[JsDosAdapter] Loading js-dos...');
      await ensureJsDosLoaded();
      if (this.destroyed) return;
      console.log('[JsDosAdapter] js-dos loaded, checking window.Dos...');

      if (typeof window.Dos === 'undefined') {
        throw new Error('js-dos is not loaded. Make sure js-dos.js is included in the page.');
      }

      console.log('[JsDosAdapter] Calling window.Dos with url:', url);
      this.player = await window.Dos(element, {
        url,
        noCloud: true,
        autoStart: true,
        ...(this.callbacks.pathPrefix ? { pathPrefix: this.callbacks.pathPrefix } : {}),
      });

      // Apply initial muted state to the newly created player
      this.player.setVolume(0);

      if (this.destroyed) {
        void this.player.stop();
        this.player = null;
        return;
      }

      console.log('[JsDosAdapter] Player created, emulator ready');
      this.updateState({
        isRunning: true,
        isLoading: false,
        bundleUrl: url,
        bundleName: name || url.split('/').pop() || 'DOS Program',
      });
    } catch (error) {
      console.error('[JsDosAdapter] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load DOS bundle';
      this.updateState({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  }

  pause(): void {
    if (!this.player) return;
    this.player.setPaused(true);
    this.updateState({ isPaused: true });
  }

  resume(): void {
    if (!this.player) return;
    this.player.setPaused(false);
    this.updateState({ isPaused: false });
  }

  mute(): void {
    if (!this.player) return;
    this.previousVolume = this.volume;
    this.player.setVolume(0);
    this.updateState({ isMuted: true });
  }

  unmute(): void {
    if (!this.player) return;
    this.player.setVolume(this.previousVolume);
    this.updateState({ isMuted: false });
  }

  setVolume(level: number): void {
    if (!this.player) return;
    const clampedVolume = Math.max(0, Math.min(1, level));
    this.volume = clampedVolume;
    this.player.setVolume(clampedVolume);

    if (this.currentState.isMuted && clampedVolume > 0) {
      this.updateState({ volume: clampedVolume, isMuted: false });
    } else {
      this.updateState({ volume: clampedVolume });
    }
  }

  async exit(): Promise<void> {
    const player = this.player;
    this.player = null;

    if (player) {
      await player.stop();
    }

    this.updateState({
      isRunning: false,
      isPaused: false,
      bundleUrl: null,
      bundleName: null,
    });
    this.callbacks.onExit();
  }

  getState(): DosEmulatorState {
    return { ...this.currentState };
  }

  private updateState(partial: Partial<DosEmulatorState>): void {
    this.currentState = { ...this.currentState, ...partial };
    this.callbacks.onStateChange(partial);
  }

  destroy(): void {
    this.destroyed = true;
    const player = this.player;
    this.player = null;

    if (player) {
      void player.stop();
    }
  }
}
