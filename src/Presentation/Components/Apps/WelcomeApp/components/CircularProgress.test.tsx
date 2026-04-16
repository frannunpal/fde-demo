// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CircularProgress from './CircularProgress';

vi.mock('framer-motion', () => ({
  motion: {
    circle: ({
      children,
      ...props
    }: React.ComponentPropsWithoutRef<'circle'> & { children?: React.ReactNode }) => (
      <circle data-testid="progress-circle" {...props}>
        {children}
      </circle>
    ),
  },
}));

describe('CircularProgress', () => {
  it('renders with default props', () => {
    render(<CircularProgress value={75} />);

    expect(screen.getByTestId('progress-circle')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    const { container } = render(<CircularProgress value={50} size={120} />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '120');
    expect(svg).toHaveAttribute('height', '120');
  });

  it('renders with custom stroke width', () => {
    const { container } = render(<CircularProgress value={50} strokeWidth={10} />);

    const circles = container.querySelectorAll('circle');
    circles.forEach(circle => {
      expect(circle).toHaveAttribute('stroke-width', '10');
    });
  });

  it('hides value when showValue is false', () => {
    render(<CircularProgress value={75} showValue={false} />);

    expect(screen.queryByText('75%')).not.toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<CircularProgress value={75} label="English" />);

    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('calculates correct strokeDasharray for value', () => {
    render(<CircularProgress value={50} size={100} strokeWidth={10} />);

    const progressCircle = screen.getByTestId('progress-circle');
    const radius = 45;
    const circumference = radius * 2 * Math.PI;

    expect(progressCircle.style.strokeDasharray).toBe(String(circumference));
    expect(progressCircle).toBeInTheDocument();
  });
});
