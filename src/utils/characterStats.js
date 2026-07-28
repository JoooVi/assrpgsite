export const KNOWLEDGE_KEYS = [
  "geography",
  "medicine",
  "security",
  "biology",
  "erudition",
  "engineering",
];

export const PRACTICE_KEYS = [
  "weapons",
  "athletics",
  "expression",
  "stealth",
  "crafting",
  "survival",
];

export const INSTINCT_KEYS = [
  "reaction",
  "perception",
  "sagacity",
  "potency",
  "influence",
  "resolution",
];

export const SKILL_KEYS = [...KNOWLEDGE_KEYS, ...PRACTICE_KEYS];

const normalizeNumberMap = (keys, source = {}, fallback = {}) => keys.reduce((result, key) => {
  const rawValue = source?.[key] ?? fallback?.[key] ?? 0;
  const parsedValue = Number.parseInt(rawValue, 10);
  result[key] = Number.isFinite(parsedValue) ? Math.max(0, parsedValue) : 0;
  return result;
}, {});

export const normalizeCharacterSkills = (payload = {}, fallback = {}) => {
  const source = payload?.character || payload || {};
  const nestedSkills = source.skills || {};
  const flatSource = SKILL_KEYS.reduce((result, key) => {
    if (source[key] !== undefined) result[key] = source[key];
    return result;
  }, {});

  return normalizeNumberMap(SKILL_KEYS, {
    ...flatSource,
    ...(nestedSkills.knowledge || {}),
    ...(nestedSkills.practices || {}),
    ...(source.knowledge || {}),
    ...(source.practices || {}),
  }, fallback);
};

export const normalizeCharacterInstincts = (payload = {}, fallback = {}) => {
  const source = payload?.character || payload || {};
  return normalizeNumberMap(INSTINCT_KEYS, source.instincts || source, fallback);
};

export const splitCharacterSkills = (skills = {}) => ({
  knowledge: normalizeNumberMap(KNOWLEDGE_KEYS, skills),
  practices: normalizeNumberMap(PRACTICE_KEYS, skills),
});

