import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuthStore } from "@/stores/authStore";

describe("AuthGuard", () => {
  it("redirige a login si no hay sesión", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<AuthGuard><div>Privado</div></AuthGuard>} />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("renderiza el contenido protegido cuando está autenticado aunque user sea null (PWA offline sin cache)", () => {
    // Escenario: token válido pero sin cache de sesión (app cerrada abruptamente antes del cache).
    // El AuthGuard debe dejar pasar al usuario — no redirigir a login.
    useAuthStore.setState({ token: "stored-token", isAuthenticated: true, isAuthLoading: false, user: null, profile: null });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<AuthGuard><div>Dashboard</div></AuthGuard>} />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Login")).not.toBeInTheDocument();
  });
});
