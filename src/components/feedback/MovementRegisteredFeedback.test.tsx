import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MovementRegisteredFeedback } from "@/components/feedback/MovementRegisteredFeedback";

describe("MovementRegisteredFeedback", () => {
  it("muestra confirmación accesible con feedback financiero contextual", () => {
    render(
      <MovementRegisteredFeedback
        amount={680}
        categoryName="Comida"
        projectionCopy="Después de este gasto, puedes gastar $680 diarios el resto del mes."
        show
        type="expense"
      />,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Movimiento registrado")).toBeInTheDocument();
    expect(screen.getByText("$680 en Comida")).toBeInTheDocument();
    expect(screen.getByText("Después de este gasto, puedes gastar $680 diarios el resto del mes.")).toBeInTheDocument();
    expect(screen.getByText("Claridad financiera al día")).toBeInTheDocument();
  });
});
