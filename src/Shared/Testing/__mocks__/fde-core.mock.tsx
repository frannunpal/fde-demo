import { vi } from 'vitest';
import React from 'react';
import type { AppEntry, FSNode, DesktopIconEntity, AppMenuElement } from '@fde-desktop/fde-core';

// Create a mock Zustand-like store
const createMockStore = (initialState: Record<string, unknown>) => {
  let state = initialState;
  const listeners = new Set<() => void>();
  const store = <T,>(selector: (s: typeof state) => T): T => selector(state);
  store.getState = () => state;
  store.setState = (partial: Record<string, unknown> | ((s: typeof state) => typeof state)) => {
    const newState = typeof partial === 'function' ? partial(state) : { ...state, ...partial };
    state = newState;
    listeners.forEach(l => l());
  };
  store.subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  return store;
};

const mockDesktopStore = createMockStore({
  windows: [],
  icons: [],
  fsNodes: [],
  isFsReady: true,
  filesCurrentFolderId: null,
  desktopFolderId: null,
  contextMenu: { opened: false, nodeId: null, nodeName: '', owner: null, position: { x: 0, y: 0 } },
  notifications: [],
  launcherFolders: [],
  viewportSize: { width: 1920, height: 1080 },
  addNotification: vi.fn(),
  removeNotification: vi.fn(),
  openContextMenu: vi.fn(),
  closeContextMenu: vi.fn(),
  createLauncherFolder: vi.fn(),
});

const mockSettingsStore = createMockStore({
  theme: {
    mode: 'light',
    colors: { desktop: '#1a1a2e', taskbar: '#16213e', window: '#0f0f23', accent: '#339af0' },
    window: { borderRadius: '8px', headerHeight: 32, minWidth: 400 },
    taskbar: { height: 48 },
    desktop: { backgroundColor: '#1a1a2e' },
  },
  wallpaper: '/Images/wallpaper.jpg',
  launcherIcon: 'FcMenu',
  language: 'en',
  animationDuration: 0.3,
  toggleTheme: vi.fn(),
  setThemeMode: vi.fn(),
  setCustomThemeColors: vi.fn(),
});

const mockCustomAppStore = createMockStore({
  registeredApps: {},
  registerApp: vi.fn(),
  unregisterApp: vi.fn(),
});

const mockCloseModalStore = createMockStore({
  isOpen: false,
  windowId: null,
  onSave: null,
  onDiscard: null,
  openModal: vi.fn(),
  closeModal: vi.fn(),
});

interface DesktopProps {
  children?: React.ReactNode;
  wallpaper?: string;
  backgroundColor?: string;
  onContextMenu?: (e: React.MouseEvent) => void;
}

interface DesktopIconProps {
  icon: { id: string; name: string; appId?: string; nodeId?: string; x: number; y: number };
  onDoubleClick: (appId: string, nodeId?: string) => void;
  onContextMenu?: (e: React.MouseEvent, nodeId: string) => void;
}

interface FileIconProps {
  type: 'file' | 'folder';
  name?: string;
  size?: number;
}

vi.mock('@fde-desktop/fde-core', () => {
  return {
    useDesktopStore: mockDesktopStore,
    useSettingsStore: mockSettingsStore,
    useCustomAppStore: mockCustomAppStore,
    useCloseModalStore: mockCloseModalStore,
    fileSystem: {
      initialize: vi.fn(),
      readDir: vi.fn(async () => []),
      readFile: vi.fn(async () => ''),
      writeFile: vi.fn(async () => {}),
      deleteFile: vi.fn(async () => {}),
      createFolder: vi.fn(async () => {}),
      deleteFolder: vi.fn(async () => {}),
      stat: vi.fn(async () => null),
      exists: vi.fn(async () => false),
    },
    resetFileSystem: vi.fn(),
    resolveFileUrl: vi.fn((url: string) => url),
    Desktop: ({ children, onContextMenu }: DesktopProps) => (
      <div data-testid="desktop-area" onContextMenu={onContextMenu}>
        {children}
      </div>
    ),
    DesktopIcon: ({ icon, onDoubleClick, onContextMenu }: DesktopIconProps) => (
      <button
        role="button"
        aria-label={icon.name}
        data-testid={`desktop-icon-${icon.id}`}
        onDoubleClick={() => onDoubleClick(icon.appId ?? '', icon.nodeId)}
        onContextMenu={e => onContextMenu?.(e, icon.nodeId ?? '')}
      >
        {icon.name}
      </button>
    ),
    FileIcon: ({ type, name: _name }: FileIconProps) => (
      <svg data-testid={`file-icon-${type}`} aria-hidden="true" />
    ),
    Window: ({ window: _win }: { window: { id: string; title: string; content: string } }) => (
      <div data-testid={`window-${_win?.content || 'unknown'}`}>{_win?.title}</div>
    ),
    Taskbar: () => <div data-testid="taskbar" />,
    Launcher: () => <div data-testid="launcher" />,
    TaskbarContextMenu: () => null,
    AppMenuBar: () => null,
    CalendarAppComponent: () => <div data-testid="calendar" />,
    AppIcon: () => <svg data-testid="app-icon" />,
    VscIcon: () => <svg data-testid="vsc-icon" />,
    AppLoading: () => <div data-testid="app-loading" />,
    DirtyIndicator: () => <span data-testid="dirty" />,
    CollapsibleSection: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    LanguageFlag: () => <svg data-testid="language-flag" />,
    ContextMenuAnchor: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    LanguageSelector: () => <div data-testid="language-selector" />,
    DynamicMenuBarRenderer: () => null,
    FdeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useFdeContext: () => {
      throw new Error('useFdeContext must be used within an FdeProvider');
    },
    ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useTheme: () => ({
      mode: 'light',
      colors: { desktop: '#1a1a2e', taskbar: '#16213e', window: '#0f0f23', accent: '#339af0' },
      window: { borderRadius: '8px', headerHeight: 32, minWidth: 400 },
      taskbar: { height: 48 },
      desktop: { backgroundColor: '#1a1a2e' },
    }),
    useThemeContext: () => ({
      getTheme: () => ({
        mode: 'light',
        colors: { desktop: '#1a1a2e', taskbar: '#16213e', window: '#0f0f23', accent: '#339af0' },
        window: { borderRadius: '8px', headerHeight: 32, minWidth: 400 },
        taskbar: { height: 48 },
        desktop: { backgroundColor: '#1a1a2e' },
      }),
      setMode: vi.fn(),
      toggle: vi.fn(),
    }),
    DEFAULT_FDE_THEME: {
      light: {
        mode: 'light',
        colors: { desktop: '#1a1a2e', taskbar: '#16213e', window: '#0f0f23', accent: '#339af0' },
        window: { borderRadius: '8px', headerHeight: 32, minWidth: 400 },
        taskbar: { height: 48 },
        desktop: { backgroundColor: '#1a1a2e' },
      },
      dark: {
        mode: 'dark',
        colors: { desktop: '#0f0f23', taskbar: '#1a1a2e', window: '#16213e', accent: '#4dabf7' },
        window: { borderRadius: '8px', headerHeight: 32, minWidth: 400 },
        taskbar: { height: 48 },
        desktop: { backgroundColor: '#0f0f23' },
      },
    },
    APP_ID_TO_TRANSLATION_KEY: {
      notepad: 'apps.notepad',
      files: 'apps.files',
      settings: 'apps.settings',
      terminal: 'apps.terminal',
      calendar: 'apps.calendar',
      'image-viewer': 'apps.image-viewer',
      pdf: 'apps.pdf',
      'code-server': 'apps.code-server',
      'menu-edit': 'apps.menu-edit',
      'device-info': 'apps.device-info',
      uploader: 'apps.uploader',
      welcome: 'apps.welcome',
      storybook: 'apps.storybook',
      linkedin: 'apps.linkedin',
      github: 'apps.github',
      'dos-emulator': 'apps.dos-emulator',
      doom: 'apps.doom',
    },
    APP_IDS: [
      'notepad',
      'files',
      'settings',
      'terminal',
      'calendar',
      'image-viewer',
      'pdf',
      'code-server',
      'menu-edit',
      'device-info',
      'uploader',
      'welcome',
      'storybook',
      'linkedin',
      'github',
      'dos-emulator',
      'doom',
    ],
    APPS: [],
    CORE_APPS: [],
    CORE_APP_IDS: [],
    DEFAULT_WINDOW_DIMENSIONS: { width: 800, height: 600 },
    DESKTOP_APPS_ORDER: [],
    DESKTOP_APPS: [],
    ANIMATION_DURATION: 0.3,
    EASE_IN: { duration: 0.3, ease: 'easeIn' },
    EASE_OUT: { duration: 0.3, ease: 'easeOut' },
    windowVariants: {},
    panelVariants: {},
    minimizeVariant: () => ({}),
    restoreVariant: () => ({}),
    maximizeTransition: { duration: 0.25, ease: 'easeOut' },
    randomWindowPosition: () => ({ x: 150, y: 80 }),
    centerWindowPosition: (vw: number, vh: number, ww: number, wh: number) => ({
      x: Math.round((vw - ww) / 2),
      y: Math.round((vh - wh) / 2),
    }),
    TASKBAR_HEIGHT: 48,
    DEFAULT_VIEWPORT_WIDTH: 1920,
    DEFAULT_VIEWPORT_HEIGHT: 1080,
    ICON_COLUMN_WIDTH: 80,
    ICON_ROW_HEIGHT: 80,
    ICON_MARGIN: 20,
    BREAKPOINTS: { sm: 576, md: 768, lg: 992, xl: 1200 },
    CUSTOM_APPS_FOLDER_ID: 'launcher-folder-custom-apps',
    DEFAULT_LAUNCHER_FOLDERS: [],
    PREDEFINED_LAUNCHER_FOLDERS: [],
    AVAILABLE_FONTS: [],
    FONT_STACKS: {},
    GOOGLE_FONTS_HREF: {},
    PRESET_COLORS: [],
    DEFAULT_THEME_COLORS: {
      light: { desktop: '#1a1a2e', taskbar: '#16213e', window: '#0f0f23', accent: '#339af0' },
      dark: { desktop: '#0f0f23', taskbar: '#1a1a2e', window: '#16213e', accent: '#4dabf7' },
    },
    PRESET_ICONS: [],
    fetchAppManifest: async () => ({ apps: [] }),
    getCachedManifest: () => ({ apps: [] }),
    clearManifestCache: () => {},
    updateManifestCache: () => {},
    removeFromManifestCache: () => {},
    getCustomApps: () => [],
    getCustomAppById: () => undefined,
    isCustomApp: () => false,
    convertToAppEntry: () => ({}),
    mergeAppsWithCustomApps: (apps: AppEntry[]): AppEntry[] => apps,
    syncWithServer: async () => ({ added: [], removed: [] }),
    registerCustomApps: () => {},
    registerDesktopApps: () => {},
    isDocker: () => false,
    isBrowser: () => true,
    isElectron: () => false,
    isDev: () => false,
    getRuntime: () => 'browser',
    getBaseUrl: () => '/',
    resolveUrl: (url: string) => url,
    setTestBaseUrl: () => {},
    getAppIdForMime: () => null,
    registerAppFileHandler: () => {},
    IMAGE_MIME_TYPES: [],
    TEXT_MIME_TYPES: [],
    generateUUID: () => 'test-uuid',
    uuidv4: () => 'test-uuid',
    clearBrowserData: async () => {},
    formatBytes: (bytes: number) => `${bytes} B`,
    getFileExtension: (name: string) => name.split('.').pop() || '',
    getFourRandomColors: () => ['#ff0000', '#00ff00', '#0000ff', '#ffff00'],
    getMimeTypeFromExtension: () => 'application/octet-stream',
    hashBlob: async () => 'test-hash',
    isNewerVersion: () => false,
    sortNodes: (nodes: FSNode[]): FSNode[] => [...nodes],
    sortNodesByMode: (nodes: FSNode[]): FSNode[] => [...nodes],
    sortDesktopIcons: (icons: DesktopIconEntity[]): DesktopIconEntity[] => [...icons],
    sortDesktopIconsByMode: (icons: DesktopIconEntity[]): DesktopIconEntity[] => [...icons],
    buildBreadcrumbs: () => [],
    waitForContainer: async () => document.createElement('div'),
    getVersionString: () => '0.0.0-dev-browser',
    getEnvironment: () => 'dev',
    getReleaseType: () => 'web',
    DOS_BUNDLE_MIME_TYPES: ['application/zip', 'application/jsdos'],
    DOS_BUNDLE_EXTENSIONS: ['.jsdos', '.zip'],
    initializeFdeApi: vi.fn(),
    isFdeApiInitialized: vi.fn(() => false),
    getFdeApi: vi.fn(() => ({})),
    useFdeApi: vi.fn(() => ({})),
    useOpenApp: vi.fn(() => vi.fn()),
    useNotifications: vi.fn(() => ({
      notify: vi.fn(),
      dismiss: vi.fn(),
      addNotification: vi.fn(),
    })),
    useResolvedUrl: vi.fn((url: string | undefined) => url),
    useSystemTheme: vi.fn(),
    useDeviceDetection: vi.fn(() => ({ shouldShowWarning: false })),
    useAppName: vi.fn((appId: string) => appId),
    useFolderName: vi.fn((folder: { name: string }) => folder?.name ?? ''),
    useClock: vi.fn(() => '12:00'),
    useAnimationDuration: vi.fn(() => ({ windowVariants: {}, easeIn: {}, easeOut: {} })),
    useFcIconElement: vi.fn(() => null),
    useFiIconElement: vi.fn(() => null),
    useVscIconElement: vi.fn(() => null),
    useCollapsible: vi.fn(() => ({ isExpanded: false, toggle: vi.fn() })),
    useSearchFilter: vi.fn(() => ({ filteredItems: [], searchTerm: '' })),
    useTaskbarHeight: vi.fn(() => 48),
    useTaskbarContextMenu: vi.fn(() => ({
      position: { x: 0, y: 0 },
      targetWindowId: null,
      windowMenuOpened: false,
      panelMenuOpened: false,
      launcherMenuOpened: false,
      openWindowMenu: vi.fn(),
      openPanelMenu: vi.fn(),
      openLauncherMenu: vi.fn(),
      closeMenu: vi.fn(),
    })),
    WindowButtonRegistryProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useWindowButtonRegistry: vi.fn(() => ({
      register: vi.fn(),
      unregister: vi.fn(),
      getRect: vi.fn(() => null),
    })),
    useCloseInterceptor: vi.fn(() => vi.fn(() => true)),
    getCloseInterceptor: vi.fn(() => vi.fn(() => true)),
    AppReadyProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useAppReady: vi.fn(() => ({ notifyReady: vi.fn(), getContentData: vi.fn(() => undefined) })),
    initRegistry: vi.fn(),
    getAppComponent: vi.fn(() => null),
    getMenuBarBuilder: vi.fn(() => []),
    getMenuBarComponent: vi.fn(() => null),
    isLazyApp: vi.fn(() => false),
    getAppName: vi.fn(() => ''),
    registerComponents: vi.fn(),
    DownloadProgress: () => null,
    ExternalLinkApp: () => null,
    FilePickerApp: () => null,
    FolderPicker: () => null,
    IconColorPicker: () => null,
    ColorPicker: () => null,
    CreateItemApp: () => null,
    SettingsSection: () => null,
    AppEmptyState: () => null,
    useAppTempMemoryStore: createMockStore({}),
    migrateStorage: vi.fn(async () => {}),
    prefetchApps: vi.fn(),
    useCustomAppLifecycle: vi.fn(),
    useApplyFont: vi.fn(),
    useAppUpdate: vi.fn(),
    useLanguageSync: vi.fn(),
    useJsDos: vi.fn(() => ({ isReady: false, isLoading: false, error: null })),
    useFontDownload: vi.fn(() => ({ downloadedFonts: [] })),
    useIsDirty: vi.fn(() => false),
    useContextMenu: vi.fn(() => ({ position: null, close: vi.fn() })),
    useAdaptiveDimensions: vi.fn(() => ({ width: 800, height: 600 })),
    useDownload: vi.fn(() => ({ state: 'idle', progress: 0 })),
    useDynamicIcon: vi.fn(() => ({ icon: null })),
    appendDirtyIndicator: (items: AppMenuElement[], isDirty: boolean): AppMenuElement[] =>
      isDirty ? [...items, { type: 'dirty-indicator' }] : items,
    useCustomAppHMR: vi.fn(),
    checkHMREndpointExists: vi.fn(async () => true),
    resetHMRState: vi.fn(),
    injectFontLink: vi.fn(),
  };
});
