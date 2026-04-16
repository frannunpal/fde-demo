# fde-desktop Documentation

This directory contains comprehensive documentation for the fde-desktop project.

## Project Structure

This project has a **dual nature**:

- **`packages/core/`** — `@fde-desktop/fde-core`: Reusable NPM package with UI components, core apps, stores, hooks, and infrastructure
- **`src/`** — Example application that demonstrates how to use the library (WelcomeApp, LinkedIn, GitHub, DOS Emulator)

## Architecture & Guides

| Document                                     | Description                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------- |
| [architecture.md](./architecture.md)         | Complete architecture overview: layers, components, data flow, state management |
| [folder-structure.md](./folder-structure.md) | How the code is organized on disk (packages/core + src)                         |
| [server-api.md](./server-api.md)             | Server API reference (Docker mode)                                              |
| [hooks.md](./hooks.md)                       | Custom React hooks reference                                                    |
| [i18n.md](./i18n.md)                         | Internationalization setup and usage                                            |
| [runtime-flags.md](./runtime-flags.md)       | Runtime detection flags (`__FDE_IN_DOCKER__`, `__IS_DEV__`)                     |
| [npm-package.md](./npm-package.md)           | Using `@fde-desktop/fde-core` package in your own projects                      |

## npm Package

The `@fde-desktop/fde-core` package exports:

| Category       | What you get                                                                            |
| -------------- | --------------------------------------------------------------------------------------- |
| **Components** | FdeDesktop, Desktop, Window, Taskbar, Launcher, AppMenuBar, ContextMenu, and more       |
| **Apps**       | 11 built-in core apps (Files, Settings, Notepad, PDF, Image Viewer, Terminal, VS Code…) |
| **Stores**     | Zustand stores: desktop state, settings, custom apps, temp memory                       |
| **Hooks**      | 30+ hooks for opening apps, notifications, icons, file system, etc.                     |
| **Domain**     | Entity factories: `createWindow`, `createDesktopIcon`, etc.                             |
| **Types**      | Full TypeScript types for everything                                                    |
| **Utils**      | UUID, formatBytes, runtime detection, MIME helpers, breadcrumbs…                        |
| **Constants**  | Layout, theme colors, animation variants, font stacks…                                  |
| **i18n**       | Pre-configured react-i18next instance (en + es)                                         |
| **Infra**      | `IndexedDBFileSystem`, `DockerFileSystemAdapter`, `FdeApiAdapter`                       |

| Document                                           | Description                                  |
| -------------------------------------------------- | -------------------------------------------- |
| [npm/README.md](./npm/README.md)                   | Package overview                             |
| [npm/getting-started.md](./npm/getting-started.md) | Full tutorial: build a desktop app from zero |
| [npm/api-reference.md](./npm/api-reference.md)     | Complete reference for all exported symbols  |

## Example App

The `src/` directory contains an example application showing:

- **WelcomeApp**: Personal portfolio/profile app
- **LinkedinApp** / **GithubApp**: External link apps
- **DosEmulatorApp**: DOS game emulator using js-dos
- **AppRegistry**: How to register custom apps with `FdeDesktop`

## Docker & Deployment

| Document                                                   | Description                                                |
| ---------------------------------------------------------- | ---------------------------------------------------------- |
| [docker/README.md](./docker/README.md)                     | Quick start, profiles, environment variables               |
| [docker/architecture.md](./docker/architecture.md)         | Multi-stage builds, runtime detection, hybrid architecture |
| [docker/development.md](./docker/development.md)           | Development workflow with Docker                           |
| [docker/production.md](./docker/production.md)             | Production deployment (supervisord hybrid)                 |
| [docker/apps-development.md](./docker/apps-development.md) | Developing user apps in production                         |
| [docker/troubleshooting.md](./docker/troubleshooting.md)   | Common Docker issues and solutions                         |
| [docker/testing.md](./docker/testing.md)                   | Docker integration testing guide                           |

## Testing

| Document                                   | Description                                              |
| ------------------------------------------ | -------------------------------------------------------- |
| [testing/testing.md](./testing/testing.md) | Unit testing guide with Vitest and React Testing Library |
| [testing/README.md](../tests/README.md)    | E2E, visual, and Docker test overview                    |

## App Development

| Document                                                                                             | Description                                               |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| [custom-apps.md](./custom-apps.md)                                                                   | How to create standalone apps that run inside fde-desktop |
| [how-to-create-an-app.md](./how-to-create-an-app.md)                                                 | Step-by-step guide to create built-in apps                |
| [how-to-add-menubar-and-file-picker-to-an-app.md](./how-to-add-menubar-and-file-picker-to-an-app.md) | Adding menu bars and file pickers to apps                 |
| [terminal-app.md](./terminal-app.md)                                                                 | Terminal app architecture (xterm.js + WebSocket PTY)      |
| [adding-games-to-dos-emulator.md](./adding-games-to-dos-emulator.md)                                 | Adding DOS games to the emulator                          |

## Quick Start

1. **Using the package**: Start with `npm install @fde-desktop/fde-core` and see [npm/getting-started.md](./npm/getting-started.md)
2. **Understanding the architecture**: See [architecture.md](./architecture.md)
3. **Running in Docker**: See [docker/README.md](./docker/README.md)
4. **Creating an app**: Follow [how-to-create-an-app.md](./how-to-create-an-app.md)

## Key Concepts

### Hexagonal Architecture

The core library follows Ports & Adapters:

```
Domain (entities)
    ↓
Application (ports/interfaces)
    ↓
Infrastructure (adapters)
    ↓
Presentation (React components)
```

### Runtime Detection

The framework detects where it's running:

- **Browser**: Standard web browser (IndexedDB filesystem)
- **Docker**: Container environment (API filesystem)
- **Electron**: Desktop app (Node.js filesystem)

### State Management

Multiple Zustand stores with persistence:

- `desktopStore`: Windows, icons, clipboard
- `settingsStore`: User preferences, theme, fonts
- `closeModalStore`: Close confirmation dialogs

### Internationalization

Supported languages:

- English (en) - default
- Spanish (es)

See [i18n.md](./i18n.md) for translation guidelines.
