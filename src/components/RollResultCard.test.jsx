import React from "react";
import { render, screen } from "@testing-library/react";
import RollResultCard from "./RollResultCard";

describe("RollResultCard", () => {
  const roll = [
    { sides: 6, face: 6, result: [], symbolKeys: ["success"], kept: true },
    { sides: 10, face: 5, result: [], symbolKeys: ["adaptation", "pressure"], kept: false },
  ];

  test("prioriza o resultado mantido e oferece descrição acessível", () => {
    render(
      <RollResultCard
        roll={roll}
        actorName="Yuri"
        actionLabel="Reação + Segurança"
        formula="1d6+1d10"
        variant="full"
      />
    );

    expect(screen.getByText("1 Sucesso")).toBeTruthy();
    expect(screen.queryByText(/Adaptação/)).toBeNull();
    expect(screen.getByText("Resultado escolhido")).toBeTruthy();
    expect(screen.getByText("Pilha descartada")).toBeTruthy();
    expect(screen.getByLabelText(/Yuri realizou uma rolagem/)).toBeTruthy();
    expect(screen.getByText("1d6+1d10")).toBeTruthy();
  });

  test("omite contadores zerados", () => {
    render(
      <RollResultCard
        roll={[{ sides: 6, face: 1, result: [], symbolKeys: [] }]}
        formula="1d6"
        variant="compact"
      />
    );

    expect(screen.getByText("Sem sucessos")).toBeTruthy();
    expect(screen.getByText("Nenhum símbolo no resultado")).toBeTruthy();
    expect(screen.queryByText("0 Pressões")).toBeNull();
  });

  test("não apresenta uma pilha antiga como resultado mantido", () => {
    render(
      <RollResultCard
        roll={[
          { sides: 6, face: 6, symbolKeys: ["success"], result: [] },
          { sides: 10, face: 7, symbolKeys: ["success", "success"], result: [] },
        ]}
        formula="1d6+1d10"
      />
    );

    expect(screen.getByText("3 Sucessos")).toBeTruthy();
    expect(screen.getByText("Rolagem de pilha")).toBeTruthy();
  });
});
