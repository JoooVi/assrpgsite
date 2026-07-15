import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import RollKeepSelector from "./RollKeepSelector";

describe("RollKeepSelector", () => {
  const rollData = {
    skill: "Engenharia + Percepção",
    formula: "1d6+1d10",
    roll: [
      { sides: 6, face: 1, result: [], symbolKeys: [] },
      { sides: 10, face: 7, result: [], symbolKeys: ["success", "success"] },
    ],
  };

  test("exige a escolha antes de confirmar e marca os demais dados como descartados", () => {
    const onConfirm = jest.fn();
    render(
      <RollKeepSelector
        open
        rollData={rollData}
        keepCount={1}
        onConfirm={onConfirm}
        onCancel={() => {}}
      />
    );

    const confirmButton = screen.getByText("Manter resultado");
    expect(confirmButton.disabled).toBe(true);

    fireEvent.click(screen.getByLabelText("Manter dado d10"));
    expect(confirmButton.disabled).toBe(false);
    fireEvent.click(confirmButton);

    const selectedRoll = onConfirm.mock.calls[0][0].roll;
    expect(selectedRoll[0].kept).toBe(false);
    expect(selectedRoll[1].kept).toBe(true);
    expect(onConfirm.mock.calls[0][0].selection).toEqual(expect.objectContaining({
      keepCount: 1,
      selectedIndexes: [1],
    }));
  });

  test("rolagem assimilada exige dois resultados", () => {
    render(
      <RollKeepSelector
        open
        rollData={rollData}
        keepCount={2}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    const confirmButton = screen.getByText("Manter resultado");
    fireEvent.click(screen.getByLabelText("Manter dado d6"));
    expect(confirmButton.disabled).toBe(true);
    fireEvent.click(screen.getByLabelText("Manter dado d10"));
    expect(confirmButton.disabled).toBe(false);
  });

  test("explica a composição e a regra da pilha", () => {
    render(
      <RollKeepSelector
        open
        rollData={{
          ...rollData,
          rollMode: "skill",
          pileSources: [
            { label: "Engenharia", count: 1, sides: 10 },
            { label: "Percepção", count: 1, sides: 6 },
          ],
        }}
        keepCount={1}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.getByText("Escolha padrão")).toBeTruthy();
    expect(screen.getByText("Engenharia")).toBeTruthy();
    expect(screen.getByText("1d10")).toBeTruthy();
    expect(screen.getByText("Percepção")).toBeTruthy();
    expect(screen.getByText("1d6")).toBeTruthy();
  });
});
