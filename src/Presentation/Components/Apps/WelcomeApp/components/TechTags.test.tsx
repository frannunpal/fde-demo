// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TechTags from './TechTags';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.ComponentPropsWithoutRef<'div'> & { children?: React.ReactNode }) => (
      <div data-testid="motion-container" {...props}>
        {children}
      </div>
    ),
  },
}));

describe('TechTags', () => {
  const mockTags = ['React', 'TypeScript', 'Node.js', 'Kubernetes'];

  it('renders all tags', () => {
    render(<TechTags tags={mockTags} />, { wrapper });

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('Kubernetes')).toBeInTheDocument();
  });

  it('renders tags as badges', () => {
    render(<TechTags tags={mockTags} />, { wrapper });

    const badges = screen.getAllByText(/React|TypeScript|Node.js|Kubernetes/);
    expect(badges).toHaveLength(4);
  });
});
