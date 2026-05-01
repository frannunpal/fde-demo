// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import WelcomeApp from './WelcomeApp';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils';

const mockI18n = {
  t: (key: string) => {
    const translations: Record<string, string> = {
      'skills.technical': 'Technical Skills',
      'skills.soft': 'Soft Skills',
      languages: 'Languages',
      techStack: 'Tech Stack',
      experience: 'Professional Experience',
    };
    return translations[key] || key;
  },
  i18n: {
    language: 'en',
  },
};

vi.mock('react-i18next', () => ({
  useTranslation: () => mockI18n,
}));

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

vi.mock('@gfazioli/mantine-depth-select', () => ({
  DepthSelect: ({ data }: { data: Array<{ value: string; view: React.ReactNode }> }) => (
    <div data-testid="depth-select">
      {data.map(item => (
        <div key={item.value} data-testid={`depth-item-${item.value}`}>
          {item.view}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@mantine/charts', () => ({
  LineChart: () => <div data-testid="line-chart" />,
}));

describe('WelcomeApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hero section with profile name', () => {
    render(<WelcomeApp />, { wrapper });

    expect(screen.getByText('Francisco Núñez Palomares')).toBeInTheDocument();
  });

  it('renders bio text in hero section', () => {
    render(<WelcomeApp />, { wrapper });

    expect(screen.getByText(/Fullstack developer with 15\+ years/)).toBeInTheDocument();
  });

  it('renders skills section', () => {
    render(<WelcomeApp />, { wrapper });

    expect(screen.getByText('Technical Skills')).toBeInTheDocument();
    expect(screen.getByText('Soft Skills')).toBeInTheDocument();
  });

  it('renders languages section', () => {
    render(<WelcomeApp />, { wrapper });

    expect(screen.getByText('Languages')).toBeInTheDocument();
  });

  it('renders tech stack section', () => {
    render(<WelcomeApp />, { wrapper });

    expect(screen.getByText('Tech Stack')).toBeInTheDocument();
  });

  it('renders experience section', () => {
    render(<WelcomeApp />, { wrapper });

    expect(screen.getByText('Professional Experience')).toBeInTheDocument();
  });

  it('renders experience cards', () => {
    render(<WelcomeApp />, { wrapper });

    expect(screen.getByText('MyNexoria')).toBeInTheDocument();
    expect(screen.getByText('Ericsson')).toBeInTheDocument();
  });

  it('renders tech tags as links with correct href', () => {
    render(<WelcomeApp />, { wrapper });

    const reactLink = screen.getByText('React').closest('a');
    expect(reactLink).toHaveAttribute('href', 'https://react.dev');
    expect(reactLink).toHaveAttribute('target', '_blank');

    const k8sLink = screen.getByText('Kubernetes').closest('a');
    expect(k8sLink).toHaveAttribute('href', 'https://kubernetes.io');
  });

  it('renders languages and soft skills in the same section', () => {
    render(<WelcomeApp />, { wrapper });

    expect(screen.getByText('Languages')).toBeInTheDocument();
    expect(screen.getByText('Soft Skills')).toBeInTheDocument();
  });

  it('calls notifyReady on mount', () => {
    const notifyReady = vi.fn();
    render(<WelcomeApp notifyReady={notifyReady} />, { wrapper });

    expect(notifyReady).toHaveBeenCalledWith({});
  });
});
