// Types for js-dos v8 API
// window.Dos() returns a wrapper object with methods like stop(), setPaused(), setVolume().
// The internal player object (with ci) is NOT accessible - use stop() for cleanup.

export interface DosPlayer {
  stop: () => Promise<void>;
  setPaused: (paused: boolean) => void;
  setVolume: (volume: number) => void;
}

export interface DosOptions {
  url: string;
  pathPrefix?: string;
  backend?: 'dosbox' | 'dosbox-x';
  autoStart?: boolean;
  noCloud?: boolean;
  noNetworking?: boolean;
}

declare global {
  interface Window {
    Dos: (element: HTMLElement, options: DosOptions) => Promise<DosPlayer>;
  }
}

export { DosPlayer, DosOptions };
