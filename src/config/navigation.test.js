import { getPrimaryNavigation, isNavigationItemActive, primaryNavigation } from "./navigation";

describe("configuração central de navegação", () => {
  test("mantém a seção pai ativa em rotas filhas", () => {
    const campaigns = primaryNavigation.find((item) => item.id === "campaigns");
    const characters = primaryNavigation.find((item) => item.id === "characters");

    expect(isNavigationItemActive(campaigns, "/campaign/abc/refuges")).toBe(true);
    expect(isNavigationItemActive(campaigns, "/campanha/abc/vtt")).toBe(true);
    expect(isNavigationItemActive(characters, "/character-sheet/123")).toBe(true);
    expect(isNavigationItemActive(characters, "/campaigns")).toBe(false);
  });

  test("não expõe áreas protegidas para visitante", () => {
    expect(getPrimaryNavigation(false).map((item) => item.id)).toEqual(["home"]);
    expect(getPrimaryNavigation(true).map((item) => item.id)).toEqual(["characters", "campaigns", "homebrews"]);
  });
});
