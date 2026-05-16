import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { SettingsPage } from "@/pages/SettingsPage";
import { useAuthStore } from "@/stores/authStore";

describe("SettingsPage linked providers", () => {
  it("muestra linkedProviders", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      token: "token",
      user: { id: "user-1", email: "test@example.com" },
      linkedProviders: [{ provider: "google", email: "test@example.com", emailVerified: true }],
    });

    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Cuentas vinculadas")).toBeInTheDocument();
    expect(screen.getByText("Google")).toBeInTheDocument();
    expect(screen.getByText("Conectado")).toBeInTheDocument();
  });

  it("no permite desvincular el último provider", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      token: "token",
      user: { id: "user-1", email: "test@example.com" },
      linkedProviders: [{ provider: "google", email: "test@example.com", emailVerified: true }],
    });

    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: /desvincular/i })).toBeDisabled();
  });
});
