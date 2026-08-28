// Mock utilities for framer-motion testing
import { vi } from 'vitest';

export const useAnimationControls = () => ({
  start: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn(),
  set: vi.fn(),
});

export const MOTION_PROPS = new Set([
  'variants',
  'initial',
  'animate',
  'exit',
  'layout',
  'layoutId',
  'transition',
  'whileHover',
  'whileTap',
  'whileFocus',
  'whileInView',
  'whileDrag',
  'viewport',
  'drag',
  'dragConstraints',
  'dragElastic',
  'onAnimationComplete',
  'onHoverStart',
  'onHoverEnd',
  'onDragStart',
  'onDragEnd',
  'onDrag',
  'transformTemplate',
  'custom',
  'inherit',
]);
