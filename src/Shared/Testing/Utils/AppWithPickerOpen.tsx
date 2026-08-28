import { useEffect, type ReactNode } from 'react';
import { Window } from '@fde-desktop/fde-core';
import { WindowButtonRegistryProvider } from '@fde-desktop/fde-core';
import { useDesktopStore } from '@fde-desktop/fde-core';
import type { WindowEntity } from '@fde-desktop/fde-core';
import type { FSNode } from '@fde-desktop/fde-core';

export interface AppWithPickerOpenProps {
  win: WindowEntity;
  fsNodes?: FSNode[];
  children?: ReactNode;
}

/**
 * Storybook wrapper that renders an app inside a fully-decorated Window
 * (title bar + window controls + menu bar via AppRegistry).
 * Seeds the store with the provided window and optional fs nodes.
 */
const AppWithPickerOpen = ({ win, fsNodes = [], children }: AppWithPickerOpenProps) => {
  useEffect(() => {
    useDesktopStore.setState({ windows: [win], fsNodes });
    return () => {
      useDesktopStore.setState({ windows: [], fsNodes: [] });
    };
  }, [win, fsNodes]);

  return (
    <WindowButtonRegistryProvider>
      <div style={{ position: 'relative', width: win.width, height: win.height }}>
        {children ?? <Window window={win} />}
      </div>
    </WindowButtonRegistryProvider>
  );
};

export default AppWithPickerOpen;
