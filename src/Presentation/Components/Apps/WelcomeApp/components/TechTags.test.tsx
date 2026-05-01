// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TechTags from './TechTags';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils';

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
  const mockTags = [
    { name: 'React', url: 'https://react.dev' },
    { name: 'TypeScript', url: 'https://www.typescriptlang.org' },
    { name: 'Node.js', url: 'https://nodejs.org/en' },
    { name: 'Kubernetes', url: 'https://kubernetes.io' },
    { name: 'PostgreSQL', url: 'https://www.postgresql.org' },
    { name: 'Jest', url: 'https://jestjs.io' },
    { name: 'Git', url: 'https://git-scm.com' },
  ];

  it('renders all tag names', () => {
    render(<TechTags tags={mockTags} />, { wrapper });

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('Kubernetes')).toBeInTheDocument();
  });

  it('renders tags as links with correct href', () => {
    render(<TechTags tags={mockTags} />, { wrapper });

    const reactLink = screen.getByText('React').closest('a');
    expect(reactLink).toHaveAttribute('href', 'https://react.dev');
    expect(reactLink).toHaveAttribute('target', '_blank');
    expect(reactLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders category headers for known categories', () => {
    render(<TechTags tags={mockTags} />, { wrapper });

    expect(screen.getByTestId('category-Frontend')).toBeInTheDocument();
    expect(screen.getByTestId('category-Backend')).toBeInTheDocument();
    expect(screen.getByTestId('category-DevOps')).toBeInTheDocument();
    expect(screen.getByTestId('category-Database')).toBeInTheDocument();
    expect(screen.getByTestId('category-Testing')).toBeInTheDocument();
    expect(screen.getByTestId('category-Tools')).toBeInTheDocument();
  });

  it('groups React and TypeScript under Frontend', () => {
    render(<TechTags tags={mockTags} />, { wrapper });

    const frontendSection = screen.getByTestId('category-Frontend');
    expect(frontendSection).toHaveTextContent('React');
    expect(frontendSection).toHaveTextContent('TypeScript');
  });

  it('places Kubernetes under DevOps', () => {
    render(<TechTags tags={mockTags} />, { wrapper });

    const devopsSection = screen.getByTestId('category-DevOps');
    expect(devopsSection).toHaveTextContent('Kubernetes');
  });
});
