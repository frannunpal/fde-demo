import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { resolve, join } from 'path';

const PUBLIC_DIR = resolve(__dirname);
const MANIFEST_PATH = join(PUBLIC_DIR, 'fs-manifest.json');

interface ManifestFile {
  name: string;
  folder: string;
  mimeType: string;
  url: string;
}

interface Manifest {
  sha: string;
  folders: string[];
  files: ManifestFile[];
}

const manifest: Manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));

function collectFiles(dir: string, base: string): string[] {
  const result: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = join(base, entry.name);
    if (entry.isDirectory()) {
      result.push(...collectFiles(join(dir, entry.name), rel));
    } else {
      result.push(rel);
    }
  }
  return result;
}

describe('fs-manifest.json', () => {
  describe('manifest integrity', () => {
    it('should be valid JSON with required fields', () => {
      expect(manifest).toHaveProperty('folders');
      expect(manifest).toHaveProperty('files');
      expect(Array.isArray(manifest.folders)).toBe(true);
      expect(Array.isArray(manifest.files)).toBe(true);
    });

    it('every file entry should have name, folder, mimeType and url', () => {
      for (const file of manifest.files) {
        expect(file.name, `missing name in entry`).toBeTruthy();
        expect(file.folder, `missing folder in ${file.name}`).toBeTruthy();
        expect(file.mimeType, `missing mimeType in ${file.name}`).toBeTruthy();
        expect(file.url, `missing url in ${file.name}`).toBeTruthy();
      }
    });

    it('url values should be unique', () => {
      const urls = manifest.files.map(f => f.url);
      const unique = new Set(urls);
      expect(unique.size).toBe(urls.length);
    });
  });

  describe('public/ files match manifest', () => {
    it('every file listed in the manifest should exist in public/', () => {
      const missing: string[] = [];
      for (const file of manifest.files) {
        const absPath = join(PUBLIC_DIR, file.url);
        if (!existsSync(absPath)) {
          missing.push(file.url);
        }
      }
      expect(missing, `Missing files in public/:\n${missing.join('\n')}`).toHaveLength(0);
    });

    it('every file in public/Documents/ should be listed in the manifest', () => {
      const documentsDir = join(PUBLIC_DIR, 'Documents');
      const presentFiles = collectFiles(documentsDir, 'Documents');
      const manifestUrls = new Set(
        manifest.files.filter(f => f.url.startsWith('Documents/')).map(f => f.url),
      );

      const excludedPrefixes = ['Documents/cities/'];
      const unlisted = presentFiles.filter(
        rel => !manifestUrls.has(rel) && !excludedPrefixes.some(prefix => rel.startsWith(prefix)),
      );
      expect(
        unlisted,
        `Files present in public/Documents/ but missing from manifest:\n${unlisted.join('\n')}`,
      ).toHaveLength(0);
    });
  });

  describe('Documents/ subdirectory coverage', () => {
    it('should include entries from Documents/docker/ subdirectory', () => {
      const dockerEntries = manifest.files.filter(f => f.folder === 'Documents/docker');
      expect(dockerEntries.length).toBeGreaterThan(0);
    });

    it('should include entries from Documents/testing/ subdirectory', () => {
      const testingEntries = manifest.files.filter(f => f.folder === 'Documents/testing');
      expect(testingEntries.length).toBeGreaterThan(0);
    });

    it('each file in public/Documents/docker/ should be in manifest', () => {
      const dockerDir = join(PUBLIC_DIR, 'Documents', 'docker');
      if (!existsSync(dockerDir)) return;
      for (const entry of readdirSync(dockerDir, { withFileTypes: true })) {
        if (!entry.isFile()) continue;
        const url = `Documents/docker/${entry.name}`;
        const found = manifest.files.some(f => f.url === url);
        expect(found, `${url} exists in public/ but is missing from manifest`).toBe(true);
      }
    });

    it('each file in public/Documents/testing/ should be in manifest', () => {
      const testingDir = join(PUBLIC_DIR, 'Documents', 'testing');
      if (!existsSync(testingDir)) return;
      for (const entry of readdirSync(testingDir, { withFileTypes: true })) {
        if (!entry.isFile()) continue;
        const url = `Documents/testing/${entry.name}`;
        const found = manifest.files.some(f => f.url === url);
        expect(found, `${url} exists in public/ but is missing from manifest`).toBe(true);
      }
    });
  });
});
