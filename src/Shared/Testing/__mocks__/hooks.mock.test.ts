import { describe, it, expect } from 'vitest';
import { mockUseNotifications, createAppNameMock, createOpenAppMock } from './hooks.mock';

describe('hooks.mock utilities', () => {
  describe('mockUseNotifications', () => {
    it('should return mock notification functions', () => {
      const mock = mockUseNotifications();

      expect(mock.notify).toBeDefined();
      expect(typeof mock.notify).toBe('function');
      expect(mock.notifications).toEqual([]);
      expect(mock.dismiss).toBeDefined();
      expect(mock.addNotification).toBeDefined();
      expect(mock.removeNotification).toBeDefined();
    });

    it('should return different mock functions each call', () => {
      const mock1 = mockUseNotifications();
      const mock2 = mockUseNotifications();

      expect(mock1.notify).not.toBe(mock2.notify);
    });
  });

  describe('createAppNameMock', () => {
    it('should return app name for known app', () => {
      const useAppName = createAppNameMock();

      expect(useAppName('notepad')).toBe('Notepad');
      expect(useAppName('files')).toBe('Files');
      expect(useAppName('settings')).toBe('Settings');
    });

    it('should return appId for unknown app', () => {
      const useAppName = createAppNameMock();

      expect(useAppName('unknown-app')).toBe('unknown-app');
    });

    it('should return empty string for undefined', () => {
      const useAppName = createAppNameMock();

      expect(useAppName(undefined)).toBe('');
    });

    it('should merge custom names with defaults', () => {
      const useAppName = createAppNameMock({ 'custom-app': 'Custom App' });

      expect(useAppName('custom-app')).toBe('Custom App');
      expect(useAppName('notepad')).toBe('Notepad');
    });

    it('should override default names with custom', () => {
      const useAppName = createAppNameMock({ notepad: 'Custom Notepad' });

      expect(useAppName('notepad')).toBe('Custom Notepad');
    });
  });

  describe('createOpenAppMock', () => {
    it('should return a mock function', () => {
      const mock = createOpenAppMock();

      expect(mock).toBeDefined();
      expect(typeof mock).toBe('function');
    });

    it('should return different mock each call', () => {
      const mock1 = createOpenAppMock();
      const mock2 = createOpenAppMock();

      expect(mock1).not.toBe(mock2);
    });
  });
});
