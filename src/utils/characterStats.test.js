import {
  INSTINCT_KEYS,
  SKILL_KEYS,
  normalizeCharacterInstincts,
  normalizeCharacterSkills,
  splitCharacterSkills,
} from "./characterStats";

describe("characterStats", () => {
  test("normaliza respostas antigas e a resposta atual com character", () => {
    const skills = normalizeCharacterSkills({
      character: {
        knowledge: { geography: 3 },
        practices: { survival: 2 },
      },
    });

    expect(Object.keys(skills)).toEqual(SKILL_KEYS);
    expect(skills.geography).toBe(3);
    expect(skills.survival).toBe(2);
    expect(skills.medicine).toBe(0);
  });

  test("preserva campos ausentes ao receber um patch parcial", () => {
    const previous = normalizeCharacterSkills({
      knowledge: { geography: 2, medicine: 4 },
      practices: { weapons: 1 },
    });
    const next = normalizeCharacterSkills({ knowledge: { geography: 5 } }, previous);

    expect(next.geography).toBe(5);
    expect(next.medicine).toBe(4);
    expect(next.weapons).toBe(1);
  });

  test("separa conhecimentos e praticas sem perder campos", () => {
    const split = splitCharacterSkills({ geography: 2, survival: 3 });
    expect(Object.keys(split.knowledge)).toHaveLength(6);
    expect(Object.keys(split.practices)).toHaveLength(6);
    expect(split.knowledge.geography).toBe(2);
    expect(split.practices.survival).toBe(3);
  });

  test("instintos sempre mantem a estrutura oficial", () => {
    const instincts = normalizeCharacterInstincts({ instincts: { reaction: 3 } });
    expect(Object.keys(instincts)).toEqual(INSTINCT_KEYS);
    expect(instincts.reaction).toBe(3);
    expect(instincts.resolution).toBe(0);
  });
});

