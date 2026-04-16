// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HeroSection from './HeroSection';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';

const mockOpen = vi.fn();

vi.stubGlobal('window', {
  ...window,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  open: mockOpen,
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'hero.title': 'Fullstack Developer & DevOps',
        'hero.downloadCV': 'Download CV',
        'hero.contactMe': 'Contact Me',
      };
      return translations[key] || key;
    },
    i18n: {
      language: 'en',
    },
  }),
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
  },
}));

describe('HeroSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window as unknown as Record<string, unknown>).location = { href: '' };
  });

  it('renders profile name', () => {
    render(<HeroSection />, { wrapper });

    expect(screen.getByText('Francisco Núñez Palomares')).toBeInTheDocument();
  });

  it('renders translated title', () => {
    render(<HeroSection />, { wrapper });

    expect(screen.getByText('Fullstack Developer & DevOps')).toBeInTheDocument();
  });

  it('renders download CV button', () => {
    render(<HeroSection />, { wrapper });

    expect(screen.getByText('Download CV')).toBeInTheDocument();
  });

  it('renders contact me button', () => {
    render(<HeroSection />, { wrapper });

    expect(screen.getByText('Contact Me')).toBeInTheDocument();
  });

  it('renders LinkedIn link', () => {
    render(<HeroSection />, { wrapper });

    const linkedinLink = screen.getByLabelText('LinkedIn');
    expect(linkedinLink).toBeInTheDocument();
    expect(linkedinLink).toHaveAttribute('href', expect.stringContaining('linkedin.com'));
  });

  it('renders GitHub link', () => {
    render(<HeroSection />, { wrapper });

    const githubLink = screen.getByLabelText('GitHub');
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href', 'https://github.com/frannunpal');
  });

  it('opens CV on download click', () => {
    render(<HeroSection />, { wrapper });

    const downloadButton = screen.getByText('Download CV');
    fireEvent.click(downloadButton);

    expect(mockOpen).toHaveBeenCalled();
  });

  it('opens email client on contact click', () => {
    render(<HeroSection />, { wrapper });

    const contactButton = screen.getByText('Contact Me');
    fireEvent.click(contactButton);

    expect((window as unknown as Record<string, unknown>).location).toHaveProperty('href');
  });
});
