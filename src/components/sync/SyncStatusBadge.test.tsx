import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SyncStatusBadge } from "@/components/sync/SyncStatusBadge";
import { useNetworkStore } from "@/stores/networkStore";
import { useTransactionStore } from "@/stores/transactionStore";

describe("SyncStatusBadge", () => {
  it("muestra pendientes correctamente", () => {
    useNetworkStore.setState({ isOnline: true });
    useTransactionStore.setState({ pendingSyncCount: 3, failedSyncCount: 0 });

    render(<SyncStatusBadge />);

    expect(screen.getByText("Pendiente de sincronizar: 3")).toBeInTheDocument();
  });

  it("muestra estado offline con pendientes", () => {
    useNetworkStore.setState({ isOnline: false });
    useTransactionStore.setState({ pendingSyncCount: 2, failedSyncCount: 0 });

    render(<SyncStatusBadge />);

    expect(screen.getByText("Sin conexión — 2 pendientes")).toBeInTheDocument();
  });
});
