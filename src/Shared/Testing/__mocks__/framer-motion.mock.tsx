/* eslint-disable react-refresh/only-export-components */
import { createElement, type ReactNode, type ElementType } from 'react';
import { MOTION_PROPS } from './framer-motion-utils';

type MotionProps = { children?: ReactNode; [key: string]: unknown };

export const motion = new Proxy({} as Record<string, React.FC<MotionProps>>, {
  get: (_target, tag: string) => {
    return function MockMotionComponent({ children, ...props }: MotionProps) {
      const filteredProps: Record<string, unknown> = {};
      for (const key of Object.keys(props)) {
        if (!MOTION_PROPS.has(key)) {
          filteredProps[key] = props[key];
        }
      }
      return createElement(tag as ElementType, filteredProps, children);
    };
  },
});

export function AnimatePresence({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
