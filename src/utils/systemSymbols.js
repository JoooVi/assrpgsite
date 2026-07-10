import corujaIcon from "../assets/Coruja_1.png";
import cervoIcon from "../assets/Cervo_1.png";
import joaninhaIcon from "../assets/Joaninha_1.png";
import conhecimentosIcon from "../assets/icons/conhecimentos.png";
import praticasIcon from "../assets/icons/praticas.png";
import instintosIcon from "../assets/icons/instintos.png";
import d6Icon from "../assets/icons/d6_forma.svg";
import d10Icon from "../assets/icons/d10_forma.svg";
import d12Icon from "../assets/icons/d12_forma.svg";
import assimilacaoPointIcon from "../assets/icons/ICONES_PONTOS_NIVEIS_ASSIMILACAO_DETERMINACAO_pontos_assimilacao_baixo_NOVA.png";
import determinacaoPointIcon from "../assets/icons/ICONES_PONTOS_NIVEIS_ASSIMILACAO_DETERMINACAO_pontos_determinacao_cima_NOVO.png";
import ouroIcon from "../assets/icons/naipe ouros.png";
import pausIcon from "../assets/icons/paus.png";
import espadaIcon from "../assets/icons/naipe paus 2.png";
import copasIcon from "../assets/icons/copas.png";
import healthIcon from "../assets/icons/heart-full.svg";

const normalizeSymbolKey = (value) => String(value || "")
  .trim()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-zA-Z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "")
  .toLowerCase();

export const SYSTEM_SYMBOLS = {
  pressao: { label: "Pressão", icon: corujaIcon },
  pressao_resultado: { label: "Pressão", icon: corujaIcon },
  coruja: { label: "Pressão", icon: corujaIcon },

  adaptacao: { label: "Adaptação", icon: cervoIcon },
  adaptacoes: { label: "Adaptações", icon: cervoIcon },
  tensao: { label: "Adaptação", icon: cervoIcon },
  cervo: { label: "Adaptação", icon: cervoIcon },

  sucesso: { label: "Sucesso", icon: joaninhaIcon },
  sucessos: { label: "Sucessos", icon: joaninhaIcon },
  joaninha: { label: "Sucesso", icon: joaninhaIcon },

  dado: { label: "Dado", icon: d6Icon },
  dados: { label: "Dados", icon: d6Icon },
  d6: { label: "D6", icon: d6Icon },
  d10: { label: "D10", icon: d10Icon },
  d12: { label: "D12", icon: d12Icon },

  saude: { label: "Saúde", icon: healthIcon },
  vida: { label: "Saúde", icon: healthIcon },
  ponto_de_saude: { label: "Ponto de Saúde", icon: healthIcon },
  pontos_de_saude: { label: "Pontos de Saúde", icon: healthIcon },

  conhecimento: { label: "Conhecimento", icon: conhecimentosIcon },
  conhecimentos: { label: "Conhecimentos", icon: conhecimentosIcon },
  pratica: { label: "Prática", icon: praticasIcon },
  praticas: { label: "Práticas", icon: praticasIcon },
  instinto: { label: "Instinto", icon: instintosIcon },
  instintos: { label: "Instintos", icon: instintosIcon },

  ponto_de_assimilacao: { label: "Ponto de Assimilação", icon: assimilacaoPointIcon },
  ponto_assimilacao: { label: "Ponto de Assimilação", icon: assimilacaoPointIcon },
  pontos_de_assimilacao: { label: "Pontos de Assimilação", icon: assimilacaoPointIcon },
  pontos_assimilacao: { label: "Pontos de Assimilação", icon: assimilacaoPointIcon },
  assimilacao: { label: "Assimilação", icon: assimilacaoPointIcon },
  assimilacoes: { label: "Assimilações", icon: assimilacaoPointIcon },

  ponto_de_determinacao: { label: "Ponto de Determinação", icon: determinacaoPointIcon },
  ponto_determinacao: { label: "Ponto de Determinação", icon: determinacaoPointIcon },
  pontos_de_determinacao: { label: "Pontos de Determinação", icon: determinacaoPointIcon },
  pontos_determinacao: { label: "Pontos de Determinação", icon: determinacaoPointIcon },
  determinacao: { label: "Determinação", icon: determinacaoPointIcon },
  determinacoes: { label: "Determinações", icon: determinacaoPointIcon },

  ouro: { label: "Ouro", icon: ouroIcon },
  ouros: { label: "Ouros", icon: ouroIcon },
  naipe_ouro: { label: "Naipe de Ouro", icon: ouroIcon },
  naipe_de_ouro: { label: "Naipe de Ouro", icon: ouroIcon },
  naipe_ouros: { label: "Naipe de Ouros", icon: ouroIcon },
  naipe_de_ouros: { label: "Naipe de Ouros", icon: ouroIcon },

  paus: { label: "Paus", icon: pausIcon },
  naipe_paus: { label: "Naipe de Paus", icon: pausIcon },
  naipe_de_paus: { label: "Naipe de Paus", icon: pausIcon },

  espada: { label: "Espada", icon: espadaIcon },
  espadas: { label: "Espadas", icon: espadaIcon },
  naipe_espada: { label: "Naipe de Espada", icon: espadaIcon },
  naipe_de_espada: { label: "Naipe de Espada", icon: espadaIcon },
  naipe_espadas: { label: "Naipe de Espadas", icon: espadaIcon },
  naipe_de_espadas: { label: "Naipe de Espadas", icon: espadaIcon },

  copa: { label: "Copas", icon: copasIcon },
  copas: { label: "Copas", icon: copasIcon },
  naipe_copas: { label: "Naipe de Copas", icon: copasIcon },
  naipe_de_copas: { label: "Naipe de Copas", icon: copasIcon },
};

export const getSystemSymbol = (token) => SYSTEM_SYMBOLS[normalizeSymbolKey(token)];
