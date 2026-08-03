import { lazy, Suspense } from 'react';
import { userApps, userAppEntries } from '@presentation/Components/Window/AppRegistry';
import defaultWallpaper from '/Images/wallpaper.jpg';

const FdeDesktop = lazy(() =>
  import('@fde-desktop/fde-core').then(m => {
    // Register desktop apps when the core module loads
    m.registerDesktopApps([
      'welcome',
      'terminal',
      'code-server',
      'storybook',
      'linkedin',
      'github',
      'doom',
      'cities',
      'sun-study',
    ]);
    return { default: m.FdeDesktop };
  }),
);

function App() {
  return (
    <Suspense fallback={null}>
      <FdeDesktop
        customApps={userApps}
        appEntries={userAppEntries}
        defaultWallpaper={defaultWallpaper}
      />
    </Suspense>
  );
}

export default App;
