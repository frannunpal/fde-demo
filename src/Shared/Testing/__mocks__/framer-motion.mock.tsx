import type { ReactNode, HTMLAttributes, ElementType } from 'react';
import { MOTION_PROPS, useAnimationControls } from './framer-motion-utils';

type MotionProps = HTMLAttributes<HTMLElement> & { children?: ReactNode };

export const motion = new Proxy({} as Record<string, React.FC<MotionProps>>, {
  get: (_target, tag: string) => {
    return function MockMotionComponent({ children, ...props }: MotionProps) {
      const Tag = tag as ElementType;
      const domProps = Object.fromEntries(
        Object.entries(props).filter(([k]) => !MOTION_PROPS.has(k)),
      );
      return <Tag {...(domProps as object)}>{children}</Tag>;
    };
  },
});

export function AnimatePresence({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export { useAnimationControls };
