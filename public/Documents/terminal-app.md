# Terminal App

A fully interactive terminal emulator that runs inside fde-desktop. Uses xterm.js for the frontend and connects to a WebSocket-based PTY backend when running in Docker mode.

## Overview

The Terminal app provides a real shell experience inside the desktop environment. It's only available in Docker mode—the app shows a "not supported" message when running in browser or Electron mode.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Terminal Architecture                         │
│                                                                  │
│  Docker Mode:                                                    │
│  ┌─────────────────┐     WebSocket      ┌─────────────────┐    │
│  │  XTermTerminal  │ ──────────────────▶│  /api/pty       │    │
│  │  (xterm.js)     │     input/output   │  (Bun server)    │    │
│  │                 │◀────────────────── │  (PTY bridge)   │    │
│  └─────────────────┘                   └─────────────────┘    │
│         │                                       │               │
│         │ window-scoped state                   │               │
│         ▼                                       ▼               │
│  ┌─────────────────┐                   ┌─────────────────┐    │
│  │  terminalStore  │                   │  /bin/zsh       │    │
│  │  (scrollback,   │                   │  /bin/sh        │    │
│  │   shell)        │                   │  (real shell)   │    │
│  └─────────────────┘                   └─────────────────┘    │
│                                                                  │
│  Browser/Electron Mode:                                          │
│  ┌─────────────────┐                                             │
│  │ TerminalNotSupported │                                         │
│  │  (placeholder)  │                                             │
│  └─────────────────┘                                             │
└─────────────────────────────────────────────────────────────────┘
```

## Files

| File                       | Purpose                                |
| -------------------------- | -------------------------------------- |
| `TerminalApp.tsx`          | Main component, checks runtime         |
| `XTermTerminal.tsx`        | xterm.js wrapper, WebSocket connection |
| `TerminalMenuBar.tsx`      | Menu bar component                     |
| `useTerminalMenuBar.ts`    | Menu elements hook with actions        |
| `terminalStore.ts`         | Zustand store for window-scoped state  |
| `TerminalNotSupported.tsx` | Fallback for non-Docker environments   |
| `Terminal.module.css`      | Styles for terminal container          |

## Runtime Detection

The app uses `getRuntime()` to check the environment:

```typescript
const runtime = getRuntime(); // 'browser' | 'docker' | 'electron'

if (runtime !== 'docker') {
  return <TerminalNotSupported />;
}
```

## WebSocket Protocol

The terminal connects to `/api/pty` with a simple JSON protocol:

### Client → Server Messages

| Type     | Fields                         | Description             |
| -------- | ------------------------------ | ----------------------- |
| `start`  | `shell`, `cwd`, `cols`, `rows` | Start a new PTY session |
| `input`  | `data`                         | User keystrokes         |
| `resize` | `cols`, `rows`                 | Terminal resize         |
| `kill`   | _(none)_                       | Kill the PTY session    |

### Server → Client Messages

| Type      | Fields      | Description                |
| --------- | ----------- | -------------------------- |
| `ready`   | _(none)_    | Server ready for `start`   |
| `started` | _(none)_    | PTY started successfully   |
| `exit`    | `code`      | PTY exited with code       |
| `error`   | `message`   | Error message              |
| _(raw)_   | string data | Terminal output (non-JSON) |

## Connection Flow

```
1. Component mounts
   ├── Create Terminal instance (xterm.js)
   ├── Load FitAddon
   └── WebSocket connects to /api/pty

2. Connection established
   ├── Server sends { type: 'ready' }
   ├── Client sends { type: 'start', shell, cwd, cols, rows }
   └── Server sends { type: 'started' }

3. Interactive session
   ├── User types → onData → { type: 'input', data }
   ├── Server output → onmessage → terminal.write()
   └── Window resize → onResize → { type: 'resize', cols, rows }

4. Cleanup (unmount)
   ├── Send { type: 'kill' }
   ├── Close WebSocket
   └── Dispose terminal
```

## Shell Selection

The app fetches available shells from `/api/shell`:

```typescript
interface ShellInfo {
  default: string; // e.g., '/bin/zsh'
  available: string[]; // e.g., ['/bin/sh', '/bin/zsh']
}
```

Users can switch shells via the menu bar. The selection persists per window in `terminalStore`.

## Window-Scoped State

Each terminal window has its own state:

```typescript
interface TerminalWindowState {
  scrollback: number; // Lines of scrollback buffer (default: 5000)
  shell: string; // Current shell path
}
```

The store manages state for multiple windows:

```typescript
const scrollback = useScrollback(windowId);
const shell = useShell(windowId);
const { setScrollback, setShell, reset } = useTerminalStore();
```

## Menu Bar Actions

| Action    | Description                             |
| --------- | --------------------------------------- |
| Copy      | Copy selected text to clipboard         |
| Paste     | Paste from clipboard                    |
| Clear     | Clear terminal screen                   |
| Reset     | Reset terminal to initial state         |
| Reconnect | Reconnect WebSocket (when disconnected) |
| Exit      | Close terminal window                   |

### Dynamic Menu Items

Menu items change based on connection status:

```typescript
// Only show reconnect when disconnected
if (!isConnected && reconnect) {
  menuItems.push({
    type: 'item',
    label: 'Reconnect',
    onClick: reconnect,
  });
}

// Disable actions when not connected
disabled: !isConnected;
```

## Retry Logic

The terminal attempts to reconnect automatically:

```typescript
const MAX_RETRIES = 5;
const BASE_RETRY_DELAY_MS = 1000;

// Exponential backoff: 1s, 2s, 4s, 8s, 16s
const delay = BASE_RETRY_DELAY_MS * Math.pow(2, retryCount - 1);
```

After exhausting retries, the user can manually reconnect via the menu bar or status bar button.

## Status Bar

The terminal shows a status bar with:

- Connection status indicator (colored dot)
- Status text (Idle, Connecting, Connected, Disconnected, Error)
- Reconnect button (when applicable)

```tsx
<div className={classes.statusBar}>
  <span className={classes.statusIndicator} data-status={status}>
    {status === 'connected' ? '●' : '○'}
  </span>
  <span className={classes.statusText}>{status}</span>
  {canReconnect && <button onClick={reconnect}>Reconnect</button>}
</div>
```

## API Reference

### TerminalApp Props

Extends `WindowContentProps`:

```typescript
interface WindowContentProps {
  window?: WindowEntity;
  notifyReady?: (contentData?: Record<string, unknown>) => void;
}
```

### TerminalActions (via notifyReady)

```typescript
interface TerminalActions {
  clear: () => void;
  reset: () => void;
  write: (data: string) => void;
  copy: () => void;
  paste: () => void;
  reconnect: () => void;
}
```

### XTermTerminal Props

```typescript
interface XTermTerminalProps {
  shell: string;
  scrollback: number;
  onTerminalReady?: (actions: TerminalActions) => void;
  onConnectionChange?: (status: ConnectionStatus) => void;
}
```

## i18n Keys

| Key                            | Description                   |
| ------------------------------ | ----------------------------- |
| `terminal.notAvailable`        | "Terminal not available"      |
| `terminal.notAvailableMessage` | Explanation text              |
| `terminal.dockerRequired`      | "Requires Docker environment" |
| `terminal.scrollback`          | "Scrollback"                  |
| `terminal.shell`               | "Shell"                       |
| `terminal.menu.copy`           | "Copy"                        |
| `terminal.menu.paste`          | "Paste"                       |
| `terminal.menu.clear`          | "Clear"                       |
| `terminal.menu.reset`          | "Reset"                       |
| `terminal.menu.reconnect`      | "Reconnect"                   |

## Testing

The terminal app includes tests for:

- Component rendering
- Runtime detection (Docker vs browser)
- Menu bar elements
- Store state management

See `TerminalApp.test.tsx`, `useTerminalMenuBar.test.ts`, and `terminalStore.test.ts`.

## Related Documentation

- [Docker Architecture](./docker/architecture.md) - PTY server implementation
- [Runtime Flags](./runtime-flags.md) - `__FDE_IN_DOCKER__` detection
- [How to Create an App](./how-to-create-an-app.md) - App registration patterns
