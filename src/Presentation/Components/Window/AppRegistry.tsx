import type { AppRegistryEntry, AppComponent, AppEntry } from '@fde-desktop/fde-core';
import { TerminalApp, CodeServerApp, StorybookApp } from '@fde-desktop/fde-core';

// App manifests — THE SINGLE SOURCE OF TRUTH for app metadata
// Contains: name, icon, dimensions, singleWindow, autoLoad, etc.
export const userAppEntries: AppEntry[] = [
  {
    id: 'welcome',
    name: 'Welcome',
    icon: '👋',
    fcIcon: 'FcBusinessContact',
    singleWindow: true,
    defaultWidth: 1024,
    defaultHeight: 768,
    minWidth: 1024,
    minHeight: 768,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '🔗',
    fcIcon: 'FiLinkedin',
    iconColor: '#0A66C2',
    singleWindow: true,
    defaultWidth: 640,
    defaultHeight: 480,
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: '🔗',
    fcIcon: 'FiGithub',
    iconColor: '#000',
    singleWindow: true,
    defaultWidth: 640,
    defaultHeight: 480,
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: '💻',
    fcIcon: 'FcCommandLine',
    defaultWidth: 800,
    defaultHeight: 600,
    minWidth: 640,
    minHeight: 480,
  },
  {
    id: 'code-server',
    name: 'VS Code',
    icon: '📘',
    fcIcon: 'FcCodesandbox',
    iconUrl: `${import.meta.env.BASE_URL}vscode.svg`,
    defaultWidth: 1200,
    defaultHeight: 800,
    minWidth: 800,
    minHeight: 600,
  },
  {
    id: 'storybook',
    name: 'Storybook',
    icon: '📖',
    fcIcon: 'FcReading',
    defaultWidth: 1100,
    defaultHeight: 700,
    minWidth: 640,
    minHeight: 480,
  },
  {
    id: 'dos-emulator',
    name: 'DOS Emulator',
    icon: '🎮',
    fcIcon: 'FcGamepad',
    defaultWidth: 900,
    defaultHeight: 700,
    minWidth: 640,
    minHeight: 480,
  },
  {
    id: 'doom',
    name: 'DOOM',
    icon: '🔫',
    fcIcon: 'FcVideoGame',
    iconUrl: 'doom.png',
    singleWindow: true,
    defaultWidth: 900,
    defaultHeight: 700,
    minWidth: 640,
    minHeight: 480,
    autoLoad: { url: 'Games/doom.jsdos', name: 'DOOM' },
  },
];

// Component registry — only contains component loading info
// Metadata (appName, singleWindow, dimensions) is derived from userAppEntries
export const userApps: Record<string, AppRegistryEntry> = {
  welcome: {
    loader: () => import('@presentation/Components/Apps/WelcomeApp/WelcomeApp'),
    isLazy: true,
  },
  linkedin: {
    loader: () => import('@presentation/Components/Apps/LinkekinApp/LinkedinApp'),
    isLazy: true,
  },
  github: {
    loader: () => import('@presentation/Components/Apps/GithubApp/GithubApp'),
    isLazy: true,
  },
  terminal: {
    loader: () => Promise.resolve({ default: TerminalApp }),
    isLazy: false,
  },
  'code-server': {
    loader: () => Promise.resolve({ default: CodeServerApp }),
    isLazy: false,
  },
  storybook: {
    loader: () => Promise.resolve({ default: StorybookApp }),
    isLazy: false,
  },
  'dos-emulator': {
    loader: () => import('@presentation/Components/Apps/DosEmulatorApp/DosEmulatorApp'),
    isLazy: true,
  },
  doom: {
    loader: () => import('@presentation/Components/Apps/DosEmulatorApp/DosEmulatorApp'),
    isLazy: true,
  },
};

export type { AppRegistryEntry, AppComponent, AppEntry };
