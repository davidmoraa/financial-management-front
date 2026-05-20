import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { LoginPage } from "@/pages/LoginPage";

describe("LoginPage OAuth", () => {
  it("muestra Google y Apple", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: /continuar con google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continuar con apple/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /terminos/i })).toHaveAttribute("href", "/terms-of-service");
    expect(screen.getByRole("link", { name: /politica de privacidad/i })).toHaveAttribute("href", "/privacy-policy");
  });
});
