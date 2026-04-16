// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SkillsBar from './SkillsBar';
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

describe('SkillsBar', () => {
  const mockSkills = [
    { name: 'React', level: 95 },
    { name: 'TypeScript', level: 90 },
    { name: 'Node.js', level: 85 },
  ];

  it('renders skills with title', () => {
    render(<SkillsBar skills={mockSkills} title="Technical Skills" />, { wrapper });

    expect(screen.getByText('Technical Skills')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('renders skill levels', () => {
    render(<SkillsBar skills={mockSkills} />, { wrapper });

    expect(screen.getByText('95%')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('renders without title', () => {
    render(<SkillsBar skills={mockSkills} />, { wrapper });

    expect(screen.queryByText('Technical Skills')).not.toBeInTheDocument();
  });

  it('renders all skills', () => {
    render(<SkillsBar skills={mockSkills} />, { wrapper });

    const skillItems = screen.getAllByTestId('motion-div');
    expect(skillItems).toHaveLength(3);
  });
});
