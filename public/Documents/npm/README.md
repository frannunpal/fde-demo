# @fde-desktop/fde-core — npm Package Docs

`@fde-desktop/fde-core` is the core library extracted from fde-desktop. It gives you everything needed to build your own browser-based desktop environment: UI components, state management, domain entities, hooks, utilities, types, and a set of ready-to-use built-in apps.

**Published at:** https://www.npmjs.com/package/@fde-desktop/fde-core

## Contents

| Document                                   | Description                                  |
| ------------------------------------------ | -------------------------------------------- |
| [getting-started.md](./getting-started.md) | Full tutorial: build a desktop app from zero |
| [api-reference.md](./api-reference.md)     | Complete reference for all exports           |

## What's in the package

| Category       | What you get                                                                            |
| -------------- | --------------------------------------------------------------------------------------- |
| **Components** | FdeDesktop, Desktop, Window, Taskbar, Launcher, AppMenuBar, ContextMenu, and more       |
| **Apps**       | 11 built-in core apps (Files, Settings, Notepad, PDF, Image Viewer, Terminal, VS Code…) |
| **Stores**     | Zustand stores: desktop state, settings, custom apps, temp memory                       |
| **Hooks**      | 30+ hooks for opening apps, notifications, icons, file system, etc.                     |
| **Domain**     | Entity factories: `createWindow`, `createDesktopIcon`, `createLauncherFolder`           |
| **Types**      | Full TypeScript types for everything                                                    |
| **Utils**      | UUID, formatBytes, runtime detection, MIME helpers, breadcrumbs…                        |
| **Constants**  | Layout, theme colors, animation variants, font stacks…                                  |
| **i18n**       | Pre-configured react-i18next instance (en + es)                                         |
| **Infra**      | `IndexedDBFileSystem`, `DockerFileSystemAdapter`, `FdeApiAdapter`                       |

## Example App

The main repository's `src/` directory contains a complete example application that demonstrates all features:

- **WelcomeApp**: Personal portfolio/profile app
- **LinkedinApp** / **GithubApp**: External link apps
- **DosEmulatorApp**: DOS game emulator using js-dos
- Shows how to register custom apps with `FdeDesktop`

See the [main repository](https://github.com/frannunpal/fde-desktop) for the complete source code.

## Quick install

```bash
npm install @fde-desktop/fde-core
# peer deps
npm install react react-dom
```

Peer dependencies: `react ^19.0.0`, `react-dom ^19.0.0`

## Minimal Example

```tsx
import { FdeDesktop } from '@fde-desktop/fde-core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

function App() {
  return <FdeDesktop />;
}

export default App;
```

Core apps (Files, Settings, Notepad, etc.) are included automatically. Add custom apps via the `customApps` prop.
