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
  {
    id: 'ink-chat',
    name: 'Ink Chat',
    icon: '💬',
    fcIcon: 'FcComments',
    defaultWidth: 600,
    defaultHeight: 500,
    minWidth: 600,
    minHeight: 500,
    singleWindow: true,
  },
  {
    id: 'sun-study',
    name: 'Sun Study',
    icon: '☀️',
    defaultWidth: 1200,
    defaultHeight: 900,
    minWidth: 800,
    minHeight: 600,
  },
  {
    id: 'filter-panel',
    name: 'Building Filters',
    icon: '🔍',
    fcIcon: 'FcSearch',
    defaultWidth: 320,
    defaultHeight: 600,
    minWidth: 280,
    minHeight: 500,
    canMaximize: false,
    alwaysOnTop: true,
    singleWindow: true,
  },
  {
    id: 'hvac',
    name: 'HVAC',
    icon: '🌬️',
    fcIcon: 'FcFactory',
    defaultWidth: 1100,
    defaultHeight: 800,
    minWidth: 800,
    minHeight: 600,
    singleWindow: true,
  },
  {
    id: 'hvac-theatre',
    name: 'HVAC Controls',
    icon: '🎛️',
    fcIcon: 'FcSettings',
    defaultWidth: 320,
    defaultHeight: 600,
    minWidth: 280,
    minHeight: 500,
    canMaximize: false,
    alwaysOnTop: true,
    singleWindow: true,
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
  cities: {
    loader: () =>
      import('@fde-desktop/cities/Integration/CitiesApp').then(m => ({ default: m.CitiesApp })),
    menuBarLoader: () =>
      import('@fde-desktop/cities/Integration/CitiesAppMenuBar').then(m => ({
        default: m.CitiesAppMenuBar,
      })),
    isLazy: true,
  },
  'cities-theatre': {
    loader: () =>
      import('@fde-desktop/cities/Presentation/Components/CitiesTheatre').then(m => ({
        default: m.CitiesTheatreApp,
      })),
    isLazy: true,
    appName: 'Cities Theatre',
    singleWindow: true,
    alwaysOnTop: true,
    canMaximize: false,
    defaultWidth: 600,
    defaultHeight: 600,
    minWidth: 500,
    minHeight: 500,
    icon: '🎭',
    fcIcon: 'FcBarChart',
  },
  'ink-chat': {
    loader: () =>
      import('@fde-desktop/ink/Integration/InkChatApp').then(m => ({ default: m.InkChatApp })),
    menuBarLoader: () =>
      import('@fde-desktop/ink/Integration/InkChatAppMenuBar').then(m => ({
        default: m.InkChatAppMenuBar,
      })),
    isLazy: true,
  },
  'sun-study': {
    loader: () =>
      import('@fde-desktop/cities/Presentation/Components/SunStudyApp').then(m => ({
        default: m.SunStudyApp,
      })),
    isLazy: true,
  },
  'filter-panel': {
    loader: () =>
      import('@fde-desktop/cities/Presentation/Apps/FilterPanel').then(m => ({
        default: m.FilterPanelApp,
      })),
    isLazy: true,
  },
  hvac: {
    loader: () =>
      import('@fde-desktop/hvac/Presentation/Components/HvacApp').then(m => ({
        default: m.HvacApp,
      })),
    isLazy: true,
  },
  'hvac-theatre': {
    loader: () =>
      import('@fde-desktop/hvac/Presentation/Components/HvacTheatreApp').then(m => ({
        default: m.HvacTheatreApp,
      })),
    isLazy: true,
  },
};

export type { AppRegistryEntry, AppComponent, AppEntry };
