import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";

describe("LoginPage OAuth", () => {
  it("muestra solo Google y Apple como opciones de acceso", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: /continuar con google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continuar con apple/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/contraseña/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^entrar$/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /terminos/i })).toHaveAttribute("href", "/terms-of-service");
    expect(screen.getByRole("link", { name: /politica de privacidad/i })).toHaveAttribute("href", "/privacy-policy");
  });

  it("mantiene registro sin formulario de email y contraseña", () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: /continuar con google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continuar con apple/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/contraseña/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /entrar con google o apple/i })).toHaveAttribute("href", "/login");
  });
});
