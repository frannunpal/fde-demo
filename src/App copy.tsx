import { FdeDesktop, registerDesktopApps } from '@fde-desktop/fde-core';
import { userApps, userAppEntries } from '@presentation/Components/Window/AppRegistry';
import defaultWallpaper from '/Images/wallpaper.jpg';

// Register the desktop icon order for fran-desktop specific apps
registerDesktopApps([
  'welcome',
  'terminal',
  'code-server',
  'storybook',
  'linkedin',
  'github',
  'doom',
]);

function App() {
  return (
    <FdeDesktop
      customApps={userApps}
      appEntries={userAppEntries}
      defaultWallpaper={defaultWallpaper}
      initialApp="welcome"
      prefetchLoaders={[
        {
          id: 'dos-emulator',
          loader: () => import('@presentation/Components/Apps/DosEmulatorApp/DosEmulatorApp'),
        },
      ]}
    />
  );
}

export default App;
