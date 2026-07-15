import { formatRelativeDate, getCampaignStatus, getCharacterHealth } from "./presentation";

describe("apresentação de campanhas e personagens", () => {
  test.each([
    ["active", "Ativa"],
    ["paused", "Pausada"],
    ["completed", "Concluída"],
  ])("traduz status %s", (status, label) => {
    expect(getCampaignStatus(status).label).toBe(label);
  });

  test("usa status ativo como fallback compatível", () => {
    expect(getCampaignStatus("legacy").label).toBe("Ativa");
  });

  test("traduz o nível real de vida", () => {
    expect(getCharacterHealth({ currentHealthLevel: 4 })).toMatchObject({ label: "Lacerado", className: "wounded" });
    expect(getCharacterHealth({ currentHealthLevel: 1 })).toMatchObject({ label: "Incapacitado", className: "critical" });
  });

  test("não exibe data inválida como valor técnico", () => {
    expect(formatRelativeDate("invalida")).toBe("Atividade não informada");
  });
});
