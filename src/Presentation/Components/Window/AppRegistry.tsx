import type { AppRegistryEntry, AppComponent, AppEntry } from '@fde-desktop/fde-core';

// App manifests — THE SINGLE SOURCE OF TRUTH for app metadata
// Contains: name, icon, dimensions, singleWindow, autoLoad, etc.
export const userAppEntries: AppEntry[] = [
  {
    id: 'welcome',
    name: 'Welcome',
    icon: '👋',
    fcIcon: 'FcBusinessContact',
    singleWindow: true,
    defaultWidth: 900,
    defaultHeight: 700,
    minWidth: 600,
    minHeight: 500,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '🔗',
    fcIcon: 'FiLinkedin',
    iconColor: '#0A66C2',
    singleWindow: true,
    defaultWidth: 900,
    defaultHeight: 700,
    minWidth: 600,
    minHeight: 500,
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
  {
    id: 'cities',
    name: 'Cities',
    icon: '🏙️',
    fcIcon: 'FcCity',
    defaultWidth: 1024,
    defaultHeight: 768,
    minWidth: 800,
    minHeight: 600,
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
    loader: () => import('@fde-desktop/fde-core').then(m => ({ default: m.TerminalApp })),
    isLazy: true,
  },
  'code-server': {
    loader: () => import('@fde-desktop/fde-core').then(m => ({ default: m.CodeServerApp })),
    isLazy: true,
  },
  storybook: {
    loader: () => import('@fde-desktop/fde-core').then(m => ({ default: m.StorybookApp })),
    isLazy: true,
  },
  'dos-emulator': {
    loader: () => import('@presentation/Components/Apps/DosEmulatorApp/DosEmulatorApp'),
    isLazy: true,
  },
  doom: {
    loader: () => import('@presentation/Components/Apps/DosEmulatorApp/DosEmulatorApp'),
    isLazy: true,
  },
  cities: {
    loader: () =>
      import(/* webpackChunkName: "cities-app" */ '@fde-desktop/cities/Integration/CitiesApp').then(
        m => ({ default: m.CitiesApp }),
      ),
    menuBarLoader: () =>
      import(
        /* webpackChunkName: "cities-menubar" */ '@fde-desktop/cities/Integration/CitiesAppMenuBar'
      ).then(m => ({ default: m.CitiesAppMenuBar })),
    isLazy: true,
    appName: 'Cities',
    defaultWidth: 1024,
    defaultHeight: 768,
    minWidth: 800,
    minHeight: 600,
  },
};

export type { AppRegistryEntry, AppComponent, AppEntry };
