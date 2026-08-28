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

  it('should render the user name', () => {
    render(<GithubApp />, { wrapper });

    expect(screen.getByText('Francisco Núñez Palomares')).toBeInTheDocument();
  });

  it('should render the github handle', () => {
    render(<GithubApp />, { wrapper });

    expect(screen.getByText('@frannunpal')).toBeInTheDocument();
  });

  it('should render stats chips', () => {
    render(<GithubApp />, { wrapper });

    expect(screen.getByText('Repos')).toBeInTheDocument();
    expect(screen.getByText('Years')).toBeInTheDocument();
    expect(screen.getByText('Followers')).toBeInTheDocument();
  });
});
