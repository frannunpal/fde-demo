// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SkillsBar from './SkillsBar';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils';

vi.mock('@mantine/charts', () => ({
  LineChart: ({
    data,
    series,
  }: {
    data: Record<string, string | number>[];
    series: { name: string }[];
  }) => (
    <div data-testid="line-chart">
      {data.map((d, i) => (
        <span key={i} data-testid="chart-point">
          {d.year}
        </span>
      ))}
      {series.map(s => (
        <span key={s.name} data-testid="chart-series">
          {s.name}
        </span>
      ))}
    </div>
  ),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      animate,
      ...props
    }: React.ComponentPropsWithoutRef<'div'> & {
      children?: React.ReactNode;
      animate?: Record<string, unknown>;
      initial?: Record<string, unknown>;
    }) => (
      <div data-testid="motion-bar" style={animate} {...props}>
        {children}
      </div>
    ),
  },
}));

vi.mock('@/Shared/Constants/profileData', () => ({
  SKILL_YEARS: [2008, 2012, 2016, 2020, 2026],
  EXPERIENCE: [],
}));

describe('SkillsBar', () => {
  const mockSkills = [
    { name: 'React', level: 95, history: [0, 20, 60, 85, 95] },
    { name: 'TypeScript', level: 90, history: [0, 15, 50, 80, 90] },
    { name: 'Node.js', level: 85, history: [0, 10, 40, 70, 85] },
  ];

  it('renders title when provided', () => {
    render(<SkillsBar skills={mockSkills} title="Technical Skills" />, { wrapper });

    expect(screen.getByText('Technical Skills')).toBeInTheDocument();
  });

  it('renders without title', () => {
    render(<SkillsBar skills={mockSkills} />, { wrapper });

    expect(screen.queryByText('Technical Skills')).not.toBeInTheDocument();
  });

  it('shows current bars view by default', () => {
    render(<SkillsBar skills={mockSkills} />, { wrapper });

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
  });

  it('renders the toggle control', () => {
    render(<SkillsBar skills={mockSkills} />, { wrapper });

    expect(screen.getByText('≡ Current')).toBeInTheDocument();
    expect(screen.getByText('📈 History')).toBeInTheDocument();
  });

  it('switches to history chart when toggle clicked', () => {
    render(<SkillsBar skills={mockSkills} />, { wrapper });

    fireEvent.click(screen.getByText('📈 History'));

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.queryByText('95%')).not.toBeInTheDocument();
  });

  it('switches back to current view', () => {
    render(<SkillsBar skills={mockSkills} />, { wrapper });

    fireEvent.click(screen.getByText('📈 History'));
    fireEvent.click(screen.getByText('≡ Current'));

    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('passes one data point per year in history view', () => {
    render(<SkillsBar skills={mockSkills} />, { wrapper });

    fireEvent.click(screen.getByText('📈 History'));

    const points = screen.getAllByTestId('chart-point');
    expect(points).toHaveLength(5);
    expect(points[0]).toHaveTextContent('2008');
    expect(points[4]).toHaveTextContent('2026');
  });

  it('creates one series per skill in history view', () => {
    render(<SkillsBar skills={mockSkills} />, { wrapper });

    fireEvent.click(screen.getByText('📈 History'));

    const series = screen.getAllByTestId('chart-series');
    expect(series).toHaveLength(3);
    expect(series[0]).toHaveTextContent('React');
  });
});
