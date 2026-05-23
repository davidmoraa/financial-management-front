import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const savingMilestonesApiMock = vi.hoisted(() => ({
  createRemoteSavingMilestone: vi.fn(),
  deleteRemoteSavingMilestone: vi.fn(),
  fetchSavingMilestones: vi.fn(),
  updateRemoteSavingMilestone: vi.fn(),
}));

vi.mock("@/services/savingMilestonesApi", () => savingMilestonesApiMock);

import { SavingMilestonesPage } from "@/pages/SavingMilestonesPage";

describe("SavingMilestonesPage", () => {
  it("lista metas y muestra progreso/aportación sugerida", async () => {
    savingMilestonesApiMock.fetchSavingMilestones.mockResolvedValueOnce([
      {
        id: "goal-1",
        name: "Viaje",
        targetAmount: 20000,
        currentAmount: 5000,
        targetDate: "2026-12-31",
        priority: "important",
        contributionFrequency: "weekly",
        autoReserve: true,
        isActive: true,
        createdAt: "2026-05-22T00:00:00.000Z",
        updatedAt: "2026-05-22T00:00:00.000Z",
        projection: {
          remainingAmount: 15000,
          daysRemaining: 223,
          weeksRemaining: 32,
          monthsRemaining: 8,
          requiredDailyContribution: 67.26,
          requiredWeeklyContribution: 468.75,
          requiredBiweeklyContribution: 937.5,
          requiredMonthlyContribution: 1875,
          progressPercentage: 25,
          health: "on_track",
        },
      },
    ]);

    render(<SavingMilestonesPage />);

    expect(await screen.findByText("Viaje")).toBeInTheDocument();
    expect(screen.getByText("Vas en tiempo")).toBeInTheDocument();
    expect(screen.getByText(/aparta \$469 por semana/i)).toBeInTheDocument();
  });

  it("valida monto objetivo antes de guardar", async () => {
    savingMilestonesApiMock.fetchSavingMilestones.mockResolvedValueOnce([]);
    const user = userEvent.setup();

    render(<SavingMilestonesPage />);

    await user.click(await screen.findByRole("button", { name: /crear primera meta/i }));
    await user.type(screen.getByLabelText("Nombre de la meta"), "Emergencia");
    await user.type(screen.getByLabelText("Monto objetivo"), "0");
    await user.type(screen.getByLabelText("Fecha objetivo"), "2099-12-31");
    const createButtons = screen.getAllByRole("button", { name: /crear meta/i });
    await user.click(createButtons[createButtons.length - 1]);

    expect(await screen.findByText("El monto objetivo debe ser mayor a 0.")).toBeInTheDocument();
    expect(savingMilestonesApiMock.createRemoteSavingMilestone).not.toHaveBeenCalled();
  });
});
