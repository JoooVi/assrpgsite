export const HEALTH_LEVEL_ORDER = [6, 5, 4, 3, 2, 1];

export const HEALTH_LEVEL_DETAILS = {
  6: { name: "Saudável", description: "Recuperação ativa após repouso completo.", severity: "healthy" },
  5: { name: "Escoriado", description: "Recuperação ativa após repouso completo.", severity: "bruised" },
  4: { name: "Lacerado", description: "Ativa Recuperação após uma semana. Menos 1 em todos os testes.", severity: "wounded" },
  3: { name: "Ferido", description: "Ativa Recuperação após uma semana. Menos 1 em todos os testes.", severity: "wounded" },
  2: { name: "Arrebentado", description: "Incapaz de agir, mas mantém a consciência. Menos 2 em todos os testes.", severity: "critical" },
  1: { name: "Incapacitado", description: "Inconsciente. Qualquer ação com teste exige 2 de Adaptação para ativar.", severity: "collapsed" },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const getMaxHealthPerLevel = (character = {}) => Math.max(
  1,
  1 + Number(character?.instincts?.potency || 0) + Number(character?.instincts?.resolution || 0)
);

export const normalizeCharacterHealth = (character = {}) => {
  const maxPerLevel = getMaxHealthPerLevel(character);
  const rawLevel = Number(character?.currentHealthLevel);
  const currentLevel = Number.isInteger(rawLevel) ? clamp(rawLevel, 1, 6) : 6;
  const rawLevels = Array.isArray(character?.healthLevels) ? character.healthLevels : [];
  const healthLevels = Array.from({ length: 6 }, (_, index) => {
    const value = Number(rawLevels[index]);
    return Number.isFinite(value) ? clamp(value, 0, maxPerLevel) : maxPerLevel;
  });

  return { maxPerLevel, currentLevel, healthLevels };
};

export const getCharacterHealthSummary = (character = {}) => {
  const normalized = normalizeCharacterHealth(character);
  const currentIndex = 6 - normalized.currentLevel;
  const currentInfo = HEALTH_LEVEL_DETAILS[normalized.currentLevel] || HEALTH_LEVEL_DETAILS[6];
  return {
    ...normalized,
    currentIndex,
    currentValue: normalized.healthLevels[currentIndex],
    currentName: currentInfo.name,
    currentDescription: currentInfo.description,
    severity: currentInfo.severity,
    isCritical: normalized.currentLevel <= 2,
    totalRemaining: normalized.healthLevels.reduce((sum, value) => sum + value, 0),
    totalMax: normalized.maxPerLevel * 6,
  };
};
