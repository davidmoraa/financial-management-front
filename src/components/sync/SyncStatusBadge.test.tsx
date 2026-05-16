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

    expect(screen.getByText("3 pendientes")).toBeInTheDocument();
  });

  it("muestra estado offline con pendientes", () => {
    useAuthStore.setState({ isAuthenticated: true, token: "token", user: { id: "u1", email: "a@test.com" } });
    useNetworkStore.setState({ isOnline: false });
    useTransactionStore.setState({ pendingSyncCount: 2, failedSyncCount: 0 });

    render(<SyncStatusBadge />);

    expect(screen.getByText("Sin conexión — se sincronizará después")).toBeInTheDocument();
  });

  it("muestra estado local cuando no hay sesión", () => {
    render(<SyncStatusBadge />);

    expect(screen.getByText("Datos solo en este dispositivo")).toBeInTheDocument();
  });
});
