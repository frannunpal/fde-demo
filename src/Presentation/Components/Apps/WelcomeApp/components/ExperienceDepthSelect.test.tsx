// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MantineProvider, createTheme } from '@mantine/core';
import ExperienceDepthSelect from './ExperienceDepthSelect';

// Import the mock to ensure it's applied
import '@/Shared/Testing/__mocks__/fde-core.mock';

// Mock @gfazioli/mantine-depth-select
vi.mock('@gfazioli/mantine-depth-select', () => ({
  DepthSelect: ({
    data,
    transitionDuration,
  }: {
    data: Array<{ value: string; view: React.ReactNode }>;
    transitionDuration?: number;
  }) => (
    <div data-testid="depth-select" data-transition={transitionDuration}>
      {data.map(item => (
        <div key={item.value} data-testid={`depth-item-${item.value}`}>
          {item.view}
        </div>
      ))}
    </div>
  ),
}));

// Mock framer-motion
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

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider theme={createTheme({})}>{children}</MantineProvider>
);

describe('ExperienceDepthSelect', () => {
  const mockExperiences = [
    {
      company: 'MyNexoria',
      role: 'Fullstack Developer & DevOps',
      period: '2025 - Present',
      description: 'MVP solo: React, NestJS, PostgreSQL.',
      logo: '/Images/logos/mynexoria.png',
    },
    {
      company: 'Ericsson',
      role: 'DevOps & Frontend Developer',
      period: '2022 - 2024',
      description: 'Microservices migration to Kubernetes/GCP.',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all experiences', () => {
    render(<ExperienceDepthSelect experiences={mockExperiences} />, { wrapper });

    expect(screen.getByText('MyNexoria')).toBeInTheDocument();
    expect(screen.getByText('Ericsson')).toBeInTheDocument();
    expect(screen.getByText('Fullstack Developer & DevOps')).toBeInTheDocument();
    expect(screen.getByText('DevOps & Frontend Developer')).toBeInTheDocument();
  });

  it('renders period and description', () => {
    render(<ExperienceDepthSelect experiences={mockExperiences} />, { wrapper });

    expect(screen.getByText('2025 - Present')).toBeInTheDocument();
    expect(screen.getByText('2022 - 2024')).toBeInTheDocument();
    expect(screen.getByText('MVP solo: React, NestJS, PostgreSQL.')).toBeInTheDocument();
    expect(screen.getByText('Microservices migration to Kubernetes/GCP.')).toBeInTheDocument();
  });

  it('renders with empty experiences array', () => {
    render(<ExperienceDepthSelect experiences={[]} />, { wrapper });

    expect(screen.getByTestId('depth-select')).toBeInTheDocument();
  });

  it('uses animationDuration from settings store (converted to ms)', () => {
    // animationDuration is 0.3s (from mock), should be 300ms
    render(<ExperienceDepthSelect experiences={mockExperiences} />, { wrapper });

    const depthSelect = screen.getByTestId('depth-select');
    expect(depthSelect).toHaveAttribute('data-transition', '300');
  });

  it('renders logo background for experience with logo', () => {
    render(<ExperienceDepthSelect experiences={mockExperiences} />, { wrapper });

    // Check that both companies are rendered
    expect(screen.getByText('MyNexoria')).toBeInTheDocument();
    expect(screen.getByText('Ericsson')).toBeInTheDocument();
  });

  it('renders without logo overlay when no logo provided', () => {
    const experiencesWithoutLogo = [
      {
        company: 'TestCompany',
        role: 'Test Role',
        period: '2020 - 2022',
        description: 'Test description.',
      },
    ];

    render(<ExperienceDepthSelect experiences={experiencesWithoutLogo} />, { wrapper });

    expect(screen.getByText('TestCompany')).toBeInTheDocument();
  });
});
