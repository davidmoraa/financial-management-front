import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { PrivacyPolicyPage } from "@/pages/PrivacyPolicyPage";
import { TermsOfServicePage } from "@/pages/TermsOfServicePage";

describe("Legal pages", () => {
  it("renders the public privacy policy", () => {
    render(
      <MemoryRouter>
        <PrivacyPolicyPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /politica de privacidad/i })).toBeInTheDocument();
    expect(screen.getByText(/autenticacion con google/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver terminos/i })).toHaveAttribute("href", "/terms-of-service");
  });

  it("renders the public terms of service", () => {
    render(
      <MemoryRouter>
        <TermsOfServicePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /terminos de servicio/i })).toBeInTheDocument();
    expect(screen.getByText(/modo offline y sincronizacion/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver privacidad/i })).toHaveAttribute("href", "/privacy-policy");
  });
});
