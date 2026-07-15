import coruja from "../assets/Coruja_1.png";
import cervo from "../assets/Cervo_1.png";
import joaninha from "../assets/Joaninha_1.png";

export const ROLL_SYMBOLS = Object.freeze({
  success: { key: "success", label: "Sucesso", plural: "Sucessos", icon: joaninha },
  adaptation: { key: "adaptation", label: "Adaptação", plural: "Adaptações", icon: cervo },
  pressure: { key: "pressure", label: "Pressão", plural: "Pressões", icon: coruja },
});

const S = ROLL_SYMBOLS.success;
const A = ROLL_SYMBOLS.adaptation;
const P = ROLL_SYMBOLS.pressure;

// Distribuição oficial apresentada em "Anatomia dos Dados" (página 35 do livro).
export const ASSIMILATION_DICE_FACES = Object.freeze({
  6: [[], [], [P], [P], [A, P], [S]],
  10: [[], [], [P], [P], [A, P], [S], [S, S], [A, S], [A, S, P], [S, S, P]],
  12: [[], [], [P], [P], [A, P], [S], [S, S], [A, S], [A, S, P], [S, S, P], [A, A, S, P], [P, P]],
});

export const normalizeRollFormula = (formula) => String(formula || "")
  .replace(/\s+/g, "")
  .toLowerCase();

export const isValidRollFormula = (formula) => (
  /^(?:[1-9]\d?d(?:6|10|12))(?:\+[1-9]\d?d(?:6|10|12))*$/.test(normalizeRollFormula(formula))
);

export const getRollPileBreakdown = (formula, explicitSources = []) => {
  if (Array.isArray(explicitSources) && explicitSources.length) {
    return explicitSources
      .map((source) => ({
        label: String(source?.label || `D${source?.sides || "?"}`),
        count: Math.max(0, Number(source?.count) || 0),
        sides: Number(source?.sides) || 0,
      }))
      .filter((source) => source.count > 0 && [6, 10, 12].includes(source.sides));
  }

  const grouped = new Map();
  const regex = /(\d+)d(6|10|12)/gi;
  let match;
  while ((match = regex.exec(normalizeRollFormula(formula))) !== null) {
    const sides = Number(match[2]);
    grouped.set(sides, (grouped.get(sides) || 0) + Number(match[1]));
  }
  return [...grouped.entries()].map(([sides, count]) => ({ label: `D${sides}`, count, sides }));
};

export const rollAssimilationDice = (formula, random = Math.random) => {
  const normalized = normalizeRollFormula(formula);
  if (!isValidRollFormula(normalized)) return [];

  const results = [];
  const regex = /(\d+)d(6|10|12)/g;
  let match;
  while ((match = regex.exec(normalized)) !== null) {
    const count = Number(match[1]);
    const sides = Number(match[2]);
    for (let index = 0; index < count; index += 1) {
      const face = Math.floor(random() * sides) + 1;
      const symbols = ASSIMILATION_DICE_FACES[sides][face - 1] || [];
      results.push({
        face,
        sides,
        result: symbols.map((symbol) => symbol.icon),
        symbolKeys: symbols.map((symbol) => symbol.key),
      });
    }
  }
  return results;
};

const inferSymbolKey = (value) => {
  const source = String(value?.default || value || "").toLowerCase();
  if (source === String(joaninha).toLowerCase() || source.includes("joaninha")) return "success";
  if (source === String(cervo).toLowerCase() || source.includes("cervo")) return "adaptation";
  if (source === String(coruja).toLowerCase() || source.includes("coruja")) return "pressure";
  return null;
};

export const getKeptDice = (roll = []) => {
  const dice = Array.isArray(roll) ? roll : [];
  const hasExplicitSelection = dice.some((die) => typeof die?.kept === "boolean");
  return {
    dice: hasExplicitSelection ? dice.filter((die) => die.kept === true) : dice,
    hasExplicitSelection,
  };
};

export const applyRollSelectionFallback = (rollData, fallback = []) => {
  if (!rollData || !Array.isArray(rollData.roll)) return rollData;
  const fallbackData = Array.isArray(fallback) ? {} : (fallback || {});
  const fallbackDice = Array.isArray(fallback) ? fallback : (fallbackData.roll || []);
  const responseHasSelection = rollData.roll.some((die) => typeof die?.kept === "boolean");
  const fallbackHasSelection = fallbackDice.some((die) => typeof die?.kept === "boolean");

  return {
    ...fallbackData,
    ...rollData,
    rollMode: rollData.rollMode || fallbackData.rollMode,
    selection: rollData.selection || fallbackData.selection,
    pileSources: rollData.pileSources?.length ? rollData.pileSources : fallbackData.pileSources,
    roll: responseHasSelection || !fallbackHasSelection
      ? rollData.roll
      : rollData.roll.map((die, index) => ({
        ...die,
        kept: fallbackDice[index]?.kept === true,
      })),
  };
};

export const summarizeRoll = (roll = []) => {
  const allDice = Array.isArray(roll) ? roll : [];
  const { dice, hasExplicitSelection } = getKeptDice(allDice);
  const summary = {
    successes: 0,
    adaptations: 0,
    pressures: 0,
    blanks: 0,
    totalDice: allDice.length,
    keptDice: dice.length,
    hasExplicitSelection,
  };

  dice.forEach((die) => {
    const keys = Array.isArray(die?.symbolKeys) && die.symbolKeys.length
      ? die.symbolKeys
      : (die?.result || []).map(inferSymbolKey).filter(Boolean);
    if (!keys.length) summary.blanks += 1;
    keys.forEach((key) => {
      if (key === "success") summary.successes += 1;
      if (key === "adaptation") summary.adaptations += 1;
      if (key === "pressure") summary.pressures += 1;
    });
  });

  return summary;
};

export const pluralizeRollCount = (count, singular, plural) => (
  `${count} ${count === 1 ? singular : plural}`
);

export const formatRollAccessibleText = ({ actorName, actionLabel, formula, roll }) => {
  const summary = summarizeRoll(roll);
  const actor = actorName || "Personagem";
  const action = actionLabel ? ` em ${actionLabel}` : "";
  const formulaText = formula ? ` usando ${formula}` : "";
  const unresolvedPile = !summary.hasExplicitSelection && summary.totalDice > 1;
  return `${actor} realizou uma rolagem${action}${formulaText}: ${pluralizeRollCount(summary.successes, "sucesso", "sucessos")}, ${pluralizeRollCount(summary.adaptations, "adaptação", "adaptações")} e ${pluralizeRollCount(summary.pressures, "pressão", "pressões")}${unresolvedPile ? " na pilha rolada, sem seleção registrada" : ""}.`;
};
