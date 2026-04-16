export interface DosEmulatorState {
  isRunning: boolean;
  isPaused: boolean;
  isMuted: boolean;
  volume: number; // 0-1 float, default 1
  isLoading: boolean;
  error: string | null;
  bundleUrl: string | null;
  bundleName: string | null;
}

export interface DosEmulatorActions {
  loadBundle: (url: string, name?: string) => Promise<void>;
  exit: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  mute: () => void;
  unmute: () => void;
  setVolume: (volume: number) => void;
}

export type DosEmulatorController = DosEmulatorState & DosEmulatorActions;

export interface JsDosConfig {
  width: number;
  height: number;
}

export interface DosBundleInfo {
  url: string;
  name: string;
}

export const DOS_BUNDLE_MIME_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/jsdos',
];

export const DOS_BUNDLE_EXTENSIONS = ['.jsdos', '.zip'];
