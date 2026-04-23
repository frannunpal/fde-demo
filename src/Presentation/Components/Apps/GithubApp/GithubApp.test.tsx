// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils';

const { default: GithubApp } = await import('./GithubApp');

const GITHUB_URL = 'https://github.com/frannunpal';

describe('GithubApp', () => {
  it('should render a button to open GitHub profile', () => {
    render(<GithubApp />, { wrapper });

    expect(screen.getByRole('button', { name: /open frannunpal profile/i })).toBeInTheDocument();
  });

  it('should open GitHub in a new tab when button is clicked', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(<GithubApp />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: /open frannunpal profile/i }));

    expect(openSpy).toHaveBeenCalledWith(GITHUB_URL, '_blank', 'noopener,noreferrer');

    openSpy.mockRestore();
  });

  it('should render explanation text about iframe blocking', () => {
    render(<GithubApp />, { wrapper });

    expect(
      screen.getByText(/github blocks embedding in iframes for security reasons/i),
    ).toBeInTheDocument();
  });

  it('should render the title', () => {
    render(<GithubApp />, { wrapper });

    expect(screen.getByText('GitHub')).toBeInTheDocument();
  });
});
