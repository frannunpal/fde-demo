// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { JsDosAdapter } from './JsDosAdapter';
import type { DosPlayer } from '@/Shared/Types/js-dos';

vi.mock('@/Infrastructure/Loaders/jsDosLoader', () => ({
  ensureJsDosLoaded: vi.fn().mockResolvedValue(undefined),
}));

const makePlayerMock = (): DosPlayer => ({
  stop: vi.fn().mockResolvedValue(undefined),
  setPaused: vi.fn(),
  setVolume: vi.fn(),
});

describe('JsDosAdapter', () => {
  let onStateChange: Mock;
  let onExit: Mock;
  let adapter: JsDosAdapter;
  let element: HTMLElement;
  let playerMock: DosPlayer;

  beforeEach(() => {
    onStateChange = vi.fn();
    onExit = vi.fn();
    adapter = new JsDosAdapter({ onStateChange, onExit });
    element = document.createElement('div');
    playerMock = makePlayerMock();

    window.Dos = vi.fn().mockResolvedValue(playerMock);
  });

  describe('loadBundle', () => {
    it('should call window.Dos with url', async () => {
      await adapter.loadBundle(element, '/doom.jsdos', 'DOOM');

      expect(window.Dos).toHaveBeenCalledWith(
        element,
        expect.objectContaining({ url: '/doom.jsdos' }),
      );
    });

    it('should call window.Dos with pathPrefix when provided', async () => {
      adapter = new JsDosAdapter({ onStateChange, onExit, pathPrefix: '/emulators/' });

      await adapter.loadBundle(element, '/doom.jsdos');

      expect(window.Dos).toHaveBeenCalledWith(
        element,
        expect.objectContaining({ pathPrefix: '/emulators/' }),
      );
    });

    it('should call onStateChange with isLoading: true then isRunning: true on success', async () => {
      await adapter.loadBundle(element, '/doom.jsdos', 'DOOM');

      expect(onStateChange).toHaveBeenCalledWith(expect.objectContaining({ isLoading: true }));
      expect(onStateChange).toHaveBeenCalledWith(
        expect.objectContaining({ isRunning: true, isLoading: false }),
      );
    });

    it('should set bundleName from name parameter', async () => {
      await adapter.loadBundle(element, '/doom.jsdos', 'DOOM');

      expect(onStateChange).toHaveBeenCalledWith(expect.objectContaining({ bundleName: 'DOOM' }));
    });

    it('should derive bundleName from url when name is not provided', async () => {
      await adapter.loadBundle(element, '/path/to/game.jsdos');

      expect(onStateChange).toHaveBeenCalledWith(
        expect.objectContaining({ bundleName: 'game.jsdos' }),
      );
    });

    it('should call onStateChange with error and isLoading: false when window.Dos throws', async () => {
      window.Dos = vi.fn().mockRejectedValue(new Error('Network error'));
      vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(adapter.loadBundle(element, '/doom.jsdos')).rejects.toThrow('Network error');
      expect(onStateChange).toHaveBeenCalledWith(
        expect.objectContaining({ isLoading: false, error: 'Network error' }),
      );

      vi.restoreAllMocks();
    });

    it('should throw when js-dos is not loaded (window.Dos undefined)', async () => {
      // @ts-expect-error - intentionally removing Dos to test the guard
      window.Dos = undefined;

      await expect(adapter.loadBundle(element, '/doom.jsdos')).rejects.toThrow(
        'js-dos is not loaded',
      );
    });
  });

  describe('pause / resume', () => {
    it('should call player.setPaused(true) and update state', async () => {
      await adapter.loadBundle(element, '/doom.jsdos');

      adapter.pause();

      expect(playerMock.setPaused).toHaveBeenCalledWith(true);
      expect(onStateChange).toHaveBeenCalledWith({ isPaused: true });
    });

    it('should call player.setPaused(false) and update state', async () => {
      await adapter.loadBundle(element, '/doom.jsdos');

      adapter.resume();

      expect(playerMock.setPaused).toHaveBeenCalledWith(false);
      expect(onStateChange).toHaveBeenCalledWith({ isPaused: false });
    });

    it('should do nothing when no player is active', () => {
      adapter.pause();
      adapter.resume();

      expect(playerMock.setPaused).not.toHaveBeenCalled();
    });
  });

  describe('mute / unmute', () => {
    it('should call player.setVolume(0) and update state', async () => {
      await adapter.loadBundle(element, '/doom.jsdos');
      // Unmute first (adapter starts muted) so mute() has an effect
      adapter.unmute();
      vi.clearAllMocks();

      adapter.mute();

      expect(playerMock.setVolume).toHaveBeenCalledWith(0);
      expect(onStateChange).toHaveBeenCalledWith({ isMuted: true });
    });

    it('should restore previous volume on unmute', async () => {
      await adapter.loadBundle(element, '/doom.jsdos');
      // Unmute first to set previousVolume, then set a custom volume, then mute/unmute
      adapter.unmute();
      adapter.setVolume(0.5);
      adapter.mute();
      vi.clearAllMocks();

      adapter.unmute();

      expect(playerMock.setVolume).toHaveBeenCalledWith(0.5);
      expect(onStateChange).toHaveBeenCalledWith({ isMuted: false });
    });

    it('should do nothing when no player is active', () => {
      adapter.mute();
      adapter.unmute();

      expect(playerMock.setVolume).not.toHaveBeenCalled();
    });
  });

  describe('setVolume', () => {
    it('should call player.setVolume with clamped value', async () => {
      await adapter.loadBundle(element, '/doom.jsdos');
      vi.clearAllMocks();

      adapter.setVolume(0.75);

      expect(playerMock.setVolume).toHaveBeenCalledWith(0.75);
      expect(onStateChange).toHaveBeenCalledWith({ volume: 0.75, isMuted: false });
    });

    it('should clamp volume to 0-1 range', async () => {
      await adapter.loadBundle(element, '/doom.jsdos');
      vi.clearAllMocks();

      adapter.setVolume(1.5);

      expect(playerMock.setVolume).toHaveBeenCalledWith(1);
      expect(onStateChange).toHaveBeenCalledWith({ volume: 1, isMuted: false });

      vi.clearAllMocks();

      adapter.setVolume(-0.1);

      expect(playerMock.setVolume).toHaveBeenCalledWith(0);
      expect(onStateChange).toHaveBeenCalledWith({ volume: 0 });
    });

    it('should unmute when volume is set while muted', async () => {
      await adapter.loadBundle(element, '/doom.jsdos');
      // Adapter starts muted; ensure it's in muted state (it already is)
      vi.clearAllMocks();

      adapter.setVolume(0.6);

      expect(playerMock.setVolume).toHaveBeenCalledWith(0.6);
      expect(onStateChange).toHaveBeenCalledWith({ volume: 0.6, isMuted: false });
    });

    it('should not unmute when volume is 0', async () => {
      await adapter.loadBundle(element, '/doom.jsdos');
      // Adapter starts muted; ensure it's in muted state (it already is)
      vi.clearAllMocks();

      adapter.setVolume(0);

      expect(playerMock.setVolume).toHaveBeenCalledWith(0);
      expect(onStateChange).toHaveBeenCalledWith({ volume: 0 });
      expect(onStateChange).not.toHaveBeenCalledWith(expect.objectContaining({ isMuted: false }));
    });

    it('should do nothing when no player is active', () => {
      adapter.setVolume(0.5);

      expect(playerMock.setVolume).not.toHaveBeenCalled();
    });
  });

  describe('exit', () => {
    it('should call player.stop and clear player state', async () => {
      await adapter.loadBundle(element, '/doom.jsdos');

      await adapter.exit();

      expect(playerMock.stop).toHaveBeenCalled();
      expect(onStateChange).toHaveBeenCalledWith(
        expect.objectContaining({ isRunning: false, bundleName: null }),
      );
    });

    it('should do nothing when no player is active', async () => {
      await expect(adapter.exit()).resolves.toBeUndefined();
    });
  });

  describe('destroy', () => {
    it('should call player.stop when player is active', async () => {
      await adapter.loadBundle(element, '/doom.jsdos');

      adapter.destroy();

      expect(playerMock.stop).toHaveBeenCalled();
    });

    it('should do nothing when no player is active', () => {
      adapter.destroy();

      expect(playerMock.stop).not.toHaveBeenCalled();
    });
  });

  describe('getState', () => {
    it('should return current state snapshot', async () => {
      await adapter.loadBundle(element, '/doom.jsdos', 'DOOM');
      adapter.setVolume(0.8);

      const state = adapter.getState();

      expect(state.isRunning).toBe(true);
      expect(state.bundleName).toBe('DOOM');
      expect(state.volume).toBe(0.8);
    });
  });
});
