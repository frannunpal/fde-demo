// @vitest-environment jsdom
<<<<<<< HEAD
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils';
=======
import "@/Shared/Testing/__mocks__/jsdom-setup";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { renderWithMantine as wrapper } from "@/Shared/Testing/Utils";
>>>>>>> 03501ca (update to 0.4.35 and latest public components)

const { default: LinkedinApp } = await import("./LinkedinApp");

const LINKEDIN_URL =
  "https://www.linkedin.com/in/francisco-n%C3%BA%C3%B1ez-palomares-74a484171/";

describe("LinkedinApp", () => {
  it("should render a button to open LinkedIn profile", () => {
    render(<LinkedinApp />, { wrapper });

    expect(
      screen.getByRole("button", { name: /open francisco núñez profile/i }),
    ).toBeInTheDocument();
  });

  it("should open LinkedIn in a new tab when button is clicked", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(<LinkedinApp />, { wrapper });

    fireEvent.click(
      screen.getByRole("button", { name: /open francisco núñez profile/i }),
    );

    expect(openSpy).toHaveBeenCalledWith(
      LINKEDIN_URL,
      "_blank",
      "noopener,noreferrer",
    );

    openSpy.mockRestore();
  });

  it("should render explanation text about iframe blocking", () => {
    render(<LinkedinApp />, { wrapper });

    expect(
      screen.getByText(
        /linkedin blocks embedding in iframes for security reasons/i,
      ),
    ).toBeInTheDocument();
  });

  it("should render the title", () => {
    render(<LinkedinApp />, { wrapper });

    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
  });
});
