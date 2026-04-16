import type { CSSProperties, ReactNode } from 'react';

export const Rnd = ({
  children,
  onMouseDown,
  style,
}: {
  children: ReactNode;
  onMouseDown?: () => void;
  style?: CSSProperties;
}) => (
  <div data-testid="rnd-container" onMouseDown={onMouseDown} style={style}>
    {children}
  </div>
);
