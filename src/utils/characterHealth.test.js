import { getCharacterHealthSummary, normalizeCharacterHealth } from "./characterHealth";

describe("Status Vital", () => {
  test("mantém a ordem da ficha e calcula o índice do nível atual", () => {
    const summary = getCharacterHealthSummary({
      instincts: { potency: 2, resolution: 1 },
      currentHealthLevel: 4,
      healthLevels: [4, 4, 2, 4, 4, 4],
    });
    expect(summary).toMatchObject({ currentIndex: 2, currentName: "Lacerado", currentValue: 2, maxPerLevel: 4 });
  });

  test("normaliza dados antigos sem ultrapassar o máximo da ficha", () => {
    expect(normalizeCharacterHealth({
      instincts: { potency: 1, resolution: 0 },
      currentHealthLevel: 9,
      healthLevels: [8, -2],
    })).toEqual({
      maxPerLevel: 2,
      currentLevel: 6,
      healthLevels: [2, 0, 2, 2, 2, 2],
    });
  });
});
