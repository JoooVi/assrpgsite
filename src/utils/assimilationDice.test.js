import {
  applyRollSelectionFallback,
  ASSIMILATION_DICE_FACES,
  getRollPileBreakdown,
  isValidRollFormula,
  rollAssimilationDice,
  summarizeRoll,
} from "./assimilationDice";

const countSymbols = (sides, key) => ASSIMILATION_DICE_FACES[sides]
  .flat()
  .filter((symbol) => symbol.key === key)
  .length;

describe("regras de dados de Assimilação", () => {
  test("reproduz a distribuição oficial de símbolos do livro", () => {
    expect([countSymbols(6, "pressure"), countSymbols(6, "adaptation"), countSymbols(6, "success")]).toEqual([3, 1, 1]);
    expect([countSymbols(10, "pressure"), countSymbols(10, "adaptation"), countSymbols(10, "success")]).toEqual([5, 3, 7]);
    expect([countSymbols(12, "pressure"), countSymbols(12, "adaptation"), countSymbols(12, "success")]).toEqual([8, 5, 8]);
  });

  test("aceita somente d6, d10 e d12 em fórmulas seguras", () => {
    expect(isValidRollFormula("2d6 + 1d10 + 3d12")).toBe(true);
    expect(isValidRollFormula("1d20")).toBe(false);
    expect(isValidRollFormula("1000d12")).toBe(false);
  });

  test("gera a pilha completa e registra símbolos sem depender de URLs", () => {
    const roll = rollAssimilationDice("1d6+1d10+1d12", () => 0.9999);
    expect(roll).toHaveLength(3);
    expect(roll.map((die) => die.sides)).toEqual([6, 10, 12]);
    expect(roll.every((die) => Array.isArray(die.symbolKeys))).toBe(true);
  });

  test("contabiliza apenas dados explicitamente mantidos", () => {
    const summary = summarizeRoll([
      { kept: true, symbolKeys: ["success"], result: [] },
      { kept: false, symbolKeys: ["success", "pressure"], result: [] },
    ]);
    expect(summary.successes).toBe(1);
    expect(summary.pressures).toBe(0);
    expect(summary.keptDice).toBe(1);
    expect(summary.hasExplicitSelection).toBe(true);
  });

  test("restaura a escolha quando uma resposta antiga do servidor remove kept", () => {
    const restored = applyRollSelectionFallback(
      {
        id: "roll-1",
        roll: [
          { sides: 10, face: 7, symbolKeys: ["success", "success"] },
          { sides: 6, face: 5, symbolKeys: ["adaptation", "pressure"] },
        ],
      },
      [
        { sides: 10, face: 7, kept: true },
        { sides: 6, face: 5, kept: false },
      ],
    );

    expect(restored.roll.map((die) => die.kept)).toEqual([true, false]);
    expect(summarizeRoll(restored.roll).successes).toBe(2);
    expect(summarizeRoll(restored.roll).adaptations).toBe(0);
  });

  test("resume a composição de uma fórmula por tipo de dado", () => {
    expect(getRollPileBreakdown("2d10 + 1d6 + 1d10")).toEqual([
      { label: "D10", count: 3, sides: 10 },
      { label: "D6", count: 1, sides: 6 },
    ]);
  });
});
