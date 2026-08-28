// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect } from 'vitest';

describe('AppRegistry', () => {
  it('should export userApps object', async () => {
    const { userApps } = await import('./AppRegistry');
    expect(userApps).toBeDefined();
    expect(userApps.welcome).toBeDefined();
    expect(userApps.linkedin).toBeDefined();
    expect(userApps.github).toBeDefined();
  });

  it('should have correct app names for user apps', async () => {
    const { userAppEntries } = await import('./AppRegistry');
    const find = (id: string) => userAppEntries.find(e => e.id === id);
    expect(find('welcome')?.name).toBe('Welcome');
    expect(find('linkedin')?.name).toBe('LinkedIn');
    expect(find('github')?.name).toBe('GitHub');
  });

  it('should include terminal and code-server as consumer-provided apps', async () => {
    const { userApps, userAppEntries } = await import('./AppRegistry');
    expect(userApps.terminal).toBeDefined();
    expect(userApps['code-server']).toBeDefined();
    const find = (id: string) => userAppEntries.find(e => e.id === id);
    expect(find('terminal')?.name).toBe('Terminal');
    expect(find('code-server')?.name).toBe('VS Code');
  });

  it('should export userApps types', async () => {
    const { userApps, userAppEntries } = await import('./AppRegistry');
    const welcome = userApps.welcome;
    expect(welcome?.component ?? welcome?.loader).toBeDefined();
    const welcomeEntry = userAppEntries.find(e => e.id === 'welcome');
    expect(welcomeEntry).toHaveProperty('name');
  });

  it('should export userAppEntries with manifests for all consumer apps', async () => {
    const { userAppEntries } = await import('./AppRegistry');
    expect(userAppEntries).toBeDefined();
    expect(Array.isArray(userAppEntries)).toBe(true);
    const ids = userAppEntries.map(e => e.id);
    expect(ids).toContain('welcome');
    expect(ids).toContain('linkedin');
    expect(ids).toContain('github');
    expect(ids).toContain('terminal');
    expect(ids).toContain('code-server');
  });
});
