import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SyncStatusBadge } from "@/components/sync/SyncStatusBadge";
import { useAuthStore } from "@/stores/authStore";
import { useNetworkStore } from "@/stores/networkStore";
import { useTransactionStore } from "@/stores/transactionStore";

describe("SyncStatusBadge", () => {
  it("muestra pendientes correctamente", () => {
    useAuthStore.setState({ isAuthenticated: true, token: "token", user: { id: "u1", email: "a@test.com" } });
    useNetworkStore.setState({ isOnline: true });
    useTransactionStore.setState({ pendingSyncCount: 3, failedSyncCount: 0 });

    render(<SyncStatusBadge />);

    expect(screen.getByText("Sync pendiente · 3 cambios")).toBeInTheDocument();
  });

  it("muestra estado offline con pendientes", () => {
    useAuthStore.setState({ isAuthenticated: true, token: "token", user: { id: "u1", email: "a@test.com" } });
    useNetworkStore.setState({ isOnline: false });
    useTransactionStore.setState({ pendingSyncCount: 2, failedSyncCount: 0 });

    render(<SyncStatusBadge />);

    expect(screen.getByText("Offline · 2 guardados")).toBeInTheDocument();
  });

  it("muestra estado local cuando no hay sesión", () => {
    render(<SyncStatusBadge />);

    expect(screen.getByText("Datos locales")).toBeInTheDocument();
  });

  it("no usa banner rojo cuando solo hay sync pendiente", () => {
    useAuthStore.setState({ isAuthenticated: true, token: "token", user: { id: "u1", email: "a@test.com" } });
    useNetworkStore.setState({ isOnline: true });
    useTransactionStore.setState({ pendingSyncCount: 18, failedSyncCount: 0 });

    render(<SyncStatusBadge />);

    const badge = screen.getByText("Sync pendiente · 18 cambios").closest("div");
    expect(badge?.className).not.toContain("red");
  });
});
