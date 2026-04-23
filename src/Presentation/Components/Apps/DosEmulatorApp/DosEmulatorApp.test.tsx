// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderWithMantine as wrapper, createMockWindowEntity } from '@/Shared/Testing/Utils';

vi.mock('framer-motion', async () => await import('@/Shared/Testing/__mocks__/framer-motion.mock'));

vi.mock('@presentation/Hooks/useJsDos', () => ({
  useJsDos: vi.fn(() => ({
    containerRef: { current: null },
    isRunning: false,
    isPaused: false,
    isMuted: false,
    volume: 1,
    isLoading: false,
    error: null,
    bundleName: null,
    loadBundle: vi.fn(),
    exit: vi.fn(),
    restart: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    mute: vi.fn(),
    unmute: vi.fn(),
    setVolume: vi.fn(),
  })),
}));

vi.mock('@presentation/Hooks/useFcIcon', () => ({
  useFcIconElement: vi.fn(() => null),
  useFiIconElement: vi.fn(() => null),
}));

vi.mock('@presentation/Hooks/useFiIcon', () => ({
  useFiIconElement: vi.fn(() => null),
}));

const { default: DosEmulatorApp } = await import('./DosEmulatorApp');

const renderDosEmulator = (contentData: Record<string, unknown> = {}) => {
  const win = createMockWindowEntity({ contentData });
  const notifyReady = vi.fn((payload?: Record<string, unknown>) => {
    if (payload) win.contentData = { ...(win.contentData ?? {}), ...payload };
  });
  render(<DosEmulatorApp window={win} notifyReady={notifyReady} />, { wrapper });
  return { win, notifyReady };
};

describe('DosEmulatorApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Display', () => {
    it('should render empty state when no bundle is loaded and no autoLoad', () => {
      renderDosEmulator();
      expect(screen.getByText('apps:dosEmulator.noBundle')).toBeInTheDocument();
    });

    it('should call notifyReady on mount', () => {
      const { notifyReady } = renderDosEmulator();
      expect(notifyReady).toHaveBeenCalled();
    });

    it('should NOT show empty state when autoLoad is provided', async () => {
      const useJsDos = await import('@presentation/Hooks/useJsDos');
      vi.mocked(useJsDos.useJsDos).mockReturnValueOnce({
        containerRef: { current: null },
        isRunning: false,
        isPaused: false,
        isMuted: false,
        volume: 1,
        isLoading: true,
        error: null,
        bundleName: null,
        loadBundle: vi.fn(),
        exit: vi.fn(),
        restart: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        mute: vi.fn(),
        unmute: vi.fn(),
        setVolume: vi.fn(),
      });

      renderDosEmulator({
        autoLoad: { url: '/Games/doom.jsdos', name: 'DOOM' },
      });

      expect(screen.queryByText('apps:dosEmulator.noBundle')).not.toBeInTheDocument();
      expect(screen.getByText('apps:dosEmulator.loading')).toBeInTheDocument();
    });
  });

  describe('Header Controls', () => {
    it('should show header when NOT autoLoad (shows Open button)', () => {
      renderDosEmulator();
      expect(screen.queryByText('apps:dosEmulator.noBundle')).toBeInTheDocument();
    });

    it('should NOT show Open button when autoLoad is provided', async () => {
      const useJsDos = await import('@presentation/Hooks/useJsDos');
      vi.mocked(useJsDos.useJsDos).mockReturnValueOnce({
        containerRef: { current: null },
        isRunning: true,
        isPaused: false,
        isMuted: false,
        volume: 1,
        isLoading: false,
        error: null,
        bundleName: 'DOOM',
        loadBundle: vi.fn(),
        exit: vi.fn(),
        restart: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        mute: vi.fn(),
        unmute: vi.fn(),
        setVolume: vi.fn(),
      });

      renderDosEmulator({ autoLoad: { url: '/Games/doom.jsdos', name: 'DOOM' } });

      expect(screen.getByText('DOOM')).toBeInTheDocument();
    });
  });
});
