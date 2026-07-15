export const CAMPAIGN_STATUS = {
  active: { label: "Ativa", className: "active" },
  paused: { label: "Pausada", className: "paused" },
  completed: { label: "Concluída", className: "completed" },
};

export const getCampaignStatus = (status) => CAMPAIGN_STATUS[status] || CAMPAIGN_STATUS.active;

export const formatRelativeDate = (value) => {
  if (!value) return "Atividade não informada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Atividade não informada";

  const diff = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return "Agora";
  if (minutes < 60) return `Há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Há ${days} dia${days === 1 ? "" : "s"}`;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

const HEALTH_LABELS = {
  6: "Saudável",
  5: "Escoriado",
  4: "Lacerado",
  3: "Ferido",
  2: "Arrebentado",
  1: "Incapacitado",
};

export const getCharacterHealth = (character = {}) => {
  const level = Number(character.currentHealthLevel || character.healthLevel || 6);
  return {
    level: HEALTH_LABELS[level] ? level : 6,
    label: HEALTH_LABELS[level] || HEALTH_LABELS[6],
    className: level >= 6 ? "healthy" : level >= 4 ? "wounded" : "critical",
  };
};

export const getCampaignName = (character = {}) => (
  character.campaign?.name
  || character.campaignName
  || character.campaignId?.name
  || "Sem campanha"
);
