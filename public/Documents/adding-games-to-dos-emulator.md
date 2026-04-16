# Adding Games to the DOS Emulator

This guide explains how to add new games to the DOS emulator in fde-desktop.

## Overview

fde-desktop uses [js-dos](https://js-dos.com/overview.html) to run DOS games directly in the browser. Games are packaged as `.jsdos` bundles and can be launched through the Files app or desktop icons.

## Adding a New Game

### Step 1: Obtain a `.jsdos` Bundle

There are two ways to get a `.jsdos` bundle:

#### Option A: Use js-dos Bundles

The easiest way is to download pre-made bundles from the js-dos community:

1. Visit [js-dos.com](https://js-dos.com/overview.html)
2. Browse available games or use the DOS Zone player
3. Download the `.jsdos` bundle

#### Option B: Create Your Own Bundle

You can package your own DOS games:

1. Install the js-dos bundler following the [official documentation](https://js-dos.com/overview.html)
2. Prepare your game files (executables, data files, etc.)
3. Create a `game.jsdos` bundle using the bundler

### Step 2: Add the Bundle to the Project

Place your `.jsdos` file in the `public/Games/` directory:

```
public/
├── Games/
│   ├── doom.jsdos      # Existing game
│   └── your-game.jsdos # Your new game
```

### Step 3: Register in the File System Manifest

Edit `public/fs-manifest.json` to include the game:

```json
{
  "folders": ["Desktop", "Documents", "Images", "Games"],
  "files": [
    // ... existing files ...
    {
      "name": "your-game.jsdos",
      "folder": "Games",
      "mimeType": "application/jsdos",
      "url": "Games/your-game.jsdos"
    }
  ]
}
```

This makes the game visible in the Files app.

### Step 4: Register File Handler (Automatic)

The DOS emulator automatically handles `.jsdos` files. When a user double-clicks a `.jsdos` file in the Files app, it opens in the DOS emulator.

This is configured in `src/Shared/Utils/getAppIdForMime.ts`:

```typescript
registerAppFileHandler({
  appId: 'dos-emulator',
  mimeTypes: ['application/jsdos', 'application/zip', 'application/x-zip-compressed'],
  transformContentData: node => ({
    autoLoad: { url: node.url ?? node.name, name: node.name },
  }),
});
```

### Step 5: Add a Desktop Icon (Optional)

To add a desktop icon for quick access, add the app entry to `packages/core/src/constants/extraApps.ts` (for bundled apps) or directly in `src/Presentation/Components/Window/AppRegistry.tsx` (for example app):

```typescript
// In extraApps.ts or AppRegistry.tsx
{
  id: 'your-game',
  name: 'Your Game',
  icon: '🎮',
  fcIcon: 'FcGamepad',
  autoLoad: { url: `${import.meta.env.BASE_URL}Games/your-game.jsdos`, name: 'Your Game' },
},
```

The `autoLoad` configuration tells the DOS emulator to automatically load the bundle when the app opens.

## How It Works

### Bundle Loading Flow

1. **From Desktop Icon**: User clicks icon → `autoLoad` config passed to `DosEmulatorApp` → `useJsDos` hook loads bundle
2. **From Files App**: User double-clicks `.jsdos` file → `getAppIdForMime` returns `'dos-emulator'` with `autoLoad` → app opens and loads bundle

### The `autoLoad` Property

```typescript
interface DosEmulatorAutoLoad {
  url: string; // URL to the .jsdos bundle
  name?: string; // Display name (optional)
}
```

When `autoLoad` is provided:

- The header shows only game controls (Play/Pause, Restart, Volume)
- The "Open Bundle" button is hidden
- The bundle loads automatically on mount

### Supported MIME Types

The DOS emulator handles these file types:

| MIME Type                      | Description                     |
| ------------------------------ | ------------------------------- |
| `application/jsdos`            | Native js-dos bundle format     |
| `application/zip`              | ZIP archives (can be DOS games) |
| `application/x-zip-compressed` | Alternative ZIP MIME type       |

## Example: Adding a Custom Game

Let's add "SimCity 2000" as an example:

1. **Place the bundle**:

   ```bash
   cp simcity2000.jsdos public/Games/
   ```

2. **Update fs-manifest.json**:

   ```json
   {
     "name": "SimCity2000.jsdos",
     "folder": "Games",
     "mimeType": "application/jsdos",
     "url": "Games/simcity2000.jsdos"
   }
   ```

3. **Register in AppRegistry** (if adding a desktop icon with auto-load):

   ```typescript
   // src/Presentation/Components/Window/AppRegistry.tsx
   'simcity2000': {
     loader: () => import('@presentation/Components/Apps/DosEmulatorApp/DosEmulatorApp'),
     isLazy: true,
     appName: 'SimCity 2000',
     // autoLoad is passed via contentData when opening the app, or via AppEntry in extraApps.ts
   },
   ```

## Troubleshooting

### Game Doesn't Load

1. **Check bundle URL**: Ensure the file exists in `public/Games/` and the URL in `fs-manifest.json` matches
2. **Check MIME type**: Must be `application/jsdos` or a ZIP variant
3. **Check console errors**: Open browser DevTools for error messages
4. **Verify bundle integrity**: Download from a trusted source or recreate using js-dos bundler

### Performance Issues

- Large `.jsdos` bundles take time to download and extract
- Consider hosting large games externally and linking via URL
- The browser caches loaded bundles, so subsequent loads are faster

### Audio Problems

js-dos handles audio automatically, but some games may require:

- User interaction before audio can play (browser autoplay policy)
- Specific DOSBox configuration in the bundle

## Resources

- [js-dos Documentation](https://js-dos.com/overview.html) - Official documentation
- [js-dos GitHub](https://github.com/nickelcat/js-dos) - Source code and issues
- [DOSBox Wiki](https://www.dosbox.com/wiki/) - DOSBox configuration reference

## See Also

- [how-to-create-an-app.md](./how-to-create-an-app.md) - Creating general applications
- [architecture.md](./architecture.md) - System architecture overview
