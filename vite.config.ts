import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  copyFileSync,
  mkdirSync,
} from "fs";
import { createHash } from "crypto";

const __dirname = import.meta.dirname;

const pkg = JSON.parse(
  readFileSync(resolve(__dirname, "package.json"), "utf-8"),
) as {
  version: string;
};

function manifestShaPlugin() {
  return {
    name: "manifest-sha",
    writeBundle() {
      const manifestPath = resolve(__dirname, "dist", "fs-manifest.json");
      if (!existsSync(manifestPath)) return;

      const manifestContent = readFileSync(manifestPath, "utf-8");
      const manifest = JSON.parse(manifestContent);

      const contentToHash = JSON.stringify({
        folders: manifest.folders,
        files: manifest.files.map(
          (f: {
            name: string;
            folder: string;
            mimeType: string;
            url: string;
          }) => ({
            name: f.name,
            folder: f.folder,
          }),
        ),
      });
      const sha = createHash("sha256")
        .update(contentToHash)
        .digest("hex")
        .slice(0, 8);

      manifest.sha = sha;
      writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    },
  };
}

function copyDocsPlugin() {
  return {
    name: "copy-docs",
    writeBundle() {
      const docsDir = resolve(__dirname, "docs");
      const destDir = resolve(__dirname, "dist", "Documents");

      function copyMdRecursive(srcDir: string, destSubDir: string) {
        if (!existsSync(destSubDir)) {
          mkdirSync(destSubDir, { recursive: true });
        }
        const entries = readdirSync(srcDir, { withFileTypes: true });
        for (const entry of entries) {
          const srcPath = resolve(srcDir, entry.name);
          const destPath = resolve(destSubDir, entry.name);
          if (entry.isDirectory()) {
            copyMdRecursive(srcPath, destPath);
          } else if (entry.isFile() && entry.name.endsWith(".md")) {
            copyFileSync(srcPath, destPath);
          }
        }
      }

      copyMdRecursive(docsDir, destDir);

      // Copy README.md and wallpaper-open.png to dist root for GitHub Pages
      const distRoot = resolve(__dirname, "dist");
      const readmeSrc = resolve(__dirname, "README.md");
      const readmeDest = resolve(distRoot, "README.md");
      const wallpaperSrc = resolve(__dirname, "wallpaper-open.png");
      const wallpaperDest = resolve(distRoot, "wallpaper-open.png");
      const dockerComposeSrc = resolve(__dirname, "docker-compose.ghcr.yml");
      const dockerComposeDest = resolve(distRoot, "docker-compose.yml");

      if (existsSync(readmeSrc)) {
        copyFileSync(readmeSrc, readmeDest);
      }
      if (existsSync(wallpaperSrc)) {
        copyFileSync(wallpaperSrc, wallpaperDest);
      }
      if (existsSync(dockerComposeSrc)) {
        copyFileSync(dockerComposeSrc, dockerComposeDest);
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  root: "src",
  plugins: [react(), manifestShaPlugin(), copyDocsPlugin()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  // Serve dist-apps as static files in development
  publicDir: "../public",
  server: {
    // In Docker, Vite runs on port 3000 (nginx proxies from 5173)
    // In local dev/test, Vite runs directly on port 5173
    port: process.env.IN_DOCKER === "true" ? 3000 : 5173,
    host: true,
    fs: {
      // Allow serving files from dist-apps
      allow: [".."],
    },
    // Ignore dist-apps and apps/ from Vite's HMR — apps-builder handles those independently
    watch: {
      ignored: ["**/dist-apps/**", "**/apps/**"],
    },
    // In Docker, client connects to nginx port 5173, not internal Vite port 3000
    hmr:
      process.env.IN_DOCKER === "true"
        ? {
            clientPort: 5173,
            protocol: "ws",
          }
        : undefined,
  },
  // Configure static file serving for dist-apps
  preview: {
    // In preview mode, serve dist-apps from dist directory
  },
  build: {
    rollupOptions: {
      output: {
        sourcemap: false,
        manualChunks(id) {
          // ═══════════════════════════════════════════════════════════════════
          // VENDOR CHUNKS - Check these FIRST before app-specific chunks
          // ═══════════════════════════════════════════════════════════════════

          // xterm is large (~300KB), used only in Docker Terminal app
          if (id.includes("@xterm/") || id.includes("xterm.css")) {
            return "xterm";
          }

          // Icons - loaded on demand across the app
          if (id.includes("react-icons/vsc")) {
            return "icons-vsc";
          }
          if (id.includes("react-icons/fc")) {
            return "icons-fc";
          }
          if (id.includes("react-icons/fi")) {
            return "icons-fi";
          }

          // Core dependencies
          if (
            id.includes("@mantine/core") ||
            id.includes("@mantine/hooks") ||
            id.includes("@mantine/dates")
          ) {
            return "mantine";
          }
          if (id.includes("framer-motion")) {
            return "motion";
          }

          // Editor
          if (id.includes("@tiptap")) {
            return "tiptap";
          }

          // ═══════════════════════════════════════════════════════════════════
          // APP CHUNKS - Check these AFTER vendor chunks
          // ═══════════════════════════════════════════════════════════════════

          if (id.includes("/Apps/NotesApp/")) {
            return "app-notepad";
          }
          if (id.includes("/Apps/MenuEditApp/")) {
            return "app-menuedit";
          }
          if (id.includes("/Apps/CalendarApp/")) {
            return "app-calendar";
          }
          if (id.includes("/Apps/DosEmulatorApp/")) {
            return "app-dos";
          }
          if (id.includes("/Apps/DeviceInfoApp/")) {
            return "app-device-info";
          }
          if (id.includes("/Apps/StorybookApp/")) {
            return "app-storybook";
          }
          if (id.includes("/Apps/TerminalApp/")) {
            return "app-terminal";
          }
          if (id.includes("/Apps/LinkekinApp/")) {
            return "ExternalLinkApp";
          }
          if (id.includes("/Apps/GithubApp/")) {
            return "ExternalLinkApp";
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@domain": resolve(__dirname, "src/Domain"),
      "@application": resolve(__dirname, "src/Application"),
      "@infrastructure": resolve(__dirname, "src/Infrastructure"),
      "@presentation": resolve(__dirname, "src/Presentation"),
      "@shared": resolve(__dirname, "src/Shared"),
      "@public": resolve(__dirname, "public"),
    },
  },
});
