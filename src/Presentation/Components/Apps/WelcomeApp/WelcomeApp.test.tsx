// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import WelcomeApp from './WelcomeApp';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';

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

describe('WelcomeApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hero section with profile name', () => {
    render(<WelcomeApp />, { wrapper });

    expect(screen.getByText('Francisco Núñez Palomares')).toBeInTheDocument();
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

  it('renders tech tags', () => {
    render(<WelcomeApp />, { wrapper });

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Kubernetes')).toBeInTheDocument();
  });

  it('calls notifyReady on mount', () => {
    const notifyReady = vi.fn();
    render(<WelcomeApp notifyReady={notifyReady} />, { wrapper });

    expect(notifyReady).toHaveBeenCalledWith({});
  });
});
