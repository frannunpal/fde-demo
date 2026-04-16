// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExperienceCard from './ExperienceCard';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.ComponentPropsWithoutRef<'div'> & { children?: React.ReactNode }) => (
      <div data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
  },
}));

describe('ExperienceCard', () => {
  const mockExperience = {
    company: 'MyNexoria',
    role: 'Fullstack Developer & DevOps',
    period: '2025 - Present',
    description: 'MVP solo: React, NestJS, PostgreSQL.',
  };

  it('renders experience data', () => {
    render(<ExperienceCard experience={mockExperience} />, { wrapper });

    expect(screen.getByText('MyNexoria')).toBeInTheDocument();
    expect(screen.getByText('Fullstack Developer & DevOps')).toBeInTheDocument();
    expect(screen.getByText('2025 - Present')).toBeInTheDocument();
    expect(screen.getByText('MVP solo: React, NestJS, PostgreSQL.')).toBeInTheDocument();
  });

  it('renders with custom index', () => {
    render(<ExperienceCard experience={mockExperience} index={2} />, { wrapper });

    expect(screen.getByText('MyNexoria')).toBeInTheDocument();
  });
});
