const STATUS_MESSAGES = {
  401: "Sua sessão expirou. Entre novamente.",
  403: "Você não possui permissão para realizar esta ação.",
  404: "Este conteúdo não foi encontrado ou não está mais disponível.",
  409: "Os dados foram alterados ou já estão sendo utilizados.",
  413: "O conteúdo enviado ultrapassa o limite permitido.",
  429: "Muitas tentativas. Aguarde alguns instantes.",
  500: "Não foi possível concluir a operação.",
};

const SAFE_MESSAGE_STATUSES = new Set([400, 403, 404, 409, 413, 422, 429]);
const INTERNAL_MESSAGE_PATTERN = /(stack|trace|mongoose|mongodb|sequelize|sql|enoent|econn|node_modules|\bat\s+\w+.*:\d+)/i;

const getSafeServerMessage = (error) => {
  const status = Number(error?.response?.status || 0);
  const message = error?.response?.data?.message;
  if (!SAFE_MESSAGE_STATUSES.has(status) || typeof message !== "string") return "";
  const normalized = message.trim();
  if (!normalized || normalized.length > 240 || INTERNAL_MESSAGE_PATTERN.test(normalized)) return "";
  return normalized;
};

export const getPublicErrorMessage = (error, fallback = "Não foi possível concluir a operação.") => {
  const specificMessage = getSafeServerMessage(error);
  if (specificMessage) return specificMessage;

  if (!error?.response) return "Não foi possível conectar ao servidor.";
  return STATUS_MESSAGES[Number(error.response.status)] || fallback;
};

export default getPublicErrorMessage;
