import React, { Profiler, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import axios from 'axios';
import styles from './VTT.module.css';
import VTTMap from '../components/VTT/VTTMap';
import VTTPerformancePanel from '../components/VTT/VTTPerformancePanel';
import ConflictTracker from '../components/ConflictTracker';
import RollResultCard from '../components/RollResultCard';
import RollKeepSelector from '../components/RollKeepSelector';
import {
  FaBullseye, FaHandPaper, FaThLarge, FaMapMarkedAlt, FaPlus, FaTrash,
  FaUpload, FaRuler, FaPencilAlt, FaUserShield, FaFolder, FaTimes,
  FaTh, FaGhost, FaCar, FaCrosshairs, FaBoxOpen, FaEllipsisH,
    FaFont, FaEraser, FaUndo, FaRedo, FaLayerGroup, FaUserSecret,
    FaQuestionCircle, FaEye, FaEyeSlash, FaDiceD20,
    FaUsers, FaImage, FaCircle, FaSquare, FaHeart, FaRegHeart, FaSlidersH, FaLock, FaUnlock, FaCopy, FaAlignLeft, FaAlignCenter, FaAlignRight, FaShapes, FaSlash, FaLowVision, FaChevronLeft, FaChevronRight, FaChevronUp, FaChevronDown
} from 'react-icons/fa';
import MasterDiceRoller from '../components/MasterDiceRoller';
import EventDeckModal from '../components/EventDeckModal';
import NPCGenerator from '../components/NPCGenerator';
import { useConfirm } from '../components/notifications/ConfirmProvider';
import { dispatchToast } from '../components/notifications/ToastProvider';
import Dialog from '../components/ui/Dialog';
import { API_BASE_URL } from '../config/apiConfig';
import { setVttPerformanceMetric } from '../utils/vttPerformance';
import { applyRollSelectionFallback, isValidRollFormula, normalizeRollFormula, rollAssimilationDice } from '../utils/assimilationDice';
import determinationPointIcon from '../assets/icons/ICONES_PONTOS_NIVEIS_ASSIMILACAO_DETERMINACAO_pontos_determinacao_cima_NOVO.png';
import assimilationPointIcon from '../assets/icons/ICONES_PONTOS_NIVEIS_ASSIMILACAO_DETERMINACAO_pontos_assimilacao_baixo_NOVA.png';
import { HEALTH_LEVEL_DETAILS, getCharacterHealthSummary } from '../utils/characterHealth';

const API_BASE = API_BASE_URL;
const DEBUG_VTT_ROLLS = process.env.REACT_APP_DEBUG_VTT_ROLLS === 'true';
const MAX_VTT_HISTORY = 60;
const debugVttRoll = (...args) => {
  if (DEBUG_VTT_ROLLS) console.log(...args);
};
const createMutationId = () => window.crypto?.randomUUID?.() || `mutation-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const knowledgeKeys = ['geography', 'medicine', 'security', 'biology', 'erudition', 'engineering'];
const practiceKeys = ['weapons', 'athletics', 'expression', 'stealth', 'crafting', 'survival'];
const VTT_FONT_OPTIONS = [
  { value: 'Rajdhani', label: 'Rajdhani' },
  { value: 'Orbitron', label: 'Orbitron' },
  { value: 'Share Tech Mono', label: 'Share Tech Mono' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: 'Courier New' },
];

const translations = {
  geography: 'Geografia', medicine: 'Medicina', security: 'Segurança', biology: 'Biologia', erudition: 'Erudição', engineering: 'Engenharia',
  weapons: 'Armas', athletics: 'Atletismo', expression: 'Expressão', stealth: 'Furtividade', crafting: 'Manufaturas', survival: 'Sobrevivência',
  perception: 'Percepção', potency: 'Potência', influence: 'Influência', resolution: 'Resolução', sagacity: 'Sagacidade', reaction: 'Reação'
};

const healthLevelDetails = HEALTH_LEVEL_DETAILS;

const simplifyDrawingPoints = (points, minDistance = 1.5) => {
  if (!Array.isArray(points) || points.length <= 4) return points || [];
  const simplified = [points[0], points[1]];
  let lastX = points[0];
  let lastY = points[1];
  for (let index = 2; index < points.length - 2; index += 2) {
    const x = Number(points[index]);
    const y = Number(points[index + 1]);
    if (Math.hypot(x - lastX, y - lastY) < minDistance) continue;
    simplified.push(x, y);
    lastX = x;
    lastY = y;
  }
  simplified.push(points[points.length - 2], points[points.length - 1]);
  return simplified;
};

const timeFmt = (ts) => new Date(ts || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const t = (key) => translations[key] || key;
const getSkillTypeLabel = (skillKey) => knowledgeKeys.includes(skillKey) ? 'Conhecimento' : practiceKeys.includes(skillKey) ? 'Prática' : 'Perícia';
const getCharacterSkills = (char) => ({ ...(char?.knowledge || {}), ...(char?.practices || {}) });
const metaValueLabels = {
  current: 'Atual',
  collapse: 'Colapso',
  precollapse: 'Pré-Colapso',
  preCollapse: 'Pré-Colapso',
  pre_collapse: 'Pré-Colapso',
  'pre-collapse': 'Pré-Colapso',
  postcollapse: 'Pós-Colapso',
  postCollapse: 'Pós-Colapso',
  post_collapse: 'Pós-Colapso',
  'post-collapse': 'Pós-Colapso',
};

const prettyMeta = (value, fallback = 'Não informado') => {
  if (!value) return fallback;
  const normalizedValue = String(value).trim();
  const normalizedKey = normalizedValue.replace(/[\s_-]/g, '').toLowerCase();
  const translatedValue = metaValueLabels[normalizedValue] || metaValueLabels[normalizedKey];
  if (translatedValue) return translatedValue;

  return normalizedValue
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\bpre colapso\b/i, 'Pre-Colapso')
    .replace(/\bpos colapso\b/i, 'Pós-Colapso')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getHealthSummary = getCharacterHealthSummary;

const repairPortugueseText = (value) => {
  if (typeof value !== 'string') return value;
  let text = value;
  for (let i = 0; i < 2 && /[\u00c3\u00c2\u00e2]/.test(text); i += 1) {
    try {
      const bytes = Array.from(text, (char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join('');
      const decoded = decodeURIComponent(bytes);
      if (!decoded || decoded === text) break;
      text = decoded;
    } catch (error) {
      break;
    }
  }
  return text
    .replaceAll('\u00c2\u00b7', '\u00b7')
    .replaceAll('\u00c2\u00b0', '\u00b0')
    .replaceAll('\u00e2\u20ac\u00a2', '\u2022')
    .replaceAll('\u00e2\u20ac\u201c', '-')
    .replaceAll('\u00e2\u20ac\u201d', '-');
};
const DEFAULT_SCENE_MAP_URL = '../assets/ass.png';
const DEFAULT_FOG_OF_WAR = {
  enabled: false,
  hiddenFullPage: false,
  dmOpacity: 0.35,
  playerOpacity: 1,
  areas: [],
};

const normalizeFogOfWar = (fog = {}) => ({
  ...DEFAULT_FOG_OF_WAR,
  ...(fog || {}),
  dmOpacity: Number(fog?.dmOpacity ?? DEFAULT_FOG_OF_WAR.dmOpacity),
  playerOpacity: Number(fog?.playerOpacity ?? DEFAULT_FOG_OF_WAR.playerOpacity),
  areas: Array.isArray(fog?.areas) ? fog.areas : [],
});

const clampOverlayPosition = (x, y, width = 300, height = 140, margin = 12) => ({
  left: Math.min(Math.max(Number(x || 0), margin), Math.max(margin, window.innerWidth - width - margin)),
  top: Math.min(Math.max(Number(y || 0), margin), Math.max(margin, window.innerHeight - height - margin)),
});

const formatPlural = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`;

const getChatEntryId = (entry, type = 'text') => {
  const explicitId = entry?.id || entry?._id;
  if (explicitId) return String(explicitId);
  if (type === 'roll') {
    const dice = (entry?.roll || []).map((die) => `${die?.sides}:${die?.face}`).join(',');
    return `roll:${entry?.timestamp || ''}:${entry?.rollerId || ''}:${entry?.characterId || ''}:${entry?.formula || ''}:${dice}`;
  }
  return `text:${entry?.timestamp || ''}:${entry?.senderId || ''}:${entry?.characterId || ''}:${entry?.text || ''}`;
};

const mergeChatItems = (current, incoming, type, limit) => {
  const mergedById = new Map(current.map((item) => [getChatEntryId(item, type), item]));
  (Array.isArray(incoming) ? incoming : [incoming]).filter(Boolean).forEach((item) => {
    const key = getChatEntryId(item, type);
    const existing = mergedById.get(key);
    if (!existing) {
      mergedById.set(key, item);
      return;
    }

    if (type !== 'roll') {
      mergedById.set(key, { ...existing, ...item });
      return;
    }

    const existingHasSelection = (existing.roll || []).some((die) => typeof die?.kept === 'boolean');
    const incomingHasSelection = (item.roll || []).some((die) => typeof die?.kept === 'boolean');
    mergedById.set(key, existingHasSelection && !incomingHasSelection
      ? { ...item, ...existing }
      : { ...existing, ...item });
  });
  return [...mergedById.values()]
    .sort((a, b) => new Date(a?.timestamp || 0).getTime() - new Date(b?.timestamp || 0).getTime())
    .slice(-limit);
};

const getCreatedRollFromResponse = (data) => data?.roll
  || (Array.isArray(data) ? data[0] : null)
  || (data?.formula && Array.isArray(data?.roll) ? data : null);

const loadImageDimensions = (url) => new Promise((resolve) => {
  const image = new window.Image();
  image.crossOrigin = 'anonymous';
  image.onload = () => {
    resolve({ width: image.naturalWidth || image.width || 100, height: image.naturalHeight || image.height || 100 });
  };
  image.onerror = () => resolve({ width: 100, height: 100 });
  image.src = url;
});

const CollapseToggleButton = ({ collapsed, direction, title, onClick, className = '' }) => {
  const Icon = {
    left: FaChevronLeft,
    right: FaChevronRight,
    up: FaChevronUp,
    down: FaChevronDown,
  }[direction] || FaChevronDown;

  return (
    <button
      type="button"
      className={`${styles.collapseButton} ${collapsed ? styles.collapseButtonCollapsed : ''} ${className}`}
      title={title}
      aria-label={title}
      aria-expanded={!collapsed}
      onClick={onClick}
    >
      <Icon size={12} />
    </button>
  );
};

const VTT = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const { user, token } = useSelector((state) => state.auth);
  const { confirm } = useConfirm();

  const [campaignData, setCampaignData] = useState(null);
  const [availableChars, setAvailableChars] = useState([]);
  const [isMaster, setIsMaster] = useState(false);
  const [hasLoadedCampaign, setHasLoadedCampaign] = useState(false);

  const [scenes, setScenes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [assetLibrary, setAssetLibrary] = useState([]);

  const [partySceneId, setPartySceneId] = useState('default');
  const [viewingSceneId, setViewingSceneId] = useState('default');
  const sceneSwitchStartedRef = useRef(0);
  const changeViewingScene = useCallback((sceneId) => {
    sceneSwitchStartedRef.current = performance.now();
    setViewingSceneId(sceneId);
  }, []);

  useEffect(() => {
    if (!sceneSwitchStartedRef.current) return;
    setVttPerformanceMetric('lastSceneSwitchMs', performance.now() - sceneSwitchStartedRef.current);
    sceneSwitchStartedRef.current = 0;
  }, [viewingSceneId]);

  const [isSceneManagerOpen, setIsSceneManagerOpen] = useState(false);
  const [managerTab, setManagerTab] = useState('scenes');
  const [uploadType, setUploadType] = useState('map');

  // ======== NUVEM PESSOAL (GERENCIADOR DE ASSETS) ========
  const [myAssets, setMyAssets] = useState([]);
  const [isAssetManagerOpen, setIsAssetManagerOpen] = useState(false);
  const [activeQuickCategory, setActiveQuickCategory] = useState(null);
  const [radialMenuData, setRadialMenuData] = useState(null);
  const [isRadialUploading, setIsRadialUploading] = useState(false);
  const mousePosRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => () => {
    if (radialMenuData?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(radialMenuData.previewUrl);
    }
  }, [radialMenuData?.previewUrl]);

  const currentScene = useMemo(() => scenes.find(s => s.id === viewingSceneId) || scenes[0] || { tokens: [], mapUrl: '', drawings: [], name: 'Carregando...' }, [scenes, viewingSceneId]);
  const tokens = useMemo(() => currentScene.tokens || [], [currentScene]);
  const drawings = useMemo(() => currentScene.drawings || [], [currentScene]);
  const mapUrl = currentScene.mapUrl || '';
  const currentFogOfWar = useMemo(() => normalizeFogOfWar(currentScene.fogOfWar), [currentScene.fogOfWar]);

  const [contextMenu, setContextMenu] = useState(null);
  const [editingToken, setEditingToken] = useState(null);
  const [isTokenImageUploading, setIsTokenImageUploading] = useState(false);

  const [showGrid, setShowGrid] = useState(true);
  const [showMapLayer, setShowMapLayer] = useState(true);
  const [showTokenLayer, setShowTokenLayer] = useState(true);
  const [showGmLayer, setShowGmLayer] = useState(true);

  const [gridSize, setGridSize] = useState(70);
  const [gridOpacity, setGridOpacity] = useState(0.35);
  const [gridColor, setGridColor] = useState('#334466');
  const [isGridMenuOpen, setIsGridMenuOpen] = useState(false);
  const [mapScaleMultiplier, setMapScaleMultiplier] = useState(1);
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [selectedTokenIds, setSelectedTokenIds] = useState([]);
  const selectedCanvasObject = useMemo(
    () => tokens.find((item) => String(item.id) === String(selectedTokenId)) || null,
    [selectedTokenId, tokens]
  );
  const [cameraResetKey, setCameraResetKey] = useState(0);
  const [activeTool, setActiveTool] = useState('select');
  const [drawColor, setDrawColor] = useState('#410202');
  const [drawWidth, setDrawWidth] = useState(3);
  const [drawOpacity, setDrawOpacity] = useState(1);
  const [drawMode, setDrawMode] = useState('pen'); // 'pen' | 'pencil' | 'marker' | 'highlight'
  const [shapeTool, setShapeTool] = useState('rect');
  const [fogMode, setFogMode] = useState('reveal');
  const [fogShape, setFogShape] = useState('rect');
  const [fogDmOpacity, setFogDmOpacity] = useState(0.35);
  const [fogPlayerOpacity, setFogPlayerOpacity] = useState(1);
  const [isToolDockCollapsed, setIsToolDockCollapsed] = useState(false);
  const [isLeftToolbarCollapsed, setIsLeftToolbarCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [drawFillColor, setDrawFillColor] = useState('#ff3333');
  const [drawHasFill, setDrawHasFill] = useState(false);
  const [drawFillOpacity, setDrawFillOpacity] = useState(0.18);
  const [drawFontFamily, setDrawFontFamily] = useState('Rajdhani');
  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
  const [drawFontSize, setDrawFontSize] = useState(18);
  const [drawFontBold, setDrawFontBold] = useState(false);
  const [drawFontItalic, setDrawFontItalic] = useState(false);
  const [drawTextUnderline, setDrawTextUnderline] = useState(false);
  const [drawTextStrokeColor, setDrawTextStrokeColor] = useState('#080b0f');
  const [drawTextStrokeWidth, setDrawTextStrokeWidth] = useState(0);
  const [drawTextShadow, setDrawTextShadow] = useState(true);
  const [drawTextAlign, setDrawTextAlign] = useState('left');
  const [drawTextBgColor, setDrawTextBgColor] = useState('#080808');
  const [drawTextBgOpacity, setDrawTextBgOpacity] = useState(0.72);
  const [drawTextBg, setDrawTextBg] = useState(false);
  const [eraseSize, setEraseSize] = useState(28);
  const [rulerUnit, setRulerUnit] = useState('m');
  const [rulerMultiplier, setRulerMultiplier] = useState(1.5);
  const [rulerMoveBudget] = useState(0);
  const [activeRulers, setActiveRulers] = useState({});
  const rulerUpdateThrottleRef = useRef(0);
  const localRulerActiveRef = useRef(false);
  const [undoSignal, setUndoSignal] = useState(0);
  const [redoSignal, setRedoSignal] = useState(0);

  const [activeEditorLayer, setActiveEditorLayer] = useState('token');
  const activeEditorLayerRef = useRef('token');
  useEffect(() => { activeEditorLayerRef.current = activeEditorLayer; }, [activeEditorLayer]);
  useEffect(() => {
    if (activeTool !== 'text') setIsFontMenuOpen(false);
  }, [activeTool]);
  const scenesRef = useRef(scenes);
  const historyRef = useRef([]);
  const redoRef = useRef([]);
  const isRestoringHistoryRef = useRef(false);
  useEffect(() => { scenesRef.current = scenes; }, [scenes]);
  const [isLayersMenuOpen, setIsLayersMenuOpen] = useState(false);
  const [chatIdentity, setChatIdentity] = useState('character');
  const [editingLabel, setEditingLabel] = useState(null); // { id, currentLabel, screenX, screenY }
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [openNpcModal, setOpenNpcModal] = useState(false);
  const [openEventDeckModal, setOpenEventDeckModal] = useState(false);

  const [rightTab, setRightTab] = useState('chat');
  const [selectedSheetCharId, setSelectedSheetCharId] = useState('');
  const [sheetOverlayCharId, setSheetOverlayCharId] = useState('');
  const [sheetSearch, setSheetSearch] = useState('');
  const [sheetFilter, setSheetFilter] = useState('all');

  const [rollMode, setRollMode] = useState('skill');
  const [manualRollFormula, setManualRollFormula] = useState('1d6');
  const [selectedSkillKey, setSelectedSkillKey] = useState('');
  const [selectedInstinctKey, setSelectedInstinctKey] = useState('');
  const [assimilateInstinctA, setAssimilateInstinctA] = useState('');
  const [assimilateInstinctB, setAssimilateInstinctB] = useState('');
  const [useDeterminationForRoll, setUseDeterminationForRoll] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [pendingRoll, setPendingRoll] = useState(null);
  const [recentRolls, setRecentRolls] = useState([]);
  const [systemMessages, setSystemMessages] = useState([]);

  const [textMessages, setTextMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatListRef = useRef(null);
  const chatEndRef = useRef(null);
  const chatShouldFollowRef = useRef(true);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [activeConflict, setActiveConflict] = useState(null);
  const [openConflictModal, setOpenConflictModal] = useState(false);
  const [isConflictLoading, setIsConflictLoading] = useState(false);
  const vttSaveTimeoutRef = useRef(null);
  const vttSaveErrorShownRef = useRef(false);
  const vttSaveQueueRef = useRef(Promise.resolve());
  const hasSocketConnectedRef = useRef(false);
  const reconnectSnapshotTimerRef = useRef(null);
  const socketIssueShownRef = useRef(false);
  const lastVttOperationErrorRef = useRef(0);
  const latestRevisionRef = useRef(0);
  const appliedMutationIdsRef = useRef(new Set());
  const pendingMutationsRef = useRef([]);
  const processingMutationRef = useRef(false);
  const processMutationQueueRef = useRef(null);
  const [pendingMutationCount, setPendingMutationCount] = useState(0);

  const gridStorageKey = useMemo(() => `vttGridSettings:${id}`, [id]);

  const myCharacter = useMemo(() => {
    if (!campaignData?.players || !user?._id) return null;
    const mine = campaignData.players.find((entry) => String(entry?.user?._id || entry?.user) === String(user._id));
    return mine?.character || null;
  }, [campaignData, user]);

  const sheetCharacters = useMemo(() => isMaster ? availableChars : (myCharacter?._id ? availableChars.filter((char) => String(char._id) === String(myCharacter._id)) : []), [availableChars, isMaster, myCharacter]);
  const tokensByCharacterId = useMemo(() => {
    const map = new Map();
    tokens.forEach((tokenItem) => {
      if (!tokenItem.characterId) return;
      const key = String(tokenItem.characterId);
      map.set(key, [...(map.get(key) || []), tokenItem]);
    });
    return map;
  }, [tokens]);
  const filteredSheetCharacters = useMemo(() => {
    const query = sheetSearch.trim().toLowerCase();
    return sheetCharacters.filter((char) => {
      const isOwn = myCharacter?._id && String(char._id) === String(myCharacter._id);
      const isNpc = Boolean(char.isNpc || char.type === 'npc' || char.kind === 'npc');
      if (sheetFilter === 'mine' && !isOwn) return false;
      if (sheetFilter === 'npcs' && !isNpc) return false;
      if (sheetFilter === 'players' && isNpc) return false;
      if (!query) return true;
      return `${char.name || ''} ${char.occupation || ''} ${char.generation || ''}`.toLowerCase().includes(query);
    });
  }, [myCharacter, sheetCharacters, sheetFilter, sheetSearch]);
  const selectedSheetCharacter = useMemo(() => filteredSheetCharacters.find((char) => String(char._id) === String(selectedSheetCharId)) || filteredSheetCharacters[0] || null, [filteredSheetCharacters, selectedSheetCharId]);
  const selectedSheetHealth = useMemo(() => selectedSheetCharacter ? getHealthSummary(selectedSheetCharacter) : null, [selectedSheetCharacter]);
  const activeRollCharacter = useMemo(() => isMaster ? selectedSheetCharacter : (myCharacter || selectedSheetCharacter || null), [isMaster, myCharacter, selectedSheetCharacter]);

  const activeCharacterSkills = useMemo(() => getCharacterSkills(activeRollCharacter), [activeRollCharacter]);
  const activeCharacterInstincts = useMemo(() => activeRollCharacter?.instincts || {}, [activeRollCharacter]);
  const availableSkillKeys = useMemo(() => Object.keys(activeCharacterSkills), [activeCharacterSkills]);
  const availableInstinctKeys = useMemo(() => Object.keys(activeCharacterInstincts), [activeCharacterInstincts]);
  const currentUserId = String(user?._id || user?.id || user?.userId || '');
  const currentUserName = user?.name || activeRollCharacter?.name || 'Jogador';
  const rulerColor = useMemo(() => {
    const seed = currentUserId || currentUserName || 'ruler';
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 360;
    return `hsl(${hash}, 92%, 62%)`;
  }, [currentUserId, currentUserName]);

  const charNameById = useMemo(() => {
    const map = new Map();
    availableChars.forEach((char) => map.set(String(char._id), char.name));
    return map;
  }, [availableChars]);

  const chatEntries = useMemo(() => {
    const rollEntries = recentRolls.map((roll) => ({ type: 'roll', ts: new Date(roll.timestamp || Date.now()).getTime(), data: roll }));
    const systemEntries = systemMessages.map((msg) => ({ type: 'system', ts: msg.timestamp, data: msg }));
    const textEntries = textMessages.map((msg) => ({ type: 'text', ts: new Date(msg.timestamp || Date.now()).getTime(), data: msg }));
    return [...rollEntries, ...systemEntries, ...textEntries].sort((a, b) => a.ts - b.ts);
  }, [recentRolls, systemMessages, textMessages]);

  const scrollChatToEnd = useCallback((behavior = 'smooth') => {
    chatEndRef.current?.scrollIntoView({ behavior, block: 'end' });
    chatShouldFollowRef.current = true;
    setUnreadChatCount(0);
  }, []);

  const handleChatScroll = useCallback(() => {
    const viewport = chatListRef.current;
    if (!viewport) return;
    const distanceFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    chatShouldFollowRef.current = distanceFromBottom < 72;
    if (chatShouldFollowRef.current) setUnreadChatCount(0);
  }, []);

  useEffect(() => {
    if (!chatEntries.length || rightTab !== 'chat') return;
    if (chatShouldFollowRef.current) {
      window.requestAnimationFrame(() => scrollChatToEnd(chatEntries.length === 1 ? 'auto' : 'smooth'));
    } else {
      setUnreadChatCount((count) => count + 1);
    }
  }, [chatEntries.length, rightTab, scrollChatToEnd]);

  useEffect(() => {
    if (rightTab !== 'chat') return;
    window.requestAnimationFrame(() => scrollChatToEnd('auto'));
  }, [rightTab, scrollChatToEnd]);
  const activeSceneRulers = useMemo(() => Object.fromEntries(
    Object.entries(activeRulers).filter(([, ruler]) => String(ruler?.sceneId) === String(viewingSceneId))
  ), [activeRulers, viewingSceneId]);

  const applyCharacterHealthPatch = useCallback((payload = {}) => {
    if (!payload.characterId) return;
    const characterPatch = {
      ...(Array.isArray(payload.healthLevels) ? { healthLevels: payload.healthLevels } : {}),
      ...(payload.currentHealthLevel !== undefined ? { currentHealthLevel: payload.currentHealthLevel } : {}),
      ...(payload.instincts ? { instincts: payload.instincts } : {}),
    };
    setAvailableChars((prev) => prev.map((char) => (
      String(char._id) === String(payload.characterId) ? { ...char, ...characterPatch } : char
    )));
    setCampaignData((prev) => {
      if (!prev?.players) return prev;
      return {
        ...prev,
        players: prev.players.map((entry) => {
          const entryCharacter = entry?.character;
          if (!entryCharacter || String(entryCharacter._id) !== String(payload.characterId)) return entry;
          return { ...entry, character: { ...entryCharacter, ...characterPatch } };
        }),
      };
    });
  }, []);

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  useEffect(() => {
  const handleEmbeddedSheetMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      const payload = event.data || {};
      if (payload.type === 'ASSIMILACAO_CHARACTER_ROLL_CREATED' && payload.roll) {
        setRecentRolls((prev) => mergeChatItems(prev, payload.roll, 'roll', 100));
        return;
      }
      if (payload.type !== 'ASSIMILACAO_CHARACTER_HEALTH_UPDATED' || !payload.characterId) return;

      applyCharacterHealthPatch(payload);
    };

    window.addEventListener('message', handleEmbeddedSheetMessage);
    return () => window.removeEventListener('message', handleEmbeddedSheetMessage);
  }, [applyCharacterHealthPatch]);

  // RASTREADOR DE MOUSE E INTERCEPTADOR DE COLAR (CTRL+V)
  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    const handlePaste = (e) => {
      const tag = e.target.tagName.toLowerCase();
      if (['input', 'textarea'].includes(tag) || e.target.isContentEditable) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let item of items) {
        if (item.type.indexOf('image') === 0) {
          const file = item.getAsFile();
          if (file) {
            const url = URL.createObjectURL(file);
            setRadialMenuData({ file, previewUrl: url, x: mousePosRef.current.x, y: mousePosRef.current.y });
          }
        }
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  const fetchRecentRolls = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/api/campaigns/${id}/recent-rolls`, { headers: { Authorization: `Bearer ${token}` } });
      setRecentRolls((prev) => mergeChatItems(prev, res.data || [], 'roll', 100));
    } catch (error) {}
  }, [id, token]);

  const fetchMyAssets = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/api/my-assets`, { headers: { Authorization: `Bearer ${token}` } });
      setMyAssets(res.data || []);
    } catch (error) { console.error('Erro ao buscar assets:', error); }
  }, [token]);

  const fetchConflict = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/api/campaigns/${id}/conflict`, { headers: { Authorization: `Bearer ${token}` } });
      setActiveConflict(res.data || null);
    } catch (error) { setActiveConflict(null); }
  }, [id, token]);

  const handleStartConflict = async (conflictData) => {
    setIsConflictLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/campaigns/${id}/conflict`, conflictData, { headers: { Authorization: `Bearer ${token}` } });
      setActiveConflict(response.data || null);
      setOpenConflictModal(false);
    } catch (error) {} finally { setIsConflictLoading(false); }
  };

  const handleProgressUpdate = async (type, index, amount, activationIndex = null) => {
    if (isConflictLoading) return;
    setIsConflictLoading(true);
    const payload = { type, index, amount };
    if (activationIndex !== null) payload.activationIndex = activationIndex;
    try {
      const response = await axios.put(`${API_BASE}/api/campaigns/${id}/conflict/progress`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setActiveConflict(response.data || null);
    } catch (error) {} finally { setIsConflictLoading(false); }
  };

  const handleEndConflict = async () => {
    const confirmed = await confirm({
      title: 'Encerrar conflito',
      message: 'Encerrar conflito atual?',
      tone: 'warning',
      confirmLabel: 'Encerrar',
    });
    if (!confirmed) return;
    setIsConflictLoading(true);
    try {
      await axios.delete(`${API_BASE}/api/campaigns/${id}/conflict`, { headers: { Authorization: `Bearer ${token}` } });
      setActiveConflict(null);
    } catch (error) {} finally { setIsConflictLoading(false); }
  };

  const rememberMutationId = useCallback((mutationId) => {
    if (!mutationId) return;
    const ids = appliedMutationIdsRef.current;
    ids.add(mutationId);
    if (ids.size > 500) ids.delete(ids.values().next().value);
  }, []);

  const acceptIncomingMutation = useCallback(({ revision, clientMutationId } = {}) => {
    if (clientMutationId && appliedMutationIdsRef.current.has(clientMutationId)) return false;
    const incomingRevision = Number(revision);
    if (Number.isFinite(incomingRevision)) {
      if (incomingRevision <= latestRevisionRef.current) return false;
      latestRevisionRef.current = incomingRevision;
    }
    rememberMutationId(clientMutationId);
    return true;
  }, [rememberMutationId]);

  const requestVttResync = useCallback((message = 'Alteração não sincronizada. Restaurando estado da mesa...') => {
    setConnectionStatus('syncing');
    dispatchToast({ message, type: 'warning' });
    socket?.emit('requestVttSnapshot', { campaignId: id });
  }, [id, socket]);

  const processMutationQueue = useCallback(() => {
    if (!socket?.connected || connectionStatus !== 'connected' || processingMutationRef.current) return;
    const current = pendingMutationsRef.current[0];
    if (!current) return;
    processingMutationRef.current = true;
    const payload = { ...current.payload, campaignId: id, revisionBase: latestRevisionRef.current, clientMutationId: current.clientMutationId };
    const startedAt = performance.now();

    socket.timeout(8000).emit(current.eventName, payload, (timeoutError, ack) => {
      processingMutationRef.current = false;
      if (!timeoutError && ack?.ok) {
        setVttPerformanceMetric('lastAckMs', Math.round(performance.now() - startedAt));
        latestRevisionRef.current = Math.max(latestRevisionRef.current, Number(ack.revision || 0));
        rememberMutationId(current.clientMutationId);
        pendingMutationsRef.current.shift();
        setPendingMutationCount(pendingMutationsRef.current.length);
        if (process.env.REACT_APP_DEBUG_VTT_SYNC === 'true') {
          console.log('[VTT_SYNC]', { event: current.eventName, revision: ack.revision, ackMs: Math.round(performance.now() - startedAt) });
        }
        window.setTimeout(() => processMutationQueueRef.current?.(), 0);
        return;
      }

      current.attempts += 1;
      if (ack?.stale || ack?.code === 'STALE_REVISION') {
        requestVttResync();
        return;
      }
      if (!socket.connected) return;
      if (current.attempts < 3) {
        window.setTimeout(() => processMutationQueueRef.current?.(), 500 * current.attempts);
        return;
      }
      pendingMutationsRef.current.shift();
      setPendingMutationCount(pendingMutationsRef.current.length);
      requestVttResync(ack?.message || 'Não foi possível confirmar uma alteração. Restaurando a mesa...');
    });
  }, [connectionStatus, id, rememberMutationId, requestVttResync, socket]);

  processMutationQueueRef.current = processMutationQueue;

  const emitCriticalMutation = useCallback((eventName, payload) => {
    const entry = { eventName, payload, clientMutationId: createMutationId(), attempts: 0, createdAt: Date.now() };
    pendingMutationsRef.current.push(entry);
    if (pendingMutationsRef.current.length > 200) pendingMutationsRef.current.shift();
    setPendingMutationCount(pendingMutationsRef.current.length);
    processMutationQueueRef.current?.();
    return entry.clientMutationId;
  }, []);

  useEffect(() => {
    if (connectionStatus === 'connected') processMutationQueueRef.current?.();
  }, [connectionStatus]);

  useEffect(() => {
    const savedGrid = localStorage.getItem(gridStorageKey);
    if (savedGrid) {
      try {
        const parsed = JSON.parse(savedGrid);
        if (typeof parsed.showGrid === 'boolean') setShowGrid(parsed.showGrid);
        if (typeof parsed.showMapLayer === 'boolean') setShowMapLayer(parsed.showMapLayer);
        if (typeof parsed.showTokenLayer === 'boolean') setShowTokenLayer(parsed.showTokenLayer);
        if (typeof parsed.showGmLayer === 'boolean') setShowGmLayer(parsed.showGmLayer);
        if (typeof parsed.gridSize === 'number') setGridSize(parsed.gridSize);
        if (typeof parsed.gridOpacity === 'number') setGridOpacity(parsed.gridOpacity);
        if (typeof parsed.mapScaleMultiplier === 'number') setMapScaleMultiplier(parsed.mapScaleMultiplier);
      } catch (error) {}
    }

    const loadCampaign = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/campaigns/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setCampaignData(res.data);
        latestRevisionRef.current = Math.max(0, Number(res.data.vttState?.revision || 0));
        const masterId = res.data.master?._id || res.data.master;
        setIsMaster(Boolean(user && String(masterId) === String(user._id)));

        if (res.data.players) setAvailableChars(res.data.players.filter(p => p.character).map(p => p.character));
        if (res.data.vttState?.scenes?.length) setScenes(res.data.vttState.scenes);
        if (res.data.vttState?.folders?.length) setFolders(res.data.vttState.folders);
        if (res.data.vttState?.assetLibrary?.length) setAssetLibrary(res.data.vttState.assetLibrary);

        if (res.data.vttState?.activeSceneId) {
          setPartySceneId(res.data.vttState.activeSceneId);
          changeViewingScene(res.data.vttState.activeSceneId);
        }
        if (res.data.vttState?.chatMessages?.length) {
          setTextMessages((prev) => mergeChatItems(prev, res.data.vttState.chatMessages, 'text', 200));
        }
        setHasLoadedCampaign(true);
      } catch (error) { console.error('Erro ao carregar campanha:', error); }
    };

    if (!user || !token) return undefined;

    loadCampaign();
    fetchRecentRolls();
    fetchConflict();
    fetchMyAssets();

    let newSocket;
    const connectTimer = window.setTimeout(() => {
      newSocket = io(API_BASE, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 500,
        reconnectionDelayMax: 5000,
        timeout: 10000,
      });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        const isReconnect = hasSocketConnectedRef.current;
        hasSocketConnectedRef.current = true;
        setConnectionStatus(isReconnect ? 'syncing' : 'connected');
        newSocket.emit('joinCampaign', id);
        if (isReconnect) {
          window.clearTimeout(reconnectSnapshotTimerRef.current);
          reconnectSnapshotTimerRef.current = window.setTimeout(() => {
            newSocket.emit('requestVttSnapshot', { campaignId: id });
          }, 1200);
        }
      });
      newSocket.on('disconnect', (reason) => {
        if (reason === 'io client disconnect') return;
        setConnectionStatus('reconnecting');
        if (!socketIssueShownRef.current) {
          dispatchToast({ message: 'Conexão instável. Tentando reconectar sem perder a sessão...', type: 'warning' });
          socketIssueShownRef.current = true;
        }
      });
      newSocket.io.on('reconnect_attempt', () => setConnectionStatus('reconnecting'));
      newSocket.on('connect_error', (error) => {
        const isAuthError = /acesso negado|token inv[aá]lido|unauthorized/i.test(String(error?.message || ''));
        if (isAuthError) {
          setConnectionStatus('error');
          dispatchToast({ message: 'Acesso negado ao VTT. Faça login novamente.', type: 'error' });
          navigate(`/campaign-lobby/${id}`);
          return;
        }
        setConnectionStatus('reconnecting');
        if (!socketIssueShownRef.current) {
          dispatchToast({ message: 'Servidor indisponível. A reconexão será automática.', type: 'warning' });
          socketIssueShownRef.current = true;
        }
      });

      newSocket.on('systemMessage', (payload) => setSystemMessages((prev) => [...prev, { message: payload?.message || 'Evento no VTT', timestamp: Date.now() }].slice(-100)));
      newSocket.on('vttOperationError', ({ message } = {}) => {
        const now = Date.now();
        if (now - lastVttOperationErrorRef.current < 2500) return;
        lastVttOperationErrorRef.current = now;
        dispatchToast({ message: message || 'Uma alteração não pôde ser salva. Tente novamente.', type: 'error' });
      });
      newSocket.on('vttRevisionAdvanced', ({ revision } = {}) => {
        const incomingRevision = Number(revision);
        if (Number.isFinite(incomingRevision) && incomingRevision > latestRevisionRef.current) {
          latestRevisionRef.current = incomingRevision;
        }
      });
      newSocket.on('chatMessage', (payload) => setTextMessages((prev) => mergeChatItems(prev, payload, 'text', 200)));
      newSocket.on('rollCreated', ({ campaignId, roll } = {}) => {
        if (String(campaignId) !== String(id) || !roll) return;
        debugVttRoll('[ROLL] socket received', roll);
        setRecentRolls((prev) => mergeChatItems(prev, roll, 'roll', 100));
      });
      newSocket.on('characterHealthUpdated', applyCharacterHealthPatch);

      newSocket.on('activeSceneChanged', (incoming) => {
        const sceneId = typeof incoming === 'string' ? incoming : incoming?.sceneId;
        if (typeof incoming === 'object' && !acceptIncomingMutation(incoming)) return;
        setPartySceneId(sceneId);
        changeViewingScene(sceneId);
        setSystemMessages((prev) => [...prev, { message: 'Atenção: A party foi movida para uma nova cena!', timestamp: Date.now() }]);
      });
      newSocket.on('sceneCreated', (newScene) => setScenes((prev) => [...prev, newScene]));
      newSocket.on('sceneDeleted', ({ sceneId, nextSceneId, activeSceneChanged, revision, clientMutationId } = {}) => {
        if (!acceptIncomingMutation({ revision, clientMutationId }) || !sceneId) return;
        setScenes((prev) => prev.filter((scene) => String(scene.id) !== String(sceneId)));
        setViewingSceneId((current) => (String(current) === String(sceneId) ? nextSceneId : current));
        if (activeSceneChanged && nextSceneId) setPartySceneId(nextSceneId);
        setSelectedTokenId(null);
        setSelectedTokenIds([]);
      });
      newSocket.on('vttSnapshot', ({ vttState }) => {
        if (!vttState) return;
        const incomingRevision = Number(vttState.revision || 0);
        if (incomingRevision < latestRevisionRef.current) return;
        latestRevisionRef.current = incomingRevision;
        if (Array.isArray(vttState.scenes)) setScenes(vttState.scenes);
        if (Array.isArray(vttState.folders)) setFolders(vttState.folders);
        if (Array.isArray(vttState.assetLibrary)) setAssetLibrary(vttState.assetLibrary);
        if (Array.isArray(vttState.chatMessages)) {
          setTextMessages((prev) => mergeChatItems(prev, vttState.chatMessages, 'text', 200));
        }
        if (vttState.activeSceneId) {
          setPartySceneId(vttState.activeSceneId);
          changeViewingScene(vttState.activeSceneId);
        }
        setConnectionStatus('connected');
        if (socketIssueShownRef.current) {
          dispatchToast({ message: 'Conexão com a mesa restabelecida e sincronizada.', type: 'success' });
          socketIssueShownRef.current = false;
        }
      });
      newSocket.on('sceneUpdated', ({ sceneId, revision, clientMutationId, ...scenePatch }) => {
        if (!acceptIncomingMutation({ revision, clientMutationId })) return;
        setScenes((prev) => prev.map(s => {
        if (s.id !== sceneId) return s;
        return {
          ...s,
          ...scenePatch,
          ...(scenePatch.fogOfWar !== undefined ? { fogOfWar: normalizeFogOfWar(scenePatch.fogOfWar) } : {}),
        };
        }));
      });
      newSocket.on('sceneStateReplaced', ({ sceneId, scene, revision, clientMutationId }) => {
        if (!acceptIncomingMutation({ revision, clientMutationId })) return;
        if (!sceneId || !scene) return;
        const normalizedScene = {
          ...scene,
          ...(scene.fogOfWar !== undefined ? { fogOfWar: normalizeFogOfWar(scene.fogOfWar) } : {}),
        };
        setScenes((prev) => prev.map((s) => (String(s.id) === String(sceneId) ? normalizedScene : s)));
        setSelectedTokenId((prev) => (
          normalizedScene.tokens?.some((token) => String(token.id) === String(prev)) ? prev : null
        ));
        setSelectedTokenIds((prev) => prev.filter((tokenId) => (
          normalizedScene.tokens?.some((token) => String(token.id) === String(tokenId))
        )));
      });
      newSocket.on('fogUpdated', ({ sceneId, fogOfWar, revision, clientMutationId }) => {
        if (!acceptIncomingMutation({ revision, clientMutationId })) return;
        if (!sceneId) return;
        setScenes((prev) => {
          const nextScenes = prev.map((s) => (
            String(s.id) === String(sceneId)
              ? { ...s, fogOfWar: normalizeFogOfWar(fogOfWar) }
              : s
          ));
          scenesRef.current = nextScenes;
          return nextScenes;
        });
      });
      newSocket.on('rulerStarted', (payload) => {
        if (!payload?.userId || String(payload.userId) === String(currentUserId)) return;
        setActiveRulers((prev) => ({ ...prev, [payload.userId]: payload }));
      });
      newSocket.on('rulerUpdated', (payload) => {
        if (!payload?.userId || String(payload.userId) === String(currentUserId)) return;
        setActiveRulers((prev) => ({ ...prev, [payload.userId]: payload }));
      });
      newSocket.on('rulerEnded', ({ userId }) => {
        if (!userId) return;
        setActiveRulers((prev) => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      });
      newSocket.on('folderCreated', (newFolder) => setFolders((prev) => [...prev, newFolder]));
      newSocket.on('assetAdded', (newAsset) => setAssetLibrary((prev) => [...prev, newAsset]));

      newSocket.on('tokenMoved', ({ sceneId, tokenId, x, y, revision, clientMutationId }) => {
        if (!acceptIncomingMutation({ revision, clientMutationId })) return;
        setScenes(prev => prev.map(s => s.id !== sceneId ? s : { ...s, tokens: s.tokens.map(t => t.id === tokenId ? { ...t, x, y } : t) }));
      });
      newSocket.on('tokenUpdated', ({ sceneId, tokenId, patch, revision, clientMutationId }) => {
        if (!acceptIncomingMutation({ revision, clientMutationId })) return;
        setScenes(prev => prev.map(s => s.id !== sceneId ? s : { ...s, tokens: s.tokens.map(t => t.id === tokenId ? { ...t, ...patch } : t) }));
      });
      newSocket.on('visibilityChanged', ({ sceneId, tokenId, isVisible, revision, clientMutationId }) => {
        if (!acceptIncomingMutation({ revision, clientMutationId })) return;
        setScenes(prev => prev.map(s => s.id !== sceneId ? s : { ...s, tokens: s.tokens.map(t => t.id === tokenId ? { ...t, isVisible } : t) }));
      });
      newSocket.on('tokenAdded', ({ sceneId, token, revision, clientMutationId }) => {
        if (!acceptIncomingMutation({ revision, clientMutationId })) return;
        setScenes(prev => prev.map(s => s.id !== sceneId ? s : { ...s, tokens: s.tokens.some((item) => String(item.id) === String(token.id)) ? s.tokens : [...s.tokens, token] }));
      });
      newSocket.on('tokenRemoved', ({ sceneId, tokenId, revision, clientMutationId }) => {
        if (!acceptIncomingMutation({ revision, clientMutationId })) return;
        setScenes(prev => prev.map(s => s.id !== sceneId ? s : { ...s, tokens: s.tokens.filter(t => t.id !== tokenId) }));
        setSelectedTokenId((prev) => (prev === tokenId ? null : prev));
      });
      newSocket.on('drawingAdded', ({ sceneId, drawing, revision, clientMutationId }) => {
        if (!acceptIncomingMutation({ revision, clientMutationId })) return;
        setScenes(prev => prev.map(s => s.id !== sceneId ? s : { ...s, drawings: (s.drawings || []).some((item) => String(item.id) === String(drawing.id)) ? s.drawings : [...(s.drawings || []), drawing] }));
      });
      newSocket.on('drawingUpdated', ({ sceneId, drawingId, patch, revision, clientMutationId }) => {
        if (!acceptIncomingMutation({ revision, clientMutationId })) return;
        setScenes(prev => prev.map(s => s.id !== sceneId ? s : { ...s, drawings: (s.drawings || []).map(d => d.id === drawingId ? { ...d, ...patch } : d) }));
      });
      newSocket.on('drawingRemoved', ({ sceneId, drawingId, revision, clientMutationId }) => {
        if (!acceptIncomingMutation({ revision, clientMutationId })) return;
        setScenes(prev => prev.map(s => s.id !== sceneId ? s : { ...s, drawings: (s.drawings || []).filter(d => d.id !== drawingId) }));
      });
    }, 100);

    return () => {
      window.clearTimeout(connectTimer);
      window.clearTimeout(reconnectSnapshotTimerRef.current);
      hasSocketConnectedRef.current = false;
      if (newSocket) {
        newSocket.removeAllListeners();
        newSocket.disconnect();
      }
    };
  }, [acceptIncomingMutation, applyCharacterHealthPatch, changeViewingScene, currentUserId, fetchConflict, fetchMyAssets, fetchRecentRolls, gridStorageKey, id, navigate, token, user]);

  useEffect(() => {
    if (!hasLoadedCampaign || !isMaster || !token || !id || connectionStatus !== 'connected' || pendingMutationCount > 0) return undefined;

    window.clearTimeout(vttSaveTimeoutRef.current);
    vttSaveTimeoutRef.current = window.setTimeout(() => {
      const snapshot = {
        activeSceneId: partySceneId,
        scenes,
        folders,
        assetLibrary,
        chatMessages: textMessages.slice(-200),
      };
      vttSaveQueueRef.current = vttSaveQueueRef.current
        .catch(() => undefined)
        .then(() => axios.put(
          `${API_BASE}/api/campaigns/${id}/vtt-state`,
          { vttState: snapshot, revisionBase: latestRevisionRef.current },
          { headers: { Authorization: `Bearer ${token}` } },
        ))
        .then((response) => {
          latestRevisionRef.current = Math.max(latestRevisionRef.current, Number(response.data?.revision || 0));
          vttSaveErrorShownRef.current = false;
        })
        .catch((error) => {
          if (error.response?.status === 409) {
            requestVttResync('A mesa mudou durante o salvamento. Sincronizando a versão mais recente...');
            return;
          }
          if (!vttSaveErrorShownRef.current) {
            dispatchToast({ message: 'Não foi possível salvar o VTT no servidor.', type: 'error' });
            vttSaveErrorShownRef.current = true;
          }
        });
    }, 650);

    return () => window.clearTimeout(vttSaveTimeoutRef.current);
  }, [assetLibrary, connectionStatus, folders, hasLoadedCampaign, id, isMaster, partySceneId, pendingMutationCount, requestVttResync, scenes, textMessages, token]);

  useEffect(() => { localStorage.setItem(gridStorageKey, JSON.stringify({ showGrid, showMapLayer, showTokenLayer, showGmLayer, gridSize, gridOpacity, mapScaleMultiplier })); }, [gridOpacity, gridSize, gridStorageKey, mapScaleMultiplier, showGrid, showMapLayer, showTokenLayer, showGmLayer]);
  useEffect(() => {
    if (!filteredSheetCharacters.length) return;
    if (!selectedSheetCharId || !filteredSheetCharacters.some((char) => String(char._id) === String(selectedSheetCharId))) {
      setSelectedSheetCharId(filteredSheetCharacters[0]._id);
    }
  }, [filteredSheetCharacters, selectedSheetCharId]);
  useEffect(() => {
    if (!selectedSkillKey && availableSkillKeys[0]) setSelectedSkillKey(availableSkillKeys[0]);
    if (!selectedInstinctKey && availableInstinctKeys[0]) setSelectedInstinctKey(availableInstinctKeys[0]);
    if (!assimilateInstinctA && availableInstinctKeys[0]) setAssimilateInstinctA(availableInstinctKeys[0]);
    if (!assimilateInstinctB && availableInstinctKeys[1]) setAssimilateInstinctB(availableInstinctKeys[1]);
  }, [assimilateInstinctA, assimilateInstinctB, availableInstinctKeys, availableSkillKeys, selectedInstinctKey, selectedSkillKey]);
  useEffect(() => {
    if (!token || !id) return undefined;
    const interval = setInterval(() => { fetchRecentRolls(); fetchConflict(); }, 3500);
    return () => clearInterval(interval);
  }, [fetchConflict, fetchRecentRolls, id, token]);

  const cloneScenesSnapshot = useCallback((value = scenesRef.current) => JSON.parse(JSON.stringify(value || [])), []);

  const recordHistory = useCallback(() => {
    if (isRestoringHistoryRef.current) return;
    historyRef.current.push(cloneScenesSnapshot());
    if (historyRef.current.length > MAX_VTT_HISTORY) historyRef.current.shift();
    redoRef.current = [];
  }, [cloneScenesSnapshot]);

  const restoreScenesSnapshot = useCallback((snapshot) => {
    isRestoringHistoryRef.current = true;
    setScenes(cloneScenesSnapshot(snapshot));
    setSelectedTokenId(null);
    setSelectedTokenIds([]);
    window.setTimeout(() => { isRestoringHistoryRef.current = false; }, 0);
  }, [cloneScenesSnapshot]);

  const undoVtt = useCallback(() => {
    if (connectionStatus !== 'connected') {
      dispatchToast({ message: 'Aguarde a sincronização para desfazer alterações.', type: 'warning' });
      return;
    }
    const previous = historyRef.current.pop();
    if (!previous) return;
    redoRef.current.push(cloneScenesSnapshot());
    window.clearTimeout(vttSaveTimeoutRef.current);
    restoreScenesSnapshot(previous);
    const restoredScene = previous.find((scene) => String(scene.id) === String(viewingSceneId));
    if (restoredScene && isMaster) {
      emitCriticalMutation('sceneStateReplaced', { sceneId: viewingSceneId, scene: restoredScene, action: 'undo' });
    }
  }, [cloneScenesSnapshot, connectionStatus, emitCriticalMutation, isMaster, restoreScenesSnapshot, viewingSceneId]);

  const redoVtt = useCallback(() => {
    if (connectionStatus !== 'connected') {
      dispatchToast({ message: 'Aguarde a sincronização para refazer alterações.', type: 'warning' });
      return;
    }
    const next = redoRef.current.pop();
    if (!next) return;
    historyRef.current.push(cloneScenesSnapshot());
    window.clearTimeout(vttSaveTimeoutRef.current);
    restoreScenesSnapshot(next);
    const restoredScene = next.find((scene) => String(scene.id) === String(viewingSceneId));
    if (restoredScene && isMaster) {
      emitCriticalMutation('sceneStateReplaced', { sceneId: viewingSceneId, scene: restoredScene, action: 'redo' });
    }
  }, [cloneScenesSnapshot, connectionStatus, emitCriticalMutation, isMaster, restoreScenesSnapshot, viewingSceneId]);

  useEffect(() => {
    if (undoSignal) undoVtt();
  }, [undoSignal, undoVtt]);

  useEffect(() => {
    if (redoSignal) redoVtt();
  }, [redoSignal, redoVtt]);

  const emitRulerEnd = useCallback(() => {
    if (!localRulerActiveRef.current) return;
    localRulerActiveRef.current = false;
    socket?.emit('rulerEnded', { campaignId: id, sceneId: viewingSceneId, userId: currentUserId });
  }, [currentUserId, id, socket, viewingSceneId]);

  const emitRulerStart = useCallback(({ start, end, followName, unit, multiplier }) => {
    if (!socket || !currentUserId || !start || !end) return;
    localRulerActiveRef.current = true;
    const payload = {
      campaignId: id,
      sceneId: viewingSceneId,
      userId: currentUserId,
      userName: currentUserName,
      start,
      end,
      followName: followName || '',
      color: rulerColor,
      unit: unit || rulerUnit,
      multiplier: Number(multiplier ?? rulerMultiplier),
      updatedAt: Date.now(),
    };
    socket.emit('rulerStarted', payload);
  }, [currentUserId, currentUserName, id, rulerColor, rulerMultiplier, rulerUnit, socket, viewingSceneId]);

  const emitRulerUpdate = useCallback(({ start, end, followName, unit, multiplier }) => {
    if (!socket || !currentUserId || !start || !end || !localRulerActiveRef.current) return;
    const now = Date.now();
    if (now - rulerUpdateThrottleRef.current < 45) return;
    rulerUpdateThrottleRef.current = now;
    socket.emit('rulerUpdated', {
      campaignId: id,
      sceneId: viewingSceneId,
      userId: currentUserId,
      userName: currentUserName,
      start,
      end,
      followName: followName || '',
      color: rulerColor,
      unit: unit || rulerUnit,
      multiplier: Number(multiplier ?? rulerMultiplier),
      updatedAt: now,
    });
  }, [currentUserId, currentUserName, id, rulerColor, rulerMultiplier, rulerUnit, socket, viewingSceneId]);

  useEffect(() => {
    if (activeTool !== 'ruler') emitRulerEnd();
  }, [activeTool, emitRulerEnd]);

  useEffect(() => () => emitRulerEnd(), [emitRulerEnd]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = Date.now();
      setActiveRulers((prev) => {
        let changed = false;
        const next = {};
        Object.entries(prev).forEach(([key, ruler]) => {
          if (now - Number(ruler?.updatedAt || 0) <= 5000) next[key] = ruler;
          else changed = true;
        });
        return changed ? next : prev;
      });
    }, 1500);
    return () => window.clearInterval(interval);
  }, []);

  const closeFloatingMenus = useCallback((except = '') => {
    if (except !== 'grid') setIsGridMenuOpen(false);
    if (except !== 'layers') setIsLayersMenuOpen(false);
    if (except !== 'font') setIsFontMenuOpen(false);
    if (except !== 'asset') setIsAssetManagerOpen(false);
    if (except !== 'scene') setIsSceneManagerOpen(false);
    if (except !== 'context') setContextMenu(null);
    if (except !== 'radial') setRadialMenuData(null);
    if (except !== 'quick') setActiveQuickCategory(null);
  }, []);

  const openFloatingMenu = useCallback((menuName) => {
    closeFloatingMenus(menuName);
    if (menuName === 'grid') setIsGridMenuOpen(true);
    if (menuName === 'layers') setIsLayersMenuOpen(true);
    if (menuName === 'font') setIsFontMenuOpen(true);
    if (menuName === 'asset') setIsAssetManagerOpen(true);
    if (menuName === 'scene') setIsSceneManagerOpen(true);
  }, [closeFloatingMenus]);

  const toggleGridMenu = useCallback(() => {
    setIsGridMenuOpen((open) => {
      if (open) return false;
      closeFloatingMenus('grid');
      return true;
    });
  }, [closeFloatingMenus]);

  const toggleLayersMenu = useCallback(() => {
    setIsLayersMenuOpen((open) => {
      if (open) return false;
      closeFloatingMenus('layers');
      return true;
    });
  }, [closeFloatingMenus]);

  const handleCreateScene = (folderId = null) => {
    const name = window.prompt('Nome da nova cena (ex: Taverna, Floresta):');
    if (!name || name.trim() === '') return;
    recordHistory();
    const newScene = { id: `scene-${Date.now()}`, name: name.trim(), folderId, mapUrl: DEFAULT_SCENE_MAP_URL, gridConfig: { size: 70, opacity: 0.35, offsetX: 0, offsetY: 0 }, tokens: [], drawings: [] };
    setScenes(prev => [...prev, newScene]);
    changeViewingScene(newScene.id);
    if (socket) socket.emit('createScene', { campaignId: id, newScene });
  };

  const handleDeleteScene = async (scene) => {
    const currentScenes = scenesRef.current;
    if (currentScenes.length <= 1) {
      dispatchToast({ message: 'A mesa precisa manter pelo menos uma cena.', type: 'warning' });
      return;
    }

    const confirmed = await confirm({
      title: 'Excluir cena',
      message: `Excluir "${scene.name || 'Cena sem nome'}" e todo o conteúdo dela? Esta ação não pode ser desfeita.`,
      tone: 'danger',
      confirmLabel: 'Excluir cena',
    });
    if (!confirmed) return;

    const remainingScenes = currentScenes.filter((item) => String(item.id) !== String(scene.id));
    const fallbackScene = remainingScenes.find((item) => String(item.id) === String(partySceneId)) || remainingScenes[0];
    if (!fallbackScene) return;

    window.clearTimeout(vttSaveTimeoutRef.current);
    scenesRef.current = remainingScenes;
    setScenes(remainingScenes);
    if (String(viewingSceneId) === String(scene.id)) changeViewingScene(fallbackScene.id);
    if (String(partySceneId) === String(scene.id)) setPartySceneId(fallbackScene.id);
    setSelectedTokenId(null);
    setSelectedTokenIds([]);
    emitCriticalMutation('deleteScene', { sceneId: scene.id });
  };

  const handleCreateFolder = () => {
    const name = window.prompt('Nome da nova pasta:');
    if (!name || name.trim() === '') return;
    const newFolder = { id: `folder-${Date.now()}`, name: name.trim(), color: '#2d3b4f', sort: folders.length };
    setFolders(prev => [...prev, newFolder]);
    if (socket) socket.emit('createFolder', { campaignId: id, folder: newFolder });
  };

  const handleChangeViewingScene = changeViewingScene;

  const handlePullParty = () => {
    setPartySceneId(viewingSceneId);
    emitCriticalMutation('changeActiveScene', { sceneId: viewingSceneId });
    setSystemMessages((prev) => [...prev, { message: 'Você invocou a party para esta cena.', timestamp: Date.now() }]);
  };

  const handleSetSceneMap = (url) => {
    recordHistory();
    setScenes((prev) => prev.map(s => s.id === viewingSceneId ? { ...s, mapUrl: url } : s));
    emitCriticalMutation('updateScene', { sceneId: viewingSceneId, mapUrl: url });
    setIsSceneManagerOpen(false);
  };

  const updateSceneFogOfWar = useCallback((nextFog, options = {}) => {
    if (!isMaster) return;
    const normalizedFog = normalizeFogOfWar(nextFog);
    if (options.history !== false) recordHistory();
    window.clearTimeout(vttSaveTimeoutRef.current);
    const nextScenes = scenesRef.current.map((scene) => (
      String(scene.id) === String(viewingSceneId) ? { ...scene, fogOfWar: normalizedFog } : scene
    ));
    scenesRef.current = nextScenes;
    setScenes(nextScenes);
    emitCriticalMutation('fogUpdated', { sceneId: viewingSceneId, fogOfWar: normalizedFog });
  }, [emitCriticalMutation, isMaster, recordHistory, viewingSceneId]);

  const hideFullFogPage = useCallback(() => {
    updateSceneFogOfWar({
      ...currentFogOfWar,
      enabled: true,
      hiddenFullPage: true,
      dmOpacity: fogDmOpacity,
      playerOpacity: fogPlayerOpacity,
    });
  }, [currentFogOfWar, fogDmOpacity, fogPlayerOpacity, updateSceneFogOfWar]);

  const revealFullFogPage = useCallback(() => {
    updateSceneFogOfWar({
      enabled: false,
      hiddenFullPage: false,
      areas: [],
      dmOpacity: fogDmOpacity,
      playerOpacity: fogPlayerOpacity,
    }, { persistNow: true });
  }, [fogDmOpacity, fogPlayerOpacity, updateSceneFogOfWar]);

  const handleAddFogArea = useCallback((area) => {
    if (!area || !isMaster) return;
    updateSceneFogOfWar({
      ...currentFogOfWar,
      enabled: true,
      hiddenFullPage: currentFogOfWar.hiddenFullPage || area.mode === 'reveal',
      dmOpacity: fogDmOpacity,
      playerOpacity: fogPlayerOpacity,
      areas: [...(currentFogOfWar.areas || []), area],
    });
  }, [currentFogOfWar, fogDmOpacity, fogPlayerOpacity, isMaster, updateSceneFogOfWar]);

  const handleDropAssetToken = (name, url, assetType = 'token', x = window.innerWidth / 2, y = window.innerHeight / 2, extraProps = {}) => {
    recordHistory();
    const newToken = {
      id: `token-${Date.now()}`,
      name: name || 'Novo Asset',
      assetType,
      x, y,
      rotation: 0, scale: 1, avatarUrl: url,
      tokenShape: assetType === 'token' ? (extraProps.tokenShape || 'freeform') : undefined,
      isVisible: assetType === 'map' ? true : (isMaster ? false : true), characterId: null, layer: assetType === 'map' ? 'map' : 'token',
      hp: 10, maxHp: 10, status: '', auraColor: '',
      ...extraProps
    };
    setScenes(prev => prev.map(s => s.id !== viewingSceneId ? s : { ...s, tokens: [...s.tokens, newToken] }));
    emitCriticalMutation('addToken', { sceneId: viewingSceneId, token: newToken });
    setActiveQuickCategory(null);
  };

  const handleAssetShelfClick = async (asset) => {
    if (asset.type === 'map' && isMaster) {
      const useAsSceneMap = await confirm({
        title: 'Usar mapa',
        message: 'Quer definir este mapa como o fundo da cena? Se cancelar, ele entra como token na mesa.',
        tone: 'info',
        confirmLabel: 'Fundo da cena',
        cancelLabel: 'Como token',
      });

      if (useAsSceneMap) {
        handleSetSceneMap(asset.url);
      } else {
        handleDropAssetToken(asset.name, asset.url, asset.type);
      }
      return;
    }

    handleDropAssetToken(asset.name, asset.url, asset.type);
  };

  const handleDeleteAsset = async (assetId) => {
    const confirmed = await confirm({
      title: 'Excluir asset',
      message: 'Excluir este asset da sua biblioteca?',
      tone: 'danger',
      confirmLabel: 'Excluir',
    });
    if (!confirmed) return;

    await axios.delete(`${API_BASE}/api/my-assets/${assetId}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchMyAssets();
  };

  // LOGICA DO MENU RADIAL (UPLOAD E DROP)
  const handleRadialSelect = async (type) => {
    if (type === 'cancel') {
      setRadialMenuData(null);
      return;
    }

    setIsRadialUploading(true);
    const formData = new FormData();
    formData.append('assetImage', radialMenuData.file);
    formData.append('type', type);

    try {
      const res = await axios.post(`${API_BASE}/api/my-assets`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      const newAsset = res.data;
      setMyAssets(prev => [newAsset, ...prev]);

      if (type === 'map' && isMaster) {
        const scene = scenes.find((item) => item.id === viewingSceneId);
        const hasCustomBackground = scene?.mapUrl && scene.mapUrl !== DEFAULT_SCENE_MAP_URL;
        if (!hasCustomBackground) {
          handleSetSceneMap(newAsset.url);
        } else {
          const dimensions = await loadImageDimensions(newAsset.url);
          handleDropAssetToken(newAsset.name, newAsset.url, 'map', radialMenuData.x, radialMenuData.y, {
            width: dimensions.width,
            height: dimensions.height
          });
        }
      } else {
        handleDropAssetToken(newAsset.name, newAsset.url, type, radialMenuData.x, radialMenuData.y);
      }
    } catch (error) {
      dispatchToast({ message: 'Falha ao subir a imagem.', type: 'error' });
    } finally {
      setIsRadialUploading(false);
      setRadialMenuData(null);
    }
  };

  const updateTokenProps = useCallback((tokenId, patch, options = {}) => {
    if (options.history !== false) recordHistory();
    setScenes(prev => prev.map(s => s.id !== viewingSceneId ? s : { ...s, tokens: s.tokens.map(t => t.id === tokenId ? { ...t, ...patch } : t) }));
    emitCriticalMutation('updateToken', { sceneId: viewingSceneId, tokenId, patch });
  }, [emitCriticalMutation, recordHistory, viewingSceneId]);

  const getSelectedTokenGroupId = useCallback(() => {
    if (!selectedTokenIds.length) return null;
    const scene = scenes.find((item) => item.id === viewingSceneId);
    if (!scene) return null;
    const groupIds = selectedTokenIds
      .map((tokenId) => scene.tokens.find((token) => String(token.id) === String(tokenId))?.linkedGroupId)
      .filter(Boolean);
    if (!groupIds.length) return null;
    return groupIds.every((groupId) => groupId === groupIds[0]) ? groupIds[0] : null;
  }, [scenes, selectedTokenIds, viewingSceneId]);

  const lockSelectedTokens = useCallback(() => {
    if (!isMaster || selectedTokenIds.length < 2) return;
    recordHistory();
    const groupId = `lock-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
    selectedTokenIds.forEach((tokenId) => updateTokenProps(tokenId, { linkedGroupId: groupId }, { history: false }));
    setContextMenu(null);
  }, [isMaster, recordHistory, selectedTokenIds, updateTokenProps]);

  const unlockSelectedTokens = useCallback(() => {
    if (!isMaster || selectedTokenIds.length === 0) return;
    recordHistory();
    selectedTokenIds.forEach((tokenId) => updateTokenProps(tokenId, { linkedGroupId: null }, { history: false }));
    setContextMenu(null);
  }, [isMaster, recordHistory, selectedTokenIds, updateTokenProps]);

  const selectedTokenGroupId = getSelectedTokenGroupId();

  const updateTokenPosition = useCallback((tokenId, newX, newY, options = {}) => {
    const scene = scenesRef.current.find((item) => item.id === viewingSceneId);
    const movedToken = scene?.tokens.find((token) => String(token.id) === String(tokenId));
    const linkedGroupId = movedToken?.linkedGroupId;
    const affectedTokens = linkedGroupId
      ? scene?.tokens.filter((token) => token.linkedGroupId === linkedGroupId) || []
      : [movedToken].filter(Boolean);

    if (!affectedTokens.length) return;
    if (options.history !== false) recordHistory();

    const deltaX = newX - (movedToken?.x ?? newX);
    const deltaY = newY - (movedToken?.y ?? newY);

    setScenes(prev => prev.map(s => {
      if (s.id !== viewingSceneId) return s;
      return {
        ...s,
        tokens: s.tokens.map((token) => {
          if (!affectedTokens.some((affected) => String(affected.id) === String(token.id))) return token;
          if (String(token.id) === String(tokenId)) {
            return { ...token, x: newX, y: newY };
          }
          return { ...token, x: token.x + deltaX, y: token.y + deltaY };
        })
      };
    }));

    if (socket) {
      affectedTokens.forEach((token) => {
        const nextX = String(token.id) === String(tokenId) ? newX : token.x + deltaX;
        const nextY = String(token.id) === String(tokenId) ? newY : token.y + deltaY;
        emitCriticalMutation('moveToken', { sceneId: viewingSceneId, tokenId: token.id, x: nextX, y: nextY });
      });
    }
  }, [emitCriticalMutation, recordHistory, socket, viewingSceneId]);

  const toggleTokenVisibility = useCallback((tokenId) => {
    recordHistory();
    setScenes(prev => prev.map(s => {
      if (s.id !== viewingSceneId) return s;
      return {
        ...s,
        tokens: s.tokens.map(t => {
          if (t.id !== tokenId) return t;
          const newVis = !t.isVisible;
          emitCriticalMutation('toggleVisibility', { sceneId: viewingSceneId, tokenId, isVisible: newVis });
          return { ...t, isVisible: newVis };
        })
      };
    }));
  }, [emitCriticalMutation, recordHistory, viewingSceneId]);

  const handleEditCanvasLabel = useCallback((tokenId, currentLabel, screenX, screenY, mode = 'label') => {
    if (mode === 'text') {
      setSelectedTokenId(tokenId);
      setSelectedTokenIds([tokenId]);
      setActiveTool('text');
      return;
    }
    setEditingLabel({ id: tokenId, currentLabel, screenX, screenY, mode });
  }, []);

  const handleMapProfile = useCallback((id, phase, actualDuration) => {
    setVttPerformanceMetric('lastMapCommitMs', actualDuration);
  }, []);

  const canPlaceSheetToken = useCallback((char) => {
    if (!char) return false;
    if (isMaster) return true;
    return Boolean(myCharacter?._id && String(char._id) === String(myCharacter._id));
  }, [isMaster, myCharacter]);

  const spawnToken = useCallback((char) => {
    if (!canPlaceSheetToken(char)) {
      dispatchToast({ message: 'Você só pode colocar o token da sua própria ficha.', type: 'error' });
      return;
    }
    recordHistory();
    const newToken = {
      id: `${char._id}-${Date.now()}`, name: char.name, assetType: 'token',
      x: window.innerWidth / 2, y: window.innerHeight / 2,
      rotation: 0, scale: 1, avatarUrl: char.tokenImage || char.avatar || 'https://konvajs.org/assets/lion.png',
      tokenShape: 'circle',
      radius: 35,
      width: 70,
      height: 70,
      isCircularBase: !char.tokenImage,
      isVisible: isMaster ? false : true, characterId: char._id, layer: 'token',
      hp: 10, maxHp: 10, status: '', auraColor: ''
    };
    setScenes(prev => prev.map(s => s.id !== viewingSceneId ? s : { ...s, tokens: [...s.tokens, newToken] }));
    emitCriticalMutation('addToken', { sceneId: viewingSceneId, token: newToken });
  }, [canPlaceSheetToken, emitCriticalMutation, isMaster, recordHistory, viewingSceneId]);

  const handleTokenImageUpload = useCallback(async (file) => {
    if (!file || !editingToken) return;
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type || '')) {
      dispatchToast({ message: 'Envie uma imagem PNG, JPG ou WebP.', type: 'error' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      dispatchToast({ message: 'A imagem deve ter no máximo 5 MB.', type: 'error' });
      return;
    }

    setIsTokenImageUploading(true);
    const formData = new FormData();
    formData.append('mapImage', file);
    formData.append('assetType', 'token');

    try {
      const res = await axios.post(`${API_BASE}/api/campaigns/${id}/upload-map`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      const uploadedUrl = res.data.mapUrl;
      const dimensions = await loadImageDimensions(uploadedUrl).catch(() => null);
      setEditingToken((prev) => prev ? {
        ...prev,
        avatarUrl: uploadedUrl,
        naturalWidth: dimensions?.width || prev.naturalWidth || 0,
        naturalHeight: dimensions?.height || prev.naturalHeight || 0,
        ...(prev.tokenShape === 'freeform' && dimensions ? { width: dimensions.width, height: dimensions.height } : {}),
      } : prev);
      dispatchToast({ message: 'Imagem do token enviada.', type: 'success' });
    } catch (error) {
      dispatchToast({ message: 'Falha ao enviar a imagem do token.', type: 'error' });
    } finally {
      setIsTokenImageUploading(false);
    }
  }, [editingToken, id, token]);

  const removeToken = useCallback((tokenId) => {
    if (!isMaster) return;
    recordHistory();
    setScenes(prev => prev.map(s => s.id !== viewingSceneId ? s : { ...s, tokens: s.tokens.filter(t => t.id !== tokenId) }));
    setSelectedTokenId((prev) => (prev === tokenId ? null : prev));
    emitCriticalMutation('removeToken', { sceneId: viewingSceneId, tokenId });
  }, [emitCriticalMutation, isMaster, recordHistory, viewingSceneId]);

  const deleteSelectedTokens = useCallback(() => {
    if (!isMaster) return;
    const ids = selectedTokenIds.length ? selectedTokenIds : selectedTokenId ? [selectedTokenId] : [];
    if (!ids.length) return;
    recordHistory();
    setScenes(prev => prev.map(s => s.id !== viewingSceneId ? s : { ...s, tokens: s.tokens.filter(t => !ids.some(tokenId => String(tokenId) === String(t.id))) }));
    ids.forEach((tokenId) => emitCriticalMutation('removeToken', { sceneId: viewingSceneId, tokenId }));
    setSelectedTokenId(null);
    setSelectedTokenIds([]);
  }, [emitCriticalMutation, isMaster, recordHistory, selectedTokenId, selectedTokenIds, viewingSceneId]);

  const duplicateSelectedTokens = useCallback(() => {
    if (!isMaster) return;
    const ids = selectedTokenIds.length ? selectedTokenIds : selectedTokenId ? [selectedTokenId] : [];
    if (!ids.length) return;
    const scene = scenesRef.current.find((item) => item.id === viewingSceneId);
    const copies = (scene?.tokens || [])
      .filter((token) => ids.some((tokenId) => String(tokenId) === String(token.id)))
      .map((token) => ({
        ...token,
        id: `${token.id}-copy-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        name: `${token.name || 'Objeto'} copia`,
        x: Number(token.x || 0) + 28,
        y: Number(token.y || 0) + 28,
        linkedGroupId: null
      }));
    if (!copies.length) return;
    recordHistory();
    setScenes(prev => prev.map(s => s.id !== viewingSceneId ? s : { ...s, tokens: [...(s.tokens || []), ...copies] }));
    copies.forEach((token) => emitCriticalMutation('addToken', { sceneId: viewingSceneId, token }));
    setSelectedTokenIds(copies.map((token) => token.id));
    setSelectedTokenId(copies[0]?.id || null);
  }, [emitCriticalMutation, isMaster, recordHistory, selectedTokenId, selectedTokenIds, viewingSceneId]);

  const clearActiveLayer = useCallback(() => {
    if (!isMaster) return;
    const scene = scenesRef.current.find((item) => item.id === viewingSceneId);
    const tokensInLayer = (scene?.tokens || []).filter((token) => (token.layer || 'token') === activeEditorLayer);
    if (!tokensInLayer.length) return;
    const ok = window.confirm(`Limpar ${tokensInLayer.length} objeto(s) da camada ${activeEditorLayer}?`);
    if (!ok) return;
    recordHistory();
    setScenes(prev => prev.map(s => s.id !== viewingSceneId ? s : { ...s, tokens: (s.tokens || []).filter((token) => (token.layer || 'token') !== activeEditorLayer) }));
    tokensInLayer.forEach((token) => emitCriticalMutation('removeToken', { sceneId: viewingSceneId, tokenId: token.id }));
    setSelectedTokenId(null);
    setSelectedTokenIds([]);
  }, [activeEditorLayer, emitCriticalMutation, isMaster, recordHistory, viewingSceneId]);

  const handleMapUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('mapImage', file);
    formData.append('assetType', uploadType);
    try {
      const res = await axios.post(`${API_BASE}/api/campaigns/${id}/upload-map`, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      const uploadedUrl = res.data.mapUrl;
      if (Array.isArray(res.data.assetLibrary)) setAssetLibrary(res.data.assetLibrary);
      if (uploadType === 'map') {
         const scene = scenes.find((item) => item.id === viewingSceneId);
         const hasCustomBackground = scene?.mapUrl && scene.mapUrl !== DEFAULT_SCENE_MAP_URL;
         if (!hasCustomBackground) {
           recordHistory();
           setScenes((prev) => prev.map(s => s.id === viewingSceneId ? { ...s, mapUrl: uploadedUrl } : s));
           emitCriticalMutation('updateScene', { sceneId: viewingSceneId, mapUrl: uploadedUrl });
         } else {
           const dimensions = await loadImageDimensions(uploadedUrl);
           const mapToken = {
             id: `map-${Date.now()}`,
             name: file.name?.replace(/\.[^.]+$/, '') || 'Mapa',
             assetType: 'map',
             x: window.innerWidth / 2,
             y: window.innerHeight / 2,
             rotation: 0,
             scale: 1,
             avatarUrl: uploadedUrl,
             width: dimensions.width,
             height: dimensions.height,
             isVisible: true,
             characterId: null,
             layer: 'map',
             hp: 10,
             maxHp: 10,
             status: '',
             auraColor: ''
           };
           recordHistory();
           setScenes((prev) => prev.map(s => s.id === viewingSceneId ? { ...s, tokens: [...s.tokens, mapToken] } : s));
           emitCriticalMutation('addToken', { sceneId: viewingSceneId, token: mapToken });
         }
      }
      const newAsset = res.data.assetLibrary?.[res.data.assetLibrary.length - 1];
      if (socket && newAsset) socket.emit('addAsset', { campaignId: id, asset: newAsset });
    } catch (error) { dispatchToast({ message: 'Falha ao subir asset.', type: 'error' }); }
  };

  const handleAddDrawing = useCallback((drawing) => {
    const originalPointCount = Array.isArray(drawing?.points) ? drawing.points.length / 2 : 0;
    const simplifiedPoints = simplifyDrawingPoints(drawing?.points);
    const finalDrawing = { ...drawing, points: simplifiedPoints };
    if (process.env.REACT_APP_DEBUG_VTT_SYNC === 'true' && originalPointCount) {
      const finalPointCount = simplifiedPoints.length / 2;
      console.log('[VTT_DRAWING]', { originalPointCount, finalPointCount, reductionPercent: Math.round((1 - finalPointCount / originalPointCount) * 100), payloadBytes: new Blob([JSON.stringify(finalDrawing)]).size });
    }
    recordHistory();
    setScenes(prev => prev.map(s => s.id !== viewingSceneId ? s : { ...s, drawings: [...(s.drawings || []), finalDrawing] }));
    emitCriticalMutation('addDrawing', { sceneId: viewingSceneId, drawing: finalDrawing });
  }, [emitCriticalMutation, recordHistory, viewingSceneId]);

  const handleAddShapeToken = useCallback((shapeData) => {
    if (!isMaster) return;
    recordHistory();

    // --- TEXTO ---
    if (shapeData.type === 'text') {
      const newToken = {
        id: `text-${Date.now()}`,
        name: shapeData.text.slice(0, 20),
        assetType: 'text',
        text: shapeData.text,
        x: shapeData.x, y: shapeData.y,
        rotation: 0, scale: 1,
        color: shapeData.color || '#d8ecff',
        fontFamily: shapeData.fontFamily || 'Rajdhani',
        fontSize: shapeData.fontSize || 16,
        bold: Boolean(shapeData.bold),
        italic: Boolean(shapeData.italic),
        underline: Boolean(shapeData.underline),
        strokeColor: shapeData.strokeColor || 'transparent',
        strokeWidth: Number(shapeData.strokeWidth || 0),
        shadow: shapeData.shadow ?? true,
        align: shapeData.align || 'left',
        hasBg: Boolean(shapeData.hasBg),
        backgroundColor: shapeData.backgroundColor || '#080808',
        backgroundOpacity: Number(shapeData.backgroundOpacity ?? 0.72),
        isVisible: true, characterId: null, layer: activeEditorLayerRef.current || 'token',
        hp: 1, maxHp: 1, status: '', auraColor: ''
      };
      setScenes(prev => prev.map(s => s.id !== viewingSceneId ? s : { ...s, tokens: [...s.tokens, newToken] }));
      emitCriticalMutation('addToken', { sceneId: viewingSceneId, token: newToken });
      return;
    }

    // --- DESENHO (Lápis) ---
    if (shapeData.type === 'drawing') {
      const pts = shapeData.points || [];
      if (pts.length < 4) return;
      // Calcula bounding box e normaliza pontos em relaçao ao centro
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (let i = 0; i < pts.length; i += 2) {
        if (pts[i] < minX) minX = pts[i];
        if (pts[i] > maxX) maxX = pts[i];
        if (pts[i + 1] < minY) minY = pts[i + 1];
        if (pts[i + 1] > maxY) maxY = pts[i + 1];
      }
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const normalizedPts = [];
      for (let i = 0; i < pts.length; i += 2) {
        normalizedPts.push(pts[i] - cx, pts[i + 1] - cy);
      }
      const newToken = {
        id: `drawing-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        name: shapeData.name || 'Traço',
        assetType: 'drawing',
        points: normalizedPts,
        x: cx, y: cy,
        rotation: 0, scale: 1,
        color: shapeData.color || '#ffb347',
        strokeWidth: shapeData.width || 3,
        opacity: shapeData.opacity,
        tension: shapeData.tension,
        lineCap: shapeData.lineCap,
        isVisible: shapeData.isVisible ?? true, characterId: null, layer: shapeData.layer || activeEditorLayerRef.current || 'token',
        hp: 1, maxHp: 1, status: '', auraColor: ''
      };
      setScenes(prev => prev.map(s => s.id !== viewingSceneId ? s : { ...s, tokens: [...s.tokens, newToken] }));
      emitCriticalMutation('addToken', { sceneId: viewingSceneId, token: newToken });
      return;
    }

    let radius = 50, width = 100, height = 100;
    let startX = shapeData.points[0];
    let startY = shapeData.points[1];

    if (shapeData.type === 'circle') {
      const dx = shapeData.points[2] - startX;
      const dy = shapeData.points[3] - startY;
      radius = Math.max(10, Math.sqrt(dx * dx + dy * dy));
      width = radius * 2;
      height = radius * 2;
    } else if (shapeData.type === 'rect') {
      width = Math.max(10, Math.abs(shapeData.points[2] - startX));
      height = Math.max(10, Math.abs(shapeData.points[3] - startY));
      startX = Math.min(shapeData.points[0], shapeData.points[2]);
      startY = Math.min(shapeData.points[1], shapeData.points[3]);
    } else if (shapeData.type === 'line' || shapeData.type === 'arrow') {
      width = Math.max(10, Math.abs(shapeData.points[2] - startX));
      height = Math.max(10, Math.abs(shapeData.points[3] - startY));
    }

    const newToken = {
      id: `shape-${Date.now()}`,
      name: shapeData.type === 'rect' ? 'Área retangular' : shapeData.type === 'circle' ? 'Área circular' : shapeData.type === 'arrow' ? 'Seta' : 'Linha',
      assetType: 'shape',
      shapeType: shapeData.type,
      x: startX,
      y: startY,
      rotation: 0, scale: 1,
      color: shapeData.color || '#ff0000',
      strokeWidth: shapeData.width || 3,
      width, height, radius,
      points: shapeData.type === 'line' || shapeData.type === 'arrow'
        ? [0, 0, shapeData.points[2] - shapeData.points[0], shapeData.points[3] - shapeData.points[1]]
        : undefined,
      fillColor: shapeData.fillColor || null,
      fillOpacity: Number(shapeData.fillOpacity || 0),
      opacity: Number(shapeData.opacity ?? 1),
      isVisible: true, characterId: null, layer: activeEditorLayerRef.current || 'token',
      hp: 1, maxHp: 1, status: '', auraColor: ''
    };
    setScenes(prev => prev.map(s => s.id !== viewingSceneId ? s : { ...s, tokens: [...s.tokens, newToken] }));
    emitCriticalMutation('addToken', { sceneId: viewingSceneId, token: newToken });
  }, [emitCriticalMutation, isMaster, recordHistory, viewingSceneId]);

  const handleRemoveDrawing = useCallback((drawingId) => {
    recordHistory();
    setScenes(prev => prev.map(s => s.id !== viewingSceneId ? s : { ...s, drawings: (s.drawings || []).filter(d => d.id !== drawingId) }));
    emitCriticalMutation('removeDrawing', { sceneId: viewingSceneId, drawingId });
  }, [emitCriticalMutation, recordHistory, viewingSceneId]);

  const handleTokenContextMenu = useCallback((evt, tokenData) => {
    const tokenId = typeof tokenData === 'string' ? tokenData : tokenData.id;
    const token = scenes.find(s => s.id === viewingSceneId)?.tokens.find(t => t.id === tokenId);
    if (!token) return;
    const isOwnToken = myCharacter?._id && String(token.characterId) === String(myCharacter._id);
    if (!isMaster && !isOwnToken) return;
    if (!isMaster && isOwnToken) {
      setEditingToken({
        id: token.id,
        name: token.name,
        label: token.label || '',
        hp: token.hp || '',
        maxHp: token.maxHp || '',
        status: token.status || '',
        auraColor: token.auraColor || '',
        isVisible: token.isVisible !== false,
        tokenShape: token.tokenShape || 'circle',
        radius: token.radius || 35,
        width: token.width || 70,
        height: token.height || 70,
        naturalWidth: token.naturalWidth || 0,
        naturalHeight: token.naturalHeight || 0,
        avatarUrl: token.avatarUrl || '',
      });
      return;
    }
    closeFloatingMenus('context');
    setContextMenu({
      x: evt.evt.clientX,
      y: evt.evt.clientY,
      tokenId: token.id,
      tokenName: token.name,
      assetType: token.assetType || 'token',
      text: token.text || '',
      characterId: token.characterId || '',
      label: token.label || '',
      isVisible: token.isVisible,
      layer: token.layer || 'token',
      hp: token.hp || '',
      maxHp: token.maxHp || '',
      status: token.status || '',
      auraColor: token.auraColor || '',
      tokenShape: token.tokenShape || 'circle',
      radius: token.radius || 35,
      width: token.width || (token.radius ? token.radius * 2 : 70),
      height: token.height || (token.radius ? token.radius * 2 : 70),
      naturalWidth: tokenData.naturalWidth || token.width || 0,
      naturalHeight: tokenData.naturalHeight || token.height || 0,
      avatarUrl: token.avatarUrl || ''
    });
  }, [closeFloatingMenus, isMaster, myCharacter, scenes, viewingSceneId]);

  const publishRoll = useCallback(async (payload) => {
    debugVttRoll('[ROLL] sending to backend', payload);
    setIsRolling(true);
    try {
      const response = await axios.post(`${API_BASE}/api/campaigns/${id}/roll`, payload, { headers: { Authorization: `Bearer ${token}` } });
      const createdRoll = applyRollSelectionFallback(getCreatedRollFromResponse(response.data), payload);
      if (createdRoll) {
        setRecentRolls((prev) => mergeChatItems(prev, createdRoll, 'roll', 100));
      } else {
        await fetchRecentRolls();
      }
    } catch (error) {
      if (DEBUG_VTT_ROLLS) console.error('[ROLL] failed', error);
      dispatchToast({ message: error.response?.data?.message || 'Não foi possível registrar a rolagem.', type: 'error' });
    } finally {
      setIsRolling(false);
    }
  }, [fetchRecentRolls, id, token]);

  const submitRoll = useCallback(async () => {
    debugVttRoll('[ROLL] click roll button', rollMode === 'manual' ? manualRollFormula : rollMode);
    if (rollMode !== 'manual' && !activeRollCharacter?._id) { dispatchToast({ message: 'Abra ou selecione uma ficha para rolar.', type: 'warning' }); return; }
    let formula = ''; let roll = []; let skillLabel = ''; let pileSources = [];
    if (rollMode === 'manual') {
      formula = normalizeRollFormula(manualRollFormula);
      if (!formula) { dispatchToast({ message: 'Informe uma fórmula para rolar.', type: 'warning' }); return; }
      if (!isValidRollFormula(formula)) { dispatchToast({ message: 'Fórmula inválida. Use algo como 1d6+2d10.', type: 'warning' }); return; }
      skillLabel = 'Rolagem livre';
    } else if (rollMode === 'skill') {
      if (!selectedSkillKey || !selectedInstinctKey) { dispatchToast({ message: 'Selecione perícia e instinto.', type: 'warning' }); return; }
      const skillValue = Number(activeCharacterSkills[selectedSkillKey] || 0);
      const instinctValue = Number(activeCharacterInstincts[selectedInstinctKey] || 0);
      const parts = [];
      if (skillValue > 0) parts.push(`${skillValue}d10`);
      if (instinctValue > 0) parts.push(`${instinctValue}d6`);
      formula = parts.join('+');
      if (!formula) { dispatchToast({ message: 'Valores zerados para esta combinação.', type: 'warning' }); return; }
      skillLabel = `${t(selectedSkillKey)} (${getSkillTypeLabel(selectedSkillKey)}) + ${t(selectedInstinctKey)}`;
      pileSources = [
        { label: t(selectedSkillKey), count: skillValue, sides: 10 },
        { label: t(selectedInstinctKey), count: instinctValue, sides: 6 },
      ].filter((source) => source.count > 0);
    } else {
      if (!assimilateInstinctA || !assimilateInstinctB) { dispatchToast({ message: 'Selecione os dois instintos para assimilação.', type: 'warning' }); return; }
      const total = Number(activeCharacterInstincts[assimilateInstinctA] || 0) + Number(activeCharacterInstincts[assimilateInstinctB] || 0);
      if (!total) { dispatchToast({ message: 'Valores zerados para assimilação.', type: 'warning' }); return; }
      formula = `${total}d12`;
      skillLabel = `Assimilação: ${t(assimilateInstinctA)} + ${t(assimilateInstinctB)}`;
      pileSources = [{ label: 'Assimilação', count: total, sides: 12 }];
    }

    let keepCount = rollMode === 'assimilation' ? 2 : 1;
    let resourceSpend = null;
    const shouldPrepareResources = rollMode === 'assimilation' || (rollMode === 'skill' && useDeterminationForRoll);

    if (shouldPrepareResources) {
      try {
        const response = await axios.post(
          `${API_BASE}/api/characters/${activeRollCharacter._id}/prepare-roll`,
          { rollMode, useDetermination: useDeterminationForRoll },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        keepCount = Number(response.data?.keepCount) || keepCount;
        resourceSpend = response.data?.resourceSpend || null;
        const updatedCharacter = response.data?.character;
        if (updatedCharacter?._id) {
          setAvailableChars((prev) => prev.map((char) => String(char._id) === String(updatedCharacter._id) ? { ...char, ...updatedCharacter } : char));
          setCampaignData((prev) => prev?.players ? {
            ...prev,
            players: prev.players.map((entry) => String(entry?.character?._id) === String(updatedCharacter._id)
              ? { ...entry, character: { ...entry.character, ...updatedCharacter } }
              : entry),
          } : prev);
        }
      } catch (error) {
        dispatchToast({
          message: error.response?.data?.message || 'Não foi possível reservar os recursos desta rolagem.',
          type: 'warning',
        });
        return;
      }
    }

    roll = rollAssimilationDice(formula);
    if (!roll.length) { dispatchToast({ message: 'Rolagem inválida.', type: 'warning' }); return; }
    const rollerName = (chatIdentity === 'gm' && isMaster)
      ? `[GM] ${user?.name || 'Mestre'}`
      : (activeRollCharacter?.name || user?.name || 'Jogador');
    const payload = {
      rollerId: user?._id,
      rollerName,
      characterId: chatIdentity === 'gm' ? null : (activeRollCharacter?._id || null),
      formula,
      skill: skillLabel,
      rollMode,
      pileSources,
      resourceSpend,
      selectionRule: {
        label: rollMode === 'assimilation'
          ? (useDeterminationForRoll ? 'Instinto + Empenho' : 'Escolha assimilada')
          : (useDeterminationForRoll ? 'Empenho' : 'Escolha padrão'),
        reason: keepCount > 1 ? `Mantenha ${keepCount} resultados desta pilha.` : 'Mantenha um resultado desta pilha.',
      },
      roll,
      timestamp: new Date(),
    };
    debugVttRoll('[ROLL] result', { formula, roll });
    setPendingRoll({ payload, keepCount });
    setUseDeterminationForRoll(false);
  }, [activeCharacterInstincts, activeCharacterSkills, activeRollCharacter, assimilateInstinctA, assimilateInstinctB, chatIdentity, isMaster, manualRollFormula, rollMode, selectedInstinctKey, selectedSkillKey, token, useDeterminationForRoll, user]);

  const sendTextMessage = () => {
    const text = chatInput.trim();
    if (!text || !socket) return;

    let finalSenderName = 'Jogador';
    if (chatIdentity === 'gm' && isMaster) {
      finalSenderName = `[GM] ${user?.name || 'Mestre'}`;
    } else {
      finalSenderName = activeRollCharacter?.name || user?.name || 'Jogador';
    }

    const payload = { campaignId: id, text, senderName: finalSenderName, senderId: user?._id, characterId: chatIdentity === 'gm' ? null : (activeRollCharacter?._id || null), timestamp: Date.now() };
    socket.emit('chatMessage', payload);
    setChatInput('');
  };

  const handleShareToChat = useCallback((text) => {
    if (!text || !socket) return;
    const finalSenderName = `[Mestre] ${user?.name || ''}`.trim();
    const payload = { campaignId: id, text, senderName: finalSenderName, senderId: user?._id, characterId: null, timestamp: Date.now() };
    socket.emit('chatMessage', payload);
  }, [id, socket, user]);

  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag) || e.target?.isContentEditable) return;
      const key = (e.key || '').toLowerCase();
      const withCtrl = e.ctrlKey || e.metaKey;

      // Se estiver segurando CTRL, sai do bloco de ferramentas para o Ctrl+V funcionar!
      if (withCtrl) {
          if (key === 'z') { e.preventDefault(); e.shiftKey ? setRedoSignal(v => v + 1) : setUndoSignal(v => v + 1); }
          if (key === 'y') { e.preventDefault(); setRedoSignal(v => v + 1); }
          return;
      }

      // Atalhos limpos (Sem o Ctrl pressionado)
      if (key === 'v') { e.preventDefault(); setActiveTool('select'); return; }
      if (key === 'r') { e.preventDefault(); setActiveTool('ruler'); return; }
      if (key === 'd') { e.preventDefault(); setActiveTool('draw'); return; }
      if (key === 't') { e.preventDefault(); setActiveTool('text'); return; }
      if (key === 'e') { e.preventDefault(); setActiveTool('erase'); return; }
      if (key === 'h') { e.preventDefault(); setActiveTool('pan'); return; }
      if (key === 'g') { e.preventDefault(); setShowGrid(p => !p); return; }
      if ((key === 'delete' || key === 'backspace') && isMaster) {
        if (selectedTokenIds.length > 0 || selectedTokenId) {
          e.preventDefault();
          deleteSelectedTokens();
          return;
        }
      }
      if (key === '0') { e.preventDefault(); setCameraResetKey(p => p + 1); return; }
      if (key === 'escape') { setSelectedTokenId(null); setSelectedTokenIds([]); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deleteSelectedTokens, isMaster, selectedTokenId, selectedTokenIds]);

  const renderSceneCard = (scene) => {
    const isViewing = viewingSceneId === scene.id;
    const isParty = partySceneId === scene.id;
    const tokenCount = (scene.tokens || []).length;

    return (
      <div
        key={scene.id}
        className={`${styles.sceneCard} ${isViewing ? styles.sceneCardActive : ''}`}
      >
        <button
          type="button"
          className={styles.sceneCardOpen}
          onClick={() => {
            handleChangeViewingScene(scene.id);
            setIsSceneManagerOpen(false);
          }}
        >
          <div className={styles.sceneThumb}>
            {scene.mapUrl ? (
              <img src={scene.mapUrl} alt={scene.name || 'Mapa da cena'} />
            ) : (
              <div className={styles.sceneNoImage}><FaImage size={24} /></div>
            )}
            {isParty && <span className={`${styles.sceneBadge} ${styles.sceneBadgeParty}`}><FaUsers /> Party</span>}
            {isViewing && <span className={`${styles.sceneBadge} ${styles.sceneBadgeViewing}`}><FaEye /> Vendo</span>}
          </div>
          <div className={styles.sceneCardFooter}>
            <span className={styles.sceneName}>{scene.name || 'Cena sem nome'}</span>
            <span className={styles.sceneMeta}>{tokenCount} token{tokenCount !== 1 ? 's' : ''}</span>
          </div>
        </button>
        <button
          type="button"
          className={styles.sceneDeleteBtn}
          onClick={() => handleDeleteScene(scene)}
          disabled={scenes.length <= 1}
          title={scenes.length <= 1 ? 'A mesa precisa manter uma cena' : `Excluir ${scene.name || 'cena'}`}
          aria-label={`Excluir ${scene.name || 'cena'}`}
        >
          <FaTrash size={11} />
        </button>
      </div>
    );
  };

  const selectedTextFontFamily = selectedCanvasObject?.assetType === 'text'
    ? (selectedCanvasObject.fontFamily || drawFontFamily)
    : drawFontFamily;
  const selectedTextFontOption = VTT_FONT_OPTIONS.find((font) => font.value === selectedTextFontFamily) || VTT_FONT_OPTIONS[0];
  const applyTextFontFamily = (fontFamily) => {
    setDrawFontFamily(fontFamily);
    if (selectedCanvasObject?.assetType === 'text') {
      updateTokenProps(selectedCanvasObject.id, { fontFamily });
    }
    setIsFontMenuOpen(false);
  };

  return (
    <div className={styles.vttContainer}>

      {/* MENU RADIAL DO GTA (INTERCEPTADOR DE CTRL+V) */}
      {radialMenuData && (
        <div className={styles.radialMenuOverlay} onClick={() => setRadialMenuData(null)} style={{ position: 'fixed', inset: 0, zIndex: 99999 }}>
          <div className={styles.radialCenter} style={{ position: 'fixed', left: radialMenuData.x, top: radialMenuData.y }} onClick={(e) => e.stopPropagation()}>
            <img src={radialMenuData.previewUrl} alt="Preview" className={styles.radialPreview} />
            {isRadialUploading ? <div className={styles.radialLoader}>Processando...</div> : (
              <>
                <div className={`${styles.radialSlice} ${styles.radialTop}`} onClick={() => handleRadialSelect('token')}><FaGhost size={24}/></div>
                <div className={`${styles.radialSlice} ${styles.radialRight}`} onClick={() => handleRadialSelect('prop')}><FaBoxOpen size={24}/></div>
                <div className={`${styles.radialSlice} ${styles.radialBottom}`} onClick={() => handleRadialSelect('map')}><FaMapMarkedAlt size={24}/></div>
                <div className={`${styles.radialSlice} ${styles.radialLeft}`} onClick={() => setRadialMenuData(null)}><FaTimes size={24}/></div>
              </>
            )}
          </div>
        </div>
      )}

      {/* BARRA DE ACESSO RÁPIDO (BOTTOM CENTER) */}
      <div className={styles.bottomQuickBar}>
        <button title="Mapas" onClick={() => setActiveQuickCategory(activeQuickCategory === 'map' ? null : 'map')} className={`${styles.categoryBtn} ${activeQuickCategory === 'map' ? styles.categoryBtnActive : ''}`}><FaMapMarkedAlt size={20}/></button>
        <button title="Personagens" onClick={() => setActiveQuickCategory(activeQuickCategory === 'token' ? null : 'token')} className={`${styles.categoryBtn} ${activeQuickCategory === 'token' ? styles.categoryBtnActive : ''}`}><FaGhost size={20}/></button>
        <button title="Veículos" onClick={() => setActiveQuickCategory(activeQuickCategory === 'vehicle' ? null : 'vehicle')} className={`${styles.categoryBtn} ${activeQuickCategory === 'vehicle' ? styles.categoryBtnActive : ''}`}><FaCar size={20}/></button>
        <button title="Armas" onClick={() => setActiveQuickCategory(activeQuickCategory === 'weapon' ? null : 'weapon')} className={`${styles.categoryBtn} ${activeQuickCategory === 'weapon' ? styles.categoryBtnActive : ''}`}><FaCrosshairs size={20}/></button>
        <button title="Props" onClick={() => setActiveQuickCategory(activeQuickCategory === 'prop' ? null : 'prop')} className={`${styles.categoryBtn} ${activeQuickCategory === 'prop' ? styles.categoryBtnActive : ''}`}><FaBoxOpen size={20}/></button>
        <button title="Diversos" onClick={() => setActiveQuickCategory(activeQuickCategory === 'misc' ? null : 'misc')} className={`${styles.categoryBtn} ${activeQuickCategory === 'misc' ? styles.categoryBtnActive : ''}`}><FaEllipsisH size={20}/></button>
        <div className={styles.verticalDivider} />
        <button title="Gerenciador de assets" onClick={() => openFloatingMenu('asset')} className={styles.categoryBtn}><FaTh size={22}/></button>
      </div>

      {/* PRATELEIRA DA CATEGORIA ATIVA */}
      {activeQuickCategory && (
        <div className={styles.assetShelf}>
          {myAssets.filter(a => a.type === activeQuickCategory).length === 0 ? (
            <div className={styles.emptyState}>Nenhum asset nesta categoria.</div>
          ) : (
            myAssets.filter(a => a.type === activeQuickCategory).map(asset => (
              <div
                key={asset._id}
                className={styles.shelfItem}
                onClick={() => handleAssetShelfClick(asset)}
              >
                <img src={asset.url} alt={asset.name} />
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL GERENCIADOR DE ASSETS */}
      <Dialog open={isAssetManagerOpen} onClose={() => setIsAssetManagerOpen(false)} title="Gerenciador de assets" description="Uploads disponíveis para a mesa" size="large" className={`${styles.sceneManagerBox} ${styles.assetManagerBox} ${styles.vttDialog}`}>
            <div className={styles.modalScrollBody}>
              <div className={styles.modalToolbar}>
                <div>
                  <h3 className={styles.modalTitle}>Meus uploads</h3>
                  <div className={styles.sectionKicker}>{myAssets.length} asset{myAssets.length !== 1 ? 's' : ''}</div>
                </div>
                <div className={styles.modalActions}>
                <select id="assetTypeUpload" className={styles.inputField}>
                  <option value="token">Personagem</option><option value="map">Mapa</option><option value="vehicle">Veículo</option>
                  <option value="weapon">Arma</option><option value="prop">Prop</option><option value="misc">Outros</option>
                </select>
                <label className={styles.primaryBtn} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <FaUpload /> Adicionar asset +
                  <input type="file" hidden onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const type = document.getElementById('assetTypeUpload').value;
                    const formData = new FormData(); formData.append('assetImage', file); formData.append('type', type);
                    await axios.post(`${API_BASE}/api/my-assets`, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
                    fetchMyAssets();
                  }} />
                </label>
                </div>
              </div>
              <div className={styles.assetGrid}>
                {myAssets.map(asset => (
                  <div key={asset._id} className={styles.assetGridCard}>
                    <img src={asset.url} alt={asset.name} className={styles.assetThumb} />
                    <div className={styles.assetTypeLabel}>{asset.type.toUpperCase()}</div>
                    <button onClick={() => handleDeleteAsset(asset._id)} className={styles.dangerBtn} style={{ padding: '4px 8px', fontSize: 10 }}><FaTrash/></button>
                  </div>
                ))}
              </div>
            </div>
      </Dialog>

      {/* BARRA SUPERIOR E GESTOR DE CENAS */}
      <div className={styles.topBar}>
        <div className={styles.topBarCluster}>
          <div className={styles.campaignPill}>
            <span>{campaignData?.name || 'Campanha'}</span>
            <span className={styles.campaignRole}>{isMaster ? 'Mestre' : 'Jogador'}</span>
            <span
              className={`${styles.connectionBadge} ${styles[`connectionBadge_${connectionStatus === 'connected' && pendingMutationCount > 0 ? 'syncing' : connectionStatus}`]}`}
              title={connectionStatus === 'connected' && pendingMutationCount === 0 ? 'Conectado e sem alterações pendentes.' : `${pendingMutationCount} alteração(ões) aguardando confirmação.`}
            >
              {connectionStatus === 'connected' && pendingMutationCount === 0 ? 'Online' : connectionStatus === 'error' ? 'Erro' : 'Sincronizando'}
            </span>
          </div>
          {isMaster && viewingSceneId !== partySceneId && (
            <button onClick={handlePullParty} className={styles.pullPartyBtn}>Puxar Party</button>
          )}
          <button onClick={() => openFloatingMenu('scene')} className={styles.primaryBtn}><FaMapMarkedAlt /> Cenas</button>
        </div>
        <div className={styles.topBarCluster}>
          <button onClick={() => navigate(`/campaign-lobby/${id}`)} className={styles.dangerBtn}>Sair</button>
        </div>
      </div>

      <div className={`${styles.toolOptionsDock} ${isToolDockCollapsed ? styles.toolOptionsDockCollapsed : ''}`}>
        <CollapseToggleButton
          collapsed={isToolDockCollapsed}
          direction={isToolDockCollapsed ? 'down' : 'up'}
          title={isToolDockCollapsed ? 'Expandir opções' : 'Recolher opções'}
          className={styles.dockCollapseBtn}
          onClick={() => setIsToolDockCollapsed((value) => !value)}
        />
        {/* SELEÇÃO - token selecionado */}
        {activeTool === 'select' && selectedCanvasObject && (
          <div className={styles.toolOptionsContent}>
            {selectedCanvasObject.assetType === 'text' ? (
              <input className={styles.objectTextInput} value={selectedCanvasObject.text || ''} onChange={(e) => updateTokenProps(selectedCanvasObject.id, { text: e.target.value, name: e.target.value.slice(0, 20) || 'Texto' })} placeholder="Texto..." />
            ) : (!selectedCanvasObject.assetType || selectedCanvasObject.assetType === 'token' || selectedCanvasObject.assetType === 'map') ? (
              <input className={styles.objectTextInput} value={selectedCanvasObject.label || selectedCanvasObject.name || ''} onChange={(e) => updateTokenProps(selectedCanvasObject.id, { label: e.target.value, name: e.target.value || selectedCanvasObject.name })} placeholder="Nome..." />
            ) : null}
            {(selectedCanvasObject.assetType === 'text' || selectedCanvasObject.assetType === 'drawing' || selectedCanvasObject.assetType === 'shape') && (
              <input type="color" value={selectedCanvasObject.color || drawColor} onChange={(e) => updateTokenProps(selectedCanvasObject.id, { color: e.target.value })} className={styles.toolColorSwatch} title="Cor do traço" />
            )}
            {selectedCanvasObject.assetType === 'shape' && (
              <input type="color" value={selectedCanvasObject.fillColor || drawFillColor} onChange={(e) => updateTokenProps(selectedCanvasObject.id, { fillColor: e.target.value })} className={styles.toolColorSwatch} title="Cor do preenchimento" />
            )}
            <span className={styles.toolDividerV} />
            {isMaster && (
              <button type="button" title="Duplicar selecionado" onClick={duplicateSelectedTokens} className={styles.iconActionBtn}>
                <FaCopy size={13} />
              </button>
            )}
            {isMaster && (
              <button type="button" title={selectedCanvasObject.isVisible ? 'Ocultar dos jogadores' : 'Revelar aos jogadores'} onClick={() => toggleTokenVisibility(selectedCanvasObject.id)} className={`${styles.iconActionBtn} ${!selectedCanvasObject.isVisible ? styles.iconActionBtnWarning : ''}`}>
                {selectedCanvasObject.isVisible ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            )}
            {isMaster && (
              <button type="button" title="Excluir" onClick={deleteSelectedTokens} className={`${styles.iconActionBtn} ${styles.iconActionBtnDanger}`}>
                <FaTrash size={13} />
              </button>
            )}
          </div>
        )}

        {/* SELEÇÃO - sem token: seletor de camada ativa */}
        {activeTool === 'select' && !selectedCanvasObject && isMaster && (
          <div className={styles.toolOptionsContent}>
            <span className={styles.toolDockLabel}>Camada</span>
            <span className={styles.toolDividerV} />
            <button type="button" title="Mapa" onClick={() => setActiveEditorLayer('map')} className={`${styles.iconActionBtn} ${activeEditorLayer === 'map' ? styles.iconActionBtnActive : ''}`}><FaMapMarkedAlt size={13} /></button>
            <button type="button" title="Tokens" onClick={() => setActiveEditorLayer('token')} className={`${styles.iconActionBtn} ${activeEditorLayer === 'token' ? styles.iconActionBtnActive : ''}`}><FaUsers size={13} /></button>
            <button type="button" title="Camada do mestre" onClick={() => setActiveEditorLayer('gm')} className={`${styles.iconActionBtn} ${activeEditorLayer === 'gm' ? styles.iconActionBtnActive : ''}`}><FaUserShield size={13} /></button>
            <span className={styles.toolDividerV} />
            <button type="button" title="Limpar camada atual" onClick={clearActiveLayer} className={`${styles.iconActionBtn} ${styles.iconActionBtnDanger}`}><FaTrash size={12} /></button>
          </div>
        )}

        {/* TRAÇO LIVRE - modos de lápis + opacidade */}
        {activeTool === 'draw' && (
          <div className={styles.toolOptionsContent}>
            <div className={styles.toolDockGroup}>
              <button type="button" title="Caneta (traço limpo)" onClick={() => setDrawMode('pen')} className={`${styles.iconActionBtn} ${drawMode === 'pen' ? styles.iconActionBtnActive : ''}`}><FaPencilAlt size={13} /></button>
              <button type="button" title="Lápis (traço suave, semi-transparente)" onClick={() => setDrawMode('pencil')} className={`${styles.iconActionBtn} ${drawMode === 'pencil' ? styles.iconActionBtnActive : ''}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </button>
              <button type="button" title="Marcador (linha grossa e sólida)" onClick={() => setDrawMode('marker')} className={`${styles.iconActionBtn} ${drawMode === 'marker' ? styles.iconActionBtnActive : ''}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="3" width="9" height="18" rx="2"/><path d="M13 7h4l2 4-2 4h-4"/></svg>
              </button>
              <button type="button" title="Marca-texto (opacidade baixa, linha larga)" onClick={() => setDrawMode('highlight')} className={`${styles.iconActionBtn} ${drawMode === 'highlight' ? styles.iconActionBtnActive : ''}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 3L3 21h18L15 3H9z" strokeLinejoin="round"/></svg>
              </button>
            </div>
            <span className={styles.toolDividerV} />
            <input type="color" title="Cor" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} className={styles.toolColorSwatch} />
            <FaSlidersH size={10} style={{ color: '#747474', flexShrink: 0 }} />
            <input type="range" title={`Espessura: ${drawWidth}px`} min="1" max="40" value={drawWidth} onChange={(e) => setDrawWidth(Number(e.target.value))} className={styles.toolRange} />
            <span className={styles.toolDockValueLabel}>{drawWidth}px</span>
            <span className={styles.toolDividerV} />
            <span className={styles.toolDockLabel}>Opac</span>
            <input type="range" title={`Opacidade: ${Math.round(drawOpacity * 100)}%`} min="10" max="100" value={Math.round(drawOpacity * 100)} onChange={(e) => setDrawOpacity(Number(e.target.value) / 100)} className={styles.toolRange} />
            <span className={styles.toolDockValueLabel}>{Math.round(drawOpacity * 100)}%</span>
          </div>
        )}

        {/* FORMAS */}
        {activeTool === 'shape' && (
          <div className={styles.toolOptionsContent}>
            <span className={styles.toolDockLabel}>Formas</span>
            <div className={styles.toolDockGroup}>
              <button type="button" title="Retângulo" onClick={() => setShapeTool('rect')} className={`${styles.iconActionBtn} ${shapeTool === 'rect' ? styles.iconActionBtnActive : ''}`}><FaSquare size={12} /></button>
              <button type="button" title="Círculo" onClick={() => setShapeTool('circle')} className={`${styles.iconActionBtn} ${shapeTool === 'circle' ? styles.iconActionBtnActive : ''}`}><FaCircle size={12} /></button>
              <button type="button" title="Linha" onClick={() => setShapeTool('line')} className={`${styles.iconActionBtn} ${shapeTool === 'line' ? styles.iconActionBtnActive : ''}`}><FaSlash size={12} /></button>
              <button type="button" title="Seta" onClick={() => setShapeTool('arrow')} className={`${styles.iconActionBtn} ${shapeTool === 'arrow' ? styles.iconActionBtnActive : ''}`}><FaChevronRight size={12} /></button>
            </div>
            <span className={styles.toolDividerV} />
            <input type="color" title="Cor da borda" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} className={styles.toolColorSwatch} />
            <FaSlidersH size={10} style={{ color: '#747474', flexShrink: 0 }} />
            <input type="range" min="1" max="28" value={drawWidth} onChange={(e) => setDrawWidth(Number(e.target.value))} className={styles.toolRange} title={`Borda: ${drawWidth}px`} />
            <span className={styles.toolDockValueLabel}>{drawWidth}px</span>
            <span className={styles.toolDividerV} />
            <button type="button" title={drawHasFill ? 'Remover preenchimento' : 'Adicionar preenchimento'} onClick={() => setDrawHasFill(f => !f)} className={`${styles.iconActionBtn} ${drawHasFill ? styles.iconActionBtnActive : ''}`}>
              <FaSquare size={11} style={{ opacity: drawHasFill ? 1 : 0.4 }} />
            </button>
            {drawHasFill && (
              <>
                <input type="color" title="Cor do preenchimento" value={drawFillColor} onChange={(e) => setDrawFillColor(e.target.value)} className={styles.toolColorSwatch} />
                <input type="range" min="5" max="100" value={Math.round(drawFillOpacity * 100)} onChange={(e) => setDrawFillOpacity(Number(e.target.value) / 100)} className={styles.toolRange} title={`Opacidade do preenchimento: ${Math.round(drawFillOpacity * 100)}%`} />
                <span className={styles.toolDockValueLabel}>{Math.round(drawFillOpacity * 100)}%</span>
              </>
            )}
          </div>
        )}
        {/* FOG / M?SCARA */}
        {activeTool === 'fog' && isMaster && (
          <div className={`${styles.toolOptionsContent} ${styles.fogToolContent}`}>
            <div className={styles.fogToolSection}>
              <span className={styles.toolDockLabel}>Máscara</span>
              <div className={styles.segmentedControl}>
                <button type="button" title="Revelar área" onClick={() => setFogMode('reveal')} className={fogMode === 'reveal' ? styles.segmentActive : ''}><FaEye size={11} /> Revelar</button>
                <button type="button" title="Ocultar área" onClick={() => setFogMode('hide')} className={fogMode === 'hide' ? styles.segmentActive : ''}><FaEyeSlash size={11} /> Ocultar</button>
              </div>
            </div>
            <span className={styles.toolDividerV} />
            <div className={styles.fogToolSection}>
              <span className={styles.toolDockLabel}>Forma</span>
              <div className={styles.toolDockGroup}>
                <button type="button" title="Retângulo" onClick={() => setFogShape('rect')} className={`${styles.iconActionBtn} ${fogShape === 'rect' ? styles.iconActionBtnActive : ''}`}><FaSquare size={12} /></button>
                <button type="button" title="Círculo" onClick={() => setFogShape('circle')} className={`${styles.iconActionBtn} ${fogShape === 'circle' ? styles.iconActionBtnActive : ''}`}><FaCircle size={12} /></button>
              </div>
            </div>
            <span className={styles.toolDividerV} />
            <div className={styles.fogToolSection}>
              <span className={styles.toolDockLabel}>Página</span>
              <div className={styles.fogActionGroup}>
                <button type="button" title="Ocultar página inteira" onClick={hideFullFogPage} className={`${styles.iconTextBtn} ${styles.iconTextBtnDanger}`}>Ocultar tudo</button>
                <button type="button" title="Revelar página inteira" onClick={revealFullFogPage} className={styles.iconTextBtn}>Revelar tudo</button>
              </div>
            </div>
            <span className={styles.toolDividerV} />
            <div className={styles.fogOpacityGrid}>
              <label className={styles.fogOpacityControl}>
                <span>Mestre <strong>{Math.round(fogDmOpacity * 100)}%</strong></span>
                <input type="range" min="5" max="85" value={Math.round(fogDmOpacity * 100)} onChange={(e) => setFogDmOpacity(Number(e.target.value) / 100)} className={styles.toolRange} title={`Opacidade para mestre: ${Math.round(fogDmOpacity * 100)}%`} />
              </label>
              <label className={styles.fogOpacityControl}>
                <span>Jogador <strong>{Math.round(fogPlayerOpacity * 100)}%</strong></span>
                <input type="range" min="35" max="100" value={Math.round(fogPlayerOpacity * 100)} onChange={(e) => setFogPlayerOpacity(Number(e.target.value) / 100)} className={styles.toolRange} title={`Opacidade para jogadores: ${Math.round(fogPlayerOpacity * 100)}%`} />
              </label>
            </div>
          </div>
        )}
        {/* RETÃ‚NGULO */}
        {activeTool === 'rect' && (
          <div className={styles.toolOptionsContent}>
            <div className={styles.toolDockGroup}>
              <button type="button" title="Traço livre" onClick={() => setActiveTool('draw')} className={styles.iconActionBtn}><FaPencilAlt size={13} /></button>
              <button type="button" title="Retângulo (ativo)" className={`${styles.iconActionBtn} ${styles.iconActionBtnActive}`}><FaSquare size={12} /></button>
              <button type="button" title="Círculo" onClick={() => setActiveTool('circle')} className={styles.iconActionBtn}><FaCircle size={12} /></button>
            </div>
            <span className={styles.toolDividerV} />
            <input type="color" title="Cor da borda" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} className={styles.toolColorSwatch} />
            <FaSlidersH size={10} style={{ color: '#747474', flexShrink: 0 }} />
            <input type="range" min="1" max="20" value={drawWidth} onChange={(e) => setDrawWidth(Number(e.target.value))} className={styles.toolRange} title={`Borda: ${drawWidth}px`} />
            <span className={styles.toolDockValueLabel}>{drawWidth}px</span>
            <span className={styles.toolDividerV} />
            <button type="button" title={drawHasFill ? 'Remover preenchimento' : 'Adicionar preenchimento'} onClick={() => setDrawHasFill(f => !f)} className={`${styles.iconActionBtn} ${drawHasFill ? styles.iconActionBtnActive : ''}`}>
              <FaSquare size={11} style={{ opacity: drawHasFill ? 1 : 0.4 }} />
            </button>
            {drawHasFill && (
              <>
                <input type="color" title="Cor do preenchimento" value={drawFillColor} onChange={(e) => setDrawFillColor(e.target.value)} className={styles.toolColorSwatch} />
                <input type="range" min="5" max="100" value={Math.round(drawFillOpacity * 100)} onChange={(e) => setDrawFillOpacity(Number(e.target.value) / 100)} className={styles.toolRange} title={`Opacidade fill: ${Math.round(drawFillOpacity * 100)}%`} />
                <span className={styles.toolDockValueLabel}>{Math.round(drawFillOpacity * 100)}%</span>
              </>
            )}
          </div>
        )}

        {/* CÍRCULO */}
        {activeTool === 'circle' && (
          <div className={styles.toolOptionsContent}>
            <div className={styles.toolDockGroup}>
              <button type="button" title="Traço livre" onClick={() => setActiveTool('draw')} className={styles.iconActionBtn}><FaPencilAlt size={13} /></button>
              <button type="button" title="Retângulo" onClick={() => setActiveTool('rect')} className={styles.iconActionBtn}><FaSquare size={12} /></button>
              <button type="button" title="Círculo (ativo)" className={`${styles.iconActionBtn} ${styles.iconActionBtnActive}`}><FaCircle size={12} /></button>
            </div>
            <span className={styles.toolDividerV} />
            <input type="color" title="Cor da borda" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} className={styles.toolColorSwatch} />
            <FaSlidersH size={10} style={{ color: '#747474', flexShrink: 0 }} />
            <input type="range" min="1" max="20" value={drawWidth} onChange={(e) => setDrawWidth(Number(e.target.value))} className={styles.toolRange} title={`Borda: ${drawWidth}px`} />
            <span className={styles.toolDockValueLabel}>{drawWidth}px</span>
            <span className={styles.toolDividerV} />
            <button type="button" title={drawHasFill ? 'Remover preenchimento' : 'Adicionar preenchimento'} onClick={() => setDrawHasFill(f => !f)} className={`${styles.iconActionBtn} ${drawHasFill ? styles.iconActionBtnActive : ''}`}>
              <FaCircle size={11} style={{ opacity: drawHasFill ? 1 : 0.4 }} />
            </button>
            {drawHasFill && (
              <>
                <input type="color" title="Cor do preenchimento" value={drawFillColor} onChange={(e) => setDrawFillColor(e.target.value)} className={styles.toolColorSwatch} />
                <input type="range" min="5" max="100" value={Math.round(drawFillOpacity * 100)} onChange={(e) => setDrawFillOpacity(Number(e.target.value) / 100)} className={styles.toolRange} title={`Opacidade fill: ${Math.round(drawFillOpacity * 100)}%`} />
                <span className={styles.toolDockValueLabel}>{Math.round(drawFillOpacity * 100)}%</span>
              </>
            )}
          </div>
        )}

        {/* TEXTO */}
        {activeTool === 'text' && (
          <div className={styles.toolOptionsContent}>
            <FaFont size={13} style={{ color: '#747474', flexShrink: 0 }} />
            <div className={styles.fontSelectWrap} onKeyDown={(e) => e.stopPropagation()}>
              <button
                type="button"
                className={styles.fontSelectButton}
                style={{ fontFamily: selectedTextFontFamily }}
                title="Fonte"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isFontMenuOpen) setIsFontMenuOpen(false);
                  else openFloatingMenu('font');
                }}
              >
                {selectedTextFontOption.label}
              </button>
              {isFontMenuOpen && (
                <div className={styles.fontSelectMenu} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                  {VTT_FONT_OPTIONS.map((font) => (
                    <button
                      key={font.value}
                      type="button"
                      className={`${styles.fontSelectOption} ${selectedTextFontFamily === font.value ? styles.fontSelectOptionActive : ''}`}
                      style={{ fontFamily: font.value }}
                      onClick={() => applyTextFontFamily(font.value)}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input type="color" title="Cor do texto" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} className={styles.toolColorSwatch} />
            <span className={styles.toolDividerV} />
            <span className={styles.toolDockLabel}>Tam</span>
            <input type="range" min="10" max="72" value={drawFontSize} onChange={(e) => setDrawFontSize(Number(e.target.value))} className={styles.toolRange} title={`Tamanho: ${drawFontSize}px`} />
            <span className={styles.toolDockValueLabel}>{drawFontSize}px</span>
            <span className={styles.toolDividerV} />
            <button type="button" title="Negrito" onClick={() => setDrawFontBold(b => !b)} className={`${styles.iconActionBtn} ${drawFontBold ? styles.iconActionBtnActive : ''}`}>
              <strong style={{ fontSize: 12, fontFamily: 'serif' }}>B</strong>
            </button>
            <button type="button" title="Itálico" onClick={() => setDrawFontItalic(b => !b)} className={`${styles.iconActionBtn} ${drawFontItalic ? styles.iconActionBtnActive : ''}`}>
              <em style={{ fontSize: 13, fontFamily: 'serif' }}>I</em>
            </button>
            <button type="button" title="Sublinhado" onClick={() => setDrawTextUnderline(b => !b)} className={`${styles.iconActionBtn} ${drawTextUnderline ? styles.iconActionBtnActive : ''}`}>
              <span style={{ fontSize: 12, fontWeight: 900, textDecoration: 'underline' }}>U</span>
            </button>
            <div className={styles.segmentedControl} title="Alinhamento">
              {[
                { value: 'left', title: 'Alinhar à esquerda', icon: <FaAlignLeft size={12} /> },
                { value: 'center', title: 'Centralizar', icon: <FaAlignCenter size={12} /> },
                { value: 'right', title: 'Alinhar à direita', icon: <FaAlignRight size={12} /> },
              ].map((item) => (
                <button key={item.value} type="button" title={item.title} onClick={() => setDrawTextAlign(item.value)} className={drawTextAlign === item.value ? styles.segmentActive : ''}>
                  {item.icon}
                </button>
              ))}
            </div>
            <span className={styles.toolDividerV} />
            <span className={styles.toolDockLabel}>Borda</span>
            <input type="color" title="Cor do contorno" value={drawTextStrokeColor} onChange={(e) => setDrawTextStrokeColor(e.target.value)} className={styles.toolColorSwatch} />
            <input type="range" min="0" max="8" value={drawTextStrokeWidth} onChange={(e) => setDrawTextStrokeWidth(Number(e.target.value))} className={styles.toolRange} title={`Contorno: ${drawTextStrokeWidth}px`} />
            <span className={styles.toolDockValueLabel}>{drawTextStrokeWidth}px</span>
            <button type="button" title="Sombra" onClick={() => setDrawTextShadow(b => !b)} className={`${styles.iconActionBtn} ${drawTextShadow ? styles.iconActionBtnActive : ''}`}>
              <FaGhost size={12} />
            </button>
            <button type="button" title="Fundo (post-it)" onClick={() => setDrawTextBg(b => !b)} className={`${styles.iconActionBtn} ${drawTextBg ? styles.iconActionBtnActive : ''}`}>
              <FaSquare size={11} style={{ opacity: 0.6 }} />
            </button>
            {drawTextBg && (
              <>
                <input type="color" title="Cor do fundo" value={drawTextBgColor} onChange={(e) => setDrawTextBgColor(e.target.value)} className={styles.toolColorSwatch} />
                <input type="range" min="10" max="100" value={Math.round(drawTextBgOpacity * 100)} onChange={(e) => setDrawTextBgOpacity(Number(e.target.value) / 100)} className={styles.toolRange} title={`Opacidade do fundo: ${Math.round(drawTextBgOpacity * 100)}%`} />
              </>
            )}
            {selectedCanvasObject?.assetType === 'text' && (
              <><span className={styles.toolDividerV} /><input className={styles.objectTextInput} value={selectedCanvasObject.text || ''} onChange={(e) => updateTokenProps(selectedCanvasObject.id, { text: e.target.value, name: e.target.value.slice(0, 20) || 'Texto' })} placeholder="Texto..." /></>
            )}
          </div>
        )}

        {/* RÃ‰GUA */}
        {activeTool === 'ruler' && (
          <div className={styles.toolOptionsContent}>
            <FaRuler size={13} style={{ color: '#747474', flexShrink: 0 }} />
            <span className={styles.toolDockLabel}>1 SQ =</span>
            <input type="number" step="0.5" value={rulerMultiplier} onChange={(e) => setRulerMultiplier(Number(e.target.value))} className={styles.compactInput} title="Escala" style={{ width: 62 }} />
            <select value={rulerUnit} onChange={(e) => setRulerUnit(e.target.value)} className={styles.compactInput} title="Unidade" style={{ width: 90 }}>
              <option value="m">Metros</option>
              <option value="ft">Pés</option>
              <option value="px">Quadrados</option>
            </select>
          </div>
        )}

        {/* BORRACHA */}
        {activeTool === 'erase' && (
          <div className={styles.toolOptionsContent}>
            <FaEraser size={14} style={{ color: '#ff6969', flexShrink: 0 }} />
            <span className={styles.toolDockLabel}>Borracha</span>
            <span className={styles.toolDividerV} />
            <input type="range" min="8" max="96" value={eraseSize} onChange={(e) => setEraseSize(Number(e.target.value))} className={styles.toolRange} title={`Tamanho: ${eraseSize}px`} />
            <span className={styles.toolDockValueLabel}>{eraseSize}px</span>
            <span className={styles.toolDividerV} />
            <span className={styles.toolDockHint}>Passe sobre os traços para apagar</span>
          </div>
        )}

        {/* PAN */}
        {activeTool === 'pan' && (
          <div className={styles.toolOptionsContent}>
            <FaHandPaper size={14} style={{ color: '#747474', flexShrink: 0 }} />
            <span className={styles.toolDockHint}>Arraste para mover a câmera · Scroll para zoom</span>
            <span className={styles.toolDividerV} />
            <button type="button" title="Centralizar câmera (0)" onClick={() => setCameraResetKey(p => p + 1)} className={styles.iconActionBtn}>
              <FaCrosshairs size={13} />
            </button>
          </div>
        )}
      </div>

      <Dialog open={isSceneManagerOpen && isMaster} onClose={() => setIsSceneManagerOpen(false)} title="Gerenciar cenas" description="Cenas, pastas e biblioteca da campanha" size="large" className={`${styles.sceneManagerBox} ${styles.vttDialog}`}>
            <div>
              <div className={styles.managerTabs}>
                <button onClick={() => setManagerTab('scenes')} className={`${styles.managerTabBtn} ${managerTab === 'scenes' ? styles.managerTabBtnActive : ''}`}>Cenas e pastas</button>
                <button onClick={() => setManagerTab('assets')} className={`${styles.managerTabBtn} ${managerTab === 'assets' ? styles.managerTabBtnActive : ''}`}>Biblioteca oficial</button>
              </div>
            </div>

            <div className={styles.modalBody}>
              {managerTab === 'scenes' && (
                <div className={styles.modalScrollBody}>
                  <div className={styles.modalToolbar}>
                    <div>
                      <h3 className={styles.modalTitle}>Gerir Cenas</h3>
                      <div className={styles.sectionKicker}>{scenes.length} cena{scenes.length !== 1 ? 's' : ''} na campanha</div>
                    </div>
                    <div className={styles.modalActions}>
                      <button onClick={handleCreateFolder} className={styles.primaryBtn} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FaFolder /> Nova pasta</button>
                      <button onClick={() => handleCreateScene(null)} className={styles.primaryBtn} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FaPlus /> Nova Cena</button>
                    </div>
                  </div>

                  {folders.map(folder => (
                    <div key={folder.id} className={styles.sceneFolder}>
                      <div className={styles.sceneFolderHeader}>
                        <div className={styles.sceneFolderTitle}><FaFolder color={folder.color}/> {folder.name}</div>
                        <button onClick={() => handleCreateScene(folder.id)} className={styles.ghostBtn}>+ Cena aqui</button>
                      </div>
                      <div className={styles.sceneGrid}>
                        {scenes.filter(s => s.folderId === folder.id).length === 0 && <span className={styles.emptyState}>Pasta vazia.</span>}
                        {scenes.filter(s => s.folderId === folder.id).map(renderSceneCard)}
                      </div>
                    </div>
                  ))}

                  <div className={styles.sceneLooseSection}>
                    <div className={styles.sectionKicker}>Cenas Soltas</div>
                    <div className={styles.sceneGrid}>
                      {scenes.filter(s => s.folderId === null).map(renderSceneCard)}
                    </div>
                  </div>
                </div>
              )}

              {managerTab === 'assets' && (
                <div className={styles.modalScrollBody}>
                   <div className={styles.modalToolbar}>
                    <div>
                      <h3 className={styles.modalTitle}>Biblioteca da campanha</h3>
                      <div className={styles.sectionKicker}>{assetLibrary.length} asset{assetLibrary.length !== 1 ? 's' : ''}</div>
                    </div>
                    <div className={styles.modalActions}>
                      <select value={uploadType} onChange={(e) => setUploadType(e.target.value)} className={styles.inputField}>
                          <option value="map">Mapa</option>
                          <option value="token">Token</option>
                          <option value="prop">Item/Prop</option>
                      </select>
                      <label className={styles.primaryBtn} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FaUpload /> Fazer upload
                        <input type="file" accept="image/*" onChange={handleMapUpload} style={{ display: 'none' }} />
                      </label>
                    </div>
                  </div>

                  {assetLibrary.length === 0 ? (
                    <div className={styles.emptyState}>Nenhum asset carregado.</div>
                  ) : (
                    <div className={styles.assetGrid}>
                      {assetLibrary.map(asset => (
                        <div key={asset.id} className={styles.assetGridCard}>
                          <img src={asset.url} alt={asset.name} className={styles.assetThumb} />
                          <span className={styles.assetName}>{asset.name.slice(0, 22)}</span>
                          <span className={styles.assetTypeLabel}>{asset.type}</span>

                          {asset.type === 'map' && (
                              <button onClick={() => handleSetSceneMap(asset.url)} className={styles.assetCardBtn}>Mudar fundo</button>
                          )}

                          {(asset.type === 'token' || asset.type === 'prop') && (
                              <button onClick={() => handleDropAssetToken(asset.name, asset.url, asset.type)} className={styles.assetCardBtn}>Colocar na mesa</button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
      </Dialog>

      {/* EDITOR DE TOKEN */}
      <Dialog open={!!editingToken} onClose={() => setEditingToken(null)} title="Editar token" description={editingToken?.name || 'Token sem nome'} size="large" className={`${styles.tokenEditBox} ${styles.vttDialog}`}>
        {editingToken && (
          <>
            <div className={styles.tokenEditPreview}>
              {editingToken.avatarUrl ? (
                <img
                  src={editingToken.avatarUrl}
                  alt={editingToken.name || 'Preview do token'}
                  className={editingToken.tokenShape === 'freeform' ? styles.tokenPreviewFreeform : styles.tokenPreviewCircle}
                />
              ) : (
                <div className={styles.tokenPreviewEmpty}>Sem imagem</div>
              )}
              <div>
                <strong>{editingToken.tokenShape === 'freeform' ? 'Personagem / PNG livre' : 'Circular'}</strong>
                <span>{editingToken.tokenShape === 'freeform' ? 'Imagem inteira, sem recorte.' : 'Retrato recortado em círculo.'}</span>
              </div>
            </div>

            <div className={styles.tokenEditGrid}>
              <label className={styles.tokenEditField}>
                <span>Nome interno</span>
                <input type="text" value={editingToken.name || ''} onChange={(e) => setEditingToken({ ...editingToken, name: e.target.value })} className={styles.inputField} />
              </label>

              <label className={styles.tokenEditField}>
                <span>Rótulo exibido</span>
                <input type="text" value={editingToken.label || ''} placeholder="Opcional" onChange={(e) => setEditingToken({ ...editingToken, label: e.target.value })} className={styles.inputField} />
              </label>
            </div>

            <label className={styles.tokenEditField}>
              <span>Formato do token</span>
              <select
                value={editingToken.tokenShape || 'circle'}
                onChange={(e) => {
                  const nextShape = e.target.value;
                  const currentRadius = Number(editingToken.radius || 35);
                  const currentWidth = Number(editingToken.width || currentRadius * 2 || 70);
                  const currentHeight = Number(editingToken.height || currentRadius * 2 || 70);
                  const naturalWidth = Number(editingToken.naturalWidth || 0);
                  const naturalHeight = Number(editingToken.naturalHeight || 0);
                  const freeformWidth = naturalWidth > 0 ? naturalWidth : currentWidth || currentRadius * 2 || 70;
                  const freeformHeight = naturalHeight > 0 ? naturalHeight : currentHeight || currentRadius * 2 || 70;
                  setEditingToken({
                    ...editingToken,
                    tokenShape: nextShape,
                    radius: nextShape === 'circle' ? Math.max(12, Number(editingToken.radius || Math.max(currentWidth, currentHeight) / 2 || 35)) : currentRadius,
                    width: nextShape === 'freeform' ? Math.max(12, freeformWidth) : currentWidth,
                    height: nextShape === 'freeform' ? Math.max(12, freeformHeight) : currentHeight,
                  });
                }}
                className={styles.inputField}
              >
                <option value="circle">Circular</option>
                <option value="freeform">Personagem / PNG livre</option>
              </select>
              <small>
                {editingToken.tokenShape === 'freeform'
                  ? 'Usa a imagem inteira, preservando transparência e proporção.'
                  : 'Usa recorte circular, ideal para retratos e combate tático.'}
              </small>
            </label>

            <div className={styles.tokenEditGrid}>
              {editingToken.tokenShape === 'freeform' ? (
                <>
                  <label className={styles.tokenEditField}>
                    <span>Largura</span>
                    <input type="number" min="12" value={editingToken.width || 70} onChange={(e) => setEditingToken({ ...editingToken, width: Number(e.target.value) })} className={styles.inputField} />
                  </label>
                  <label className={styles.tokenEditField}>
                    <span>Altura</span>
                    <input type="number" min="12" value={editingToken.height || 70} onChange={(e) => setEditingToken({ ...editingToken, height: Number(e.target.value) })} className={styles.inputField} />
                  </label>
                </>
              ) : (
                <label className={styles.tokenEditField}>
                  <span>Raio</span>
                  <input type="number" min="12" value={editingToken.radius || 35} onChange={(e) => setEditingToken({ ...editingToken, radius: Number(e.target.value), width: Number(e.target.value) * 2, height: Number(e.target.value) * 2 })} className={styles.inputField} />
                </label>
              )}

              <label className={styles.tokenEditField}>
                <span>Visibilidade</span>
                <select value={editingToken.isVisible ? 'visible' : 'hidden'} onChange={(e) => setEditingToken({ ...editingToken, isVisible: e.target.value === 'visible' })} className={styles.inputField}>
                  <option value="visible">Visível para jogadores</option>
                  <option value="hidden">Oculto para jogadores</option>
                </select>
              </label>
            </div>

            <label className={styles.tokenEditField}>
              <span>Status</span>
              <input type="text" value={editingToken.status || ''} placeholder="Ex.: envenenado, sangrando" onChange={(e) => setEditingToken({ ...editingToken, status: e.target.value })} className={styles.inputField} />
            </label>

            <div className={styles.tokenEditGrid}>
              <label className={styles.tokenEditField}>
                <span>HP atual</span>
                <input type="number" value={editingToken.hp} onChange={(e) => setEditingToken({ ...editingToken, hp: Number(e.target.value) })} className={styles.inputField} />
              </label>
              <label className={styles.tokenEditField}>
                <span>HP máximo</span>
                <input type="number" value={editingToken.maxHp} onChange={(e) => setEditingToken({ ...editingToken, maxHp: Number(e.target.value) })} className={styles.inputField} />
              </label>
            </div>

            <label className={styles.tokenEditField}>
              <span>Imagem / avatar</span>
              <div className={styles.tokenEditUploadRow}>
                <label className={styles.tokenEditUploadBtn}>
                  <FaUpload />
                  {isTokenImageUploading ? 'Enviando...' : 'Enviar imagem do token'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    disabled={isTokenImageUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      handleTokenImageUpload(file);
                    }}
                  />
                </label>
              </div>
            </label>

            <label className={styles.tokenEditField}>
              <span>Cor da aura mágica</span>
              <div className={styles.tokenEditColorRow}>
                <input type="color" value={editingToken.auraColor || '#000000'} onChange={(e) => setEditingToken({ ...editingToken, auraColor: e.target.value })} className={styles.tokenEditColorInput} />
                <input type="text" value={editingToken.auraColor || ''} placeholder="#ff0000" onChange={(e) => setEditingToken({ ...editingToken, auraColor: e.target.value })} className={styles.inputField} />
                <button type="button" onClick={() => setEditingToken({ ...editingToken, auraColor: '' })} className={styles.tokenEditGhostBtn}>Limpar</button>
              </div>
            </label>

            <div className={styles.tokenEditActions}>
              <button type="button" onClick={() => setEditingToken(null)} className={styles.tokenEditSecondaryBtn}>Cancelar edição</button>
              <button type="button" onClick={() => {
                const nextShape = editingToken.tokenShape || 'circle';
                const nextRadius = Math.max(12, Number(editingToken.radius || 35));
                const masterPatch = {
                  name: editingToken.name || 'Token',
                  label: editingToken.label || '',
                  hp: editingToken.hp,
                  maxHp: editingToken.maxHp,
                  status: editingToken.status,
                  auraColor: editingToken.auraColor,
                  isVisible: Boolean(editingToken.isVisible),
                  avatarUrl: editingToken.avatarUrl,
                  tokenShape: nextShape,
                  radius: nextShape === 'circle' ? nextRadius : editingToken.radius,
                  width: nextShape === 'freeform' ? Math.max(12, Number(editingToken.width || nextRadius * 2 || 70)) : editingToken.width,
                  height: nextShape === 'freeform' ? Math.max(12, Number(editingToken.height || nextRadius * 2 || 70)) : editingToken.height,
                };
                const playerPatch = {
                  avatarUrl: editingToken.avatarUrl,
                  tokenShape: nextShape,
                  radius: nextShape === 'circle' ? nextRadius : editingToken.radius,
                  width: nextShape === 'freeform' ? Math.max(12, Number(editingToken.width || nextRadius * 2 || 70)) : editingToken.width,
                  height: nextShape === 'freeform' ? Math.max(12, Number(editingToken.height || nextRadius * 2 || 70)) : editingToken.height,
                };
                updateTokenProps(editingToken.id, isMaster ? masterPatch : playerPatch);
                setEditingToken(null);
              }} className={styles.primaryBtn}>Salvar alterações</button>
            </div>
          </>
        )}
      </Dialog>

      {/* INPUT DE LABEL ABAIXO DO TOKEN (duplo clique) */}
      {editingLabel && (
        <form
          className={styles.labelEditorPopup}
          style={clampOverlayPosition(editingLabel.screenX - 160, editingLabel.screenY - 28, 320, 130)}
          onSubmit={(e) => {
            e.preventDefault();
            const nextValue = e.currentTarget.elements.floatingLabelValue.value.trim();
            updateTokenProps(editingLabel.id, editingLabel.mode === 'text'
              ? { text: nextValue, name: nextValue.slice(0, 20) || 'Texto' }
              : { label: nextValue });
            setEditingLabel(null);
          }}
        >
          <div className={styles.labelEditorHeader}>
            <span>{editingLabel.mode === 'text' ? 'Editar texto' : 'Editar rótulo'}</span>
          </div>
          <input
            autoFocus
            name="floatingLabelValue"
            type="text"
            defaultValue={editingLabel.currentLabel}
            placeholder="Escreva algo..."
            className={styles.labelEditorInput}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { setEditingLabel(null); return; }
            }}
          />
          <div className={styles.labelEditorActions}>
            <span className={styles.labelEditorHint}>Enter salva / Esc cancela</span>
            <button type="button" className={styles.labelEditorButton} onClick={() => setEditingLabel(null)}>Cancelar</button>
            <button type="submit" className={`${styles.labelEditorButton} ${styles.labelEditorButtonPrimary}`}>Salvar</button>
          </div>
        </form>
      )}

      {/* MENU DE CONTEXTO (redesenho premium) */}
      {contextMenu && (
        <div
          className={styles.contextMenu}
          style={{ ...clampOverlayPosition(contextMenu.x, contextMenu.y, 240, 420), padding: 0, overflow: 'hidden' }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          {/* Header com nome do token */}
          <div style={{ padding: '10px 14px', background: 'linear-gradient(135deg, #0e1a26, #1a2c3d)', borderBottom: '1px solid #1e3048', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaBullseye size={12} style={{ color: '#ff3333', flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <span style={{ display: 'block', color: '#fff', fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contextMenu.tokenName}</span>
            </div>
          </div>

          {/* A: Editar */}
          <div style={{ padding: '6px 8px' }}>
            {(!contextMenu.assetType || contextMenu.assetType === 'token') && (
              <button
                onClick={() => { setEditingToken({ id: contextMenu.tokenId, name: contextMenu.tokenName, label: contextMenu.label || '', hp: contextMenu.hp || '', maxHp: contextMenu.maxHp || '', status: contextMenu.status || '', auraColor: contextMenu.auraColor || '', isVisible: contextMenu.isVisible !== false, tokenShape: contextMenu.tokenShape || 'circle', radius: contextMenu.radius || 35, width: contextMenu.width || 70, height: contextMenu.height || 70, naturalWidth: contextMenu.naturalWidth || 0, naturalHeight: contextMenu.naturalHeight || 0, avatarUrl: contextMenu.avatarUrl || '' }); setContextMenu(null); }}
                className={styles.contextMenuItem}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', color: '#fff' }}
              >
                <FaPencilAlt size={11} style={{ color: '#ff3333' }} /> Editar token
              </button>
            )}

            {contextMenu.assetType === 'text' && (
              <button
                onClick={() => {
                  setSelectedTokenId(contextMenu.tokenId);
                  setSelectedTokenIds([contextMenu.tokenId]);
                  setActiveTool('text');
                  setContextMenu(null);
                }}
                className={styles.contextMenuItem}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', color: '#fff' }}
              >
                <FaFont size={11} style={{ color: '#bdbdbd' }} /> Editar texto
              </button>
            )}

            {(contextMenu.assetType === 'drawing' || contextMenu.assetType === 'shape' || contextMenu.assetType === 'map') && (
              <button
                onClick={() => {
                  setSelectedTokenId(contextMenu.tokenId);
                  setSelectedTokenIds([contextMenu.tokenId]);
                  setActiveTool('select');
                  setContextMenu(null);
                }}
                className={styles.contextMenuItem}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', color: '#fff' }}
              >
                <FaBullseye size={11} style={{ color: '#bdbdbd' }} /> Selecionar
              </button>
            )}
          </div>

          <div className={styles.divider} style={{ margin: '0 8px' }} />

          {/* Visibilidade */}
          <div style={{ padding: '6px 8px' }}>
            <button
              onClick={() => { toggleTokenVisibility(contextMenu.tokenId); setContextMenu(null); }}
              className={styles.contextMenuItem}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', color: contextMenu.isVisible ? '#ffd080' : '#b3f5b3' }}
            >
              {contextMenu.isVisible
                ? <><FaEyeSlash size={11} style={{ color: '#ffd080' }} /> Ocultar dos jogadores</>
                : <><FaEye size={11} style={{ color: '#b3f5b3' }} /> Revelar aos jogadores</>
              }
            </button>
          </div>

          <div className={styles.divider} style={{ margin: '0 8px' }} />

          {/* Mover de camada */}
          <div style={{ padding: '4px 8px 2px', fontSize: 10, color: '#8b8b8b', fontWeight: 'bold', letterSpacing: 0.8 }}>MOVER PARA CAMADA</div>
          <div style={{ padding: '2px 8px 6px' }}>
            <button onClick={() => { updateTokenProps(contextMenu.tokenId, { layer: 'token' }); setContextMenu(null); }} className={styles.contextMenuItem} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', color: contextMenu.layer === 'token' ? '#ff3333' : '#8b8b8b' }}>
              <FaUsers size={11} style={{ color: '#ff3333' }} /> Tokens (padrão)
            </button>
            <button onClick={() => { updateTokenProps(contextMenu.tokenId, { layer: 'gm' }); setContextMenu(null); }} className={styles.contextMenuItem} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', color: contextMenu.layer === 'gm' ? '#ff6969' : '#8b8b8b' }}>
              <FaGhost size={11} style={{ color: '#ff6969' }} /> Camada do Mestre
            </button>
            <button onClick={() => { updateTokenProps(contextMenu.tokenId, { layer: 'map' }); setContextMenu(null); }} className={styles.contextMenuItem} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', color: contextMenu.layer === 'map' ? '#ff3333' : '#8b8b8b' }}>
              <FaMapMarkedAlt size={11} style={{ color: '#ff3333' }} /> Trancado no Fundo
            </button>
          </div>

          <div className={styles.divider} style={{ margin: '0 8px' }} />

          {isMaster && selectedTokenIds.length >= 2 && (
            <>
              <div style={{ padding: '4px 8px 2px', fontSize: 10, color: '#4a6278', fontWeight: 'bold', letterSpacing: 0.8 }}>TRAVAR SELEÇÃO</div>
              <div style={{ padding: '2px 8px 6px' }}>
                <button onClick={lockSelectedTokens} className={styles.contextMenuItem} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', color: '#ff3333' }}>
                  <FaLock size={11} style={{ color: '#ff3333' }} /> Travar tokens juntos
                </button>
              </div>
              <div className={styles.divider} style={{ margin: '0 8px' }} />
            </>
          )}

          {isMaster && selectedTokenGroupId && (
            <>
              <div style={{ padding: '2px 8px 6px' }}>
                <button onClick={unlockSelectedTokens} className={styles.contextMenuItem} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', color: '#ffd080' }}>
                  <FaUnlock size={11} style={{ color: '#ffd080' }} /> Destravar seleção
                </button>
              </div>
              <div className={styles.divider} style={{ margin: '0 8px' }} />
            </>
          )}

          {/* Copiar / Apagar */}
          <div style={{ padding: '6px 8px' }}>
            <button onClick={() => { removeToken(contextMenu.tokenId); setContextMenu(null); }} className={styles.contextMenuItem} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', color: '#ff6969' }}>
              <FaTrash size={11} style={{ color: '#ff6969' }} /> Excluir
            </button>
          </div>
        </div>
      )}

      {/* BARRA LATERAL (FERRAMENTAS) */}
      <div className={`${styles.leftSidebar} ${isLeftToolbarCollapsed ? styles.leftSidebarCollapsed : ''}`}>
        <CollapseToggleButton
          collapsed={isLeftToolbarCollapsed}
          direction={isLeftToolbarCollapsed ? 'right' : 'left'}
          title={isLeftToolbarCollapsed ? 'Expandir ferramentas' : 'Recolher ferramentas'}
          className={styles.panelCollapseBtn}
          onClick={() => setIsLeftToolbarCollapsed((value) => !value)}
        />
        <div className={styles.toolGroup}>
          <div className={styles.toolGroupLabel}>Mesa</div>
          <button onClick={() => setActiveTool('select')} title="Selecionar (V)" className={`${styles.toolBtn} ${activeTool === 'select' ? styles.toolBtnActive : ''}`}><FaBullseye size={16}/></button>
          <div className={styles.toolGroupInline}>
            <button onClick={() => setActiveTool('ruler')} title="Régua (R)" className={`${styles.toolBtn} ${activeTool === 'ruler' ? styles.toolBtnActive : ''}`}><FaRuler size={15}/></button>
            {activeTool === 'ruler' && isMaster && (
              <div className={styles.toolPanel}>
                <div className={styles.toolPanelHeader}>Régua visual</div>
                <label className={styles.toolLabelStack}>
                  <span>1 SQ = <strong style={{ color: '#fff' }}>{rulerMultiplier}</strong></span>
                  <input type="number" step="0.5" value={rulerMultiplier} onChange={(e) => setRulerMultiplier(Number(e.target.value))} className={styles.inputField} style={{ width: '100%' }} />
                </label>
                <label className={styles.toolLabelRow}>
                  <span>Unidade</span>
                  <select value={rulerUnit} onChange={(e) => setRulerUnit(e.target.value)} className={styles.inputField} style={{ width: 104, padding: '6px 8px' }}>
                     <option value="m">Metros</option>
                     <option value="ft">Pés</option>
                     <option value="px">Quadrados</option>
                  </select>
                </label>
              </div>
            )}
          </div>
          <button onClick={() => setActiveTool('pan')} title="Mover câmera (H)" className={`${styles.toolBtn} ${activeTool === 'pan' ? styles.toolBtnActive : ''}`}><FaHandPaper size={16}/></button>
          <button onClick={() => setShowGrid(!showGrid)} title="Exibir/ocultar grade (G)" className={`${styles.toolBtn} ${showGrid ? styles.toolBtnActive : ''}`}><FaThLarge size={15}/></button>
        </div>

        <div className={styles.divider} />

        <div className={styles.toolGroup}>
          <div className={styles.toolGroupLabel}>Desenho</div>
          <button onClick={() => setActiveTool('draw')} title="Desenho livre (D)" className={`${styles.toolBtn} ${activeTool === 'draw' ? styles.toolBtnActive : ''}`}><FaPencilAlt size={14}/></button>
          <button onClick={() => setActiveTool('shape')} title="Formas" className={`${styles.toolBtn} ${activeTool === 'shape' ? styles.toolBtnActive : ''}`}><FaShapes size={14}/></button>
          <button onClick={() => setActiveTool('text')} title="Texto (T)" className={`${styles.toolBtn} ${activeTool === 'text' ? styles.toolBtnActive : ''}`}><FaFont size={14}/></button>
          <button onClick={() => setActiveTool('erase')} title="Borracha (E)" className={`${styles.toolBtn} ${activeTool === 'erase' ? styles.toolBtnActive : ''}`}><FaEraser size={14}/></button>
          {isMaster && <button onClick={() => setActiveTool('fog')} title="Fog of War / Máscara" className={`${styles.toolBtn} ${activeTool === 'fog' ? styles.toolBtnActive : ''}`}><FaLowVision size={15}/></button>}
        </div>
        <div className={styles.divider} />

        {isMaster && (
          <div className={styles.toolGroup}>
            <div className={styles.toolGroupLabel}>Camadas</div>
            <button
              onClick={(e) => { e.stopPropagation(); toggleLayersMenu(); }}
              title="Gerenciar camadas"
              className={`${styles.toolBtn} ${isLayersMenuOpen || activeEditorLayer !== 'token' ? styles.toolBtnActive : ''}`}
            >
              <FaLayerGroup size={15}/>
            </button>
            {isLayersMenuOpen && (
              <div className={`${styles.toolPanel} ${styles.sidebarMenuPanel}`} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                <div className={styles.toolPanelHeader}>Editar camadas</div>
                <button onClick={() => { setActiveEditorLayer('map'); setIsLayersMenuOpen(false); }} className={`${styles.layerMenuBtn} ${activeEditorLayer === 'map' ? styles.layerMenuBtnActive : ''}`}><FaMapMarkedAlt size={13}/> <span>Mapa</span></button>
                <button onClick={() => { setActiveEditorLayer('token'); setIsLayersMenuOpen(false); }} className={`${styles.layerMenuBtn} ${activeEditorLayer === 'token' ? styles.layerMenuBtnActive : ''}`}><FaUsers size={13}/> <span>Tokens</span></button>
                <button onClick={() => { setActiveEditorLayer('gm'); setIsLayersMenuOpen(false); }} className={`${styles.layerMenuBtn} ${activeEditorLayer === 'gm' ? styles.layerMenuBtnActive : ''}`}><FaUserSecret size={13}/> <span>Camada do mestre</span></button>
                <label className={styles.layerMenuToggle}>
                  <span>Exibir camada do mestre</span>
                  <input type="checkbox" checked={showGmLayer} onChange={(e) => setShowGmLayer(e.target.checked)} />
                </label>
              </div>
            )}
          </div>
        )}

        <div className={styles.divider} />

        <div className={styles.toolGroup}>
          <div className={styles.toolGroupLabel}>Ações</div>
          <button onClick={() => setUndoSignal(v => v + 1)} title="Desfazer (Ctrl+Z)" className={styles.toolBtn}><FaUndo size={14}/></button>
          <button onClick={() => setRedoSignal(v => v + 1)} title="Refazer (Ctrl+Y)" className={styles.toolBtn}><FaRedo size={14}/></button>
          {isMaster && (
            <div className={styles.toolGroupInline}>
              <button
                onClick={(e) => { e.stopPropagation(); toggleGridMenu(); }}
                title="Configurar grade"
                className={`${styles.toolBtn} ${isGridMenuOpen ? styles.toolBtnActive : ''}`}
              >
                <FaSlidersH size={14}/>
              </button>
              {isGridMenuOpen && (
                <div className={`${styles.toolPanel} ${styles.sidebarMenuPanel}`} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                  <div className={styles.toolPanelHeader}>Configurar grade</div>
                  <label className={styles.toolLabelStack}>
                    <span>Tamanho da célula: <strong style={{ color: '#fff' }}>{gridSize}px</strong></span>
                    <input type="range" min="30" max="150" step="5" value={gridSize} onChange={e => setGridSize(Number(e.target.value))} className={styles.toolRange} />
                  </label>
                  <label className={styles.toolLabelStack}>
                    <span>Opacidade: <strong style={{ color: '#fff' }}>{Math.round(gridOpacity * 100)}%</strong></span>
                    <input type="range" min="0.05" max="1" step="0.05" value={gridOpacity} onChange={e => setGridOpacity(Number(e.target.value))} className={styles.toolRange} />
                  </label>
                  <label className={styles.toolLabelRow}>
                    <span>Cor da grade</span>
                    <input type="color" value={gridColor} onChange={e => setGridColor(e.target.value)} className={styles.toolColorInput} />
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.divider} />
        <button onClick={() => setIsHelpOpen(true)} title="Atalhos do VTT" className={styles.toolBtn}><FaQuestionCircle size={15}/></button>
      </div>



      {/* PAINEL DIREITO (CHAT, FICHAS E ESCUDO) */}
      <div className={`${styles.rightPanel} ${isRightPanelCollapsed ? styles.rightPanelCollapsed : ''}`}>
        <CollapseToggleButton
          collapsed={isRightPanelCollapsed}
          direction={isRightPanelCollapsed ? 'left' : 'right'}
          title={isRightPanelCollapsed ? 'Expandir painel' : 'Recolher painel'}
          className={styles.rightPanelCollapseBtn}
          onClick={() => setIsRightPanelCollapsed((value) => !value)}
        />
        <div className={styles.rightTabsHeader}>
          <button onClick={() => setRightTab('chat')} className={`${styles.rightTabBtn} ${rightTab === 'chat' ? styles.rightTabBtnActive : ''}`}>CHAT</button>
          <button onClick={() => setRightTab('sheet')} className={`${styles.rightTabBtn} ${rightTab === 'sheet' ? styles.rightTabBtnActive : ''}`}>FICHAS</button>
          {isMaster && <button onClick={() => setRightTab('shield')} className={`${styles.rightTabBtn} ${rightTab === 'shield' ? styles.rightTabBtnActive : ''}`}>ESCUDO</button>}
        </div>

        {rightTab === 'chat' && (
          <>
            <div ref={chatListRef} onScroll={handleChatScroll} className={styles.chatViewport}>
              {chatEntries.length === 0 && (
                <div className={styles.chatEmptyState}>
                  A mesa ainda está silenciosa. Role dados, envie mensagens ou compartilhe eventos para começar o registro da sessão.
                </div>
              )}
              {chatEntries.map((entry, idx) => {
                if (entry.type === 'system') {
                  return (
                    <div key={`sys-${idx}-${entry.ts}`} className={styles.chatSystemCard}>
                      <span>Sistema</span>
                      <strong>{timeFmt(entry.ts)}</strong>
                      {repairPortugueseText(entry.data.message)}
                    </div>
                  );
                }

                if (entry.type === 'text') {
                  let parsed = null;
                  try {
                    parsed = JSON.parse(entry.data.text);
                  } catch (err) {
                    parsed = null;
                  }

                  if (parsed?.type === 'npc_card') {
                    const { npc, rpDetails } = parsed;
                    return (
                      <div key={`txt-${idx}-${entry.ts}`} className={`${styles.chatJsonCard} ${styles.chatNpcCard}`}>
                        <div className={styles.chatCardKicker}>
                          <div><FaUserSecret /> <strong>NPC compartilhado</strong></div>
                          <span>{timeFmt(entry.ts)}</span>
                        </div>
                        <div className={styles.chatRollTitle}>{repairPortugueseText(npc.name)}</div>
                        <div className={styles.chatRollSubtitle}>{repairPortugueseText(npc.occupation)}</div>
                        <div className={styles.chatInfoBox}>
                          <div><strong>Temperamento:</strong> {repairPortugueseText(rpDetails.temperament)}</div>
                          <div><strong>Objetivo:</strong> {repairPortugueseText(rpDetails.objective)}</div>
                        </div>
                      </div>
                    );
                  }

                  if (parsed?.type === 'event_card') {
                    const { card } = parsed;
                    return (
                      <div key={`txt-${idx}-${entry.ts}`} className={`${styles.chatJsonCard} ${styles.chatEventCard}`}>
                        <div className={styles.chatCardKicker}>
                          <div><FaLayerGroup /> <strong>Evento da mesa</strong></div>
                          <span>{timeFmt(entry.ts)}</span>
                        </div>
                        <div className={styles.chatRollTitle}>{repairPortugueseText(card.title)}</div>
                        <div className={styles.chatRollSubtitle}>{repairPortugueseText(card.type)}</div>
                        <div className={styles.chatQuoteBox}>{repairPortugueseText(card.desc)}</div>
                      </div>
                    );
                  }

                  return (
                    <div key={`txt-${idx}-${entry.ts}`} className={styles.chatMessageCard}>
                      <div className={styles.chatMessageMeta}>
                        <strong>{repairPortugueseText(entry.data.senderName)}</strong>
                        <span>{timeFmt(entry.ts)}</span>
                      </div>
                      <div className={styles.chatMessageBody}>{repairPortugueseText(entry.data.text)}</div>
                    </div>
                  );
                }

                const roll = entry.data;
                const actorName = repairPortugueseText(charNameById.get(String(roll.characterId)) || roll.rollerName || 'Personagem');
                return (
                  <RollResultCard
                    key={`roll-${idx}-${entry.ts}`}
                    roll={roll.roll || []}
                    actorName={actorName}
                    actionLabel={repairPortugueseText(roll.skill || 'Instinto + Conhecimento/Prática')}
                    formula={roll.formula}
                    timestamp={roll.timestamp || entry.ts}
                    selection={roll.selection}
                    variant="full"
                  />
                );
              })}
              <div ref={chatEndRef} className={styles.chatEndAnchor} />
              {unreadChatCount > 0 && (
                <button type="button" className={styles.chatNewMessagesBtn} onClick={() => scrollChatToEnd('smooth')}>
                  {formatPlural(unreadChatCount, 'nova mensagem', 'novas mensagens')}
                </button>
              )}
            </div>

            <div className={styles.chatComposer}>
              <div className={styles.chatComposerRow}>
                <div className={styles.chatIdentityLabel}>Rolando como <strong>{activeRollCharacter?.name || 'Nenhuma ficha selecionada'}</strong></div>
                {isMaster && (
                  <select value={chatIdentity} onChange={(e) => setChatIdentity(e.target.value)} className={`${styles.inputField} ${styles.chatIdentitySelect}`}>
                    <option value="character">Token de {activeRollCharacter?.name || 'Ficha'}</option>
                    <option value="gm">Mestre (Narrador)</option>
                  </select>
                )}
              </div>

              <div className={styles.chatRollModeTabs}>
                <button type="button" onClick={() => setRollMode('skill')} className={`${styles.rollModeBtn} ${rollMode === 'skill' ? styles.rollModeBtnActive : ''}`}>Perícia + Instinto</button>
                <button type="button" onClick={() => setRollMode('assimilation')} className={`${styles.rollModeBtn} ${rollMode === 'assimilation' ? styles.rollModeBtnActive : ''}`}>Assimilação</button>
                <button type="button" onClick={() => setRollMode('manual')} className={`${styles.rollModeBtn} ${rollMode === 'manual' ? styles.rollModeBtnActive : ''}`}>Livre</button>
              </div>

              {rollMode === 'manual' ? (
                <input
                  value={manualRollFormula}
                  onChange={(e) => setManualRollFormula(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !isRolling) submitRoll(); }}
                  placeholder="Ex.: 1d6 + 2d10"
                  aria-label="Fórmula da rolagem livre"
                  className={styles.inputField}
                />
              ) : rollMode === 'skill' ? (
                <>
                  <select value={selectedSkillKey} onChange={(e) => setSelectedSkillKey(e.target.value)} className={styles.inputField}>
                    <option value="">Selecione a perícia</option>
                    {availableSkillKeys.map((key) => <option key={key} value={key}>{t(key)} ({getSkillTypeLabel(key)})</option>)}
                  </select>
                  <select value={selectedInstinctKey} onChange={(e) => setSelectedInstinctKey(e.target.value)} className={styles.inputField}>
                    <option value="">Selecione o instinto</option>
                    {availableInstinctKeys.map((key) => <option key={key} value={key}>{t(key)}</option>)}
                  </select>
                </>
              ) : (
                <>
                  <select value={assimilateInstinctA} onChange={(e) => setAssimilateInstinctA(e.target.value)} className={styles.inputField}>
                    <option value="">Instinto 1</option>
                    {availableInstinctKeys.map((key) => <option key={key} value={key}>{t(key)}</option>)}
                  </select>
                  <select value={assimilateInstinctB} onChange={(e) => setAssimilateInstinctB(e.target.value)} className={styles.inputField}>
                    <option value="">Instinto 2</option>
                    {availableInstinctKeys.map((key) => <option key={key} value={key}>{t(key)}</option>)}
                  </select>
                </>
              )}

              {rollMode !== 'manual' && activeRollCharacter && (
                <div className={styles.rollResourceBar}>
                  <div className={styles.rollResourceBalance} aria-label="Recursos do Cabo de Guerra">
                    <span title="Pontos de Determinação disponíveis">
                      <img src={determinationPointIcon} alt="" />
                      <strong>{Number(activeRollCharacter.determinationPoints || 0)}</strong>
                      <small>/{Number(activeRollCharacter.determinationLevel || 0)}</small>
                    </span>
                    <span title="Pontos de Assimilação disponíveis">
                      <img src={assimilationPointIcon} alt="" />
                      <strong>{Number(activeRollCharacter.assimilationPoints || 0)}</strong>
                      <small>/{Number(activeRollCharacter.assimilationLevel || 0)}</small>
                    </span>
                    {rollMode === 'assimilation' && (
                      <em title="Custo de Agir por Instinto">
                        Instinto -{Number(activeRollCharacter.assimilationPoints || 0) > 0 ? '1 ASS' : '2 DET'}
                      </em>
                    )}
                  </div>
                  <label
                    className={`${styles.rollResourceToggle} ${useDeterminationForRoll ? styles.rollResourceToggleActive : ''}`}
                    title="Empenho: gaste 1 Ponto de Determinação antes da rolagem para manter um dado adicional. Máximo de uma vez por rodada."
                  >
                    <input
                      type="checkbox"
                      checked={useDeterminationForRoll}
                      onChange={(event) => setUseDeterminationForRoll(event.target.checked)}
                      disabled={Number(activeRollCharacter.determinationPoints || 0) < (rollMode === 'assimilation' && Number(activeRollCharacter.assimilationPoints || 0) < 1 ? 3 : 1)}
                    />
                    <i aria-hidden="true" />
                    <span>Empenho <small>+1 dado</small></span>
                  </label>
                </div>
              )}

              <button type="button" onClick={submitRoll} disabled={isRolling} className={styles.primaryBtn} style={{ opacity: isRolling ? 0.6 : 1 }}>{isRolling ? 'Rolando...' : 'Rolar dados'}</button>
              <div className={styles.chatMessageComposer}>
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendTextMessage()} placeholder="Mensagem da mesa..." className={styles.inputField} />
                <button type="button" onClick={sendTextMessage} className={styles.secondaryBtn}>Enviar</button>
              </div>
            </div>
          </>
        )}

        {rightTab === 'sheet' && (
          <div className={styles.sheetViewport}>
            <div className={styles.sheetHeaderBlock}>
              <div>
                <div className={styles.sheetKicker}>Campanha</div>
                <div className={styles.sheetPanelTitle}>Fichas da Campanha</div>
              </div>
              <input
                value={sheetSearch}
                onChange={(e) => setSheetSearch(e.target.value)}
                className={styles.sheetSearchInput}
                placeholder="Buscar ficha..."
              />
              <div className={styles.sheetFilterRow}>
                {[
                  ['all', 'Todos'],
                  ['players', 'Jogadores'],
                  ['npcs', 'NPCs'],
                  ['mine', 'Meus']
                ].map(([value, label]) => (
                  <button key={value} type="button" onClick={() => setSheetFilter(value)} className={sheetFilter === value ? styles.sheetFilterActive : ''}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.sheetLayout}>
              <div className={styles.sheetList}>
                {filteredSheetCharacters.map((char) => {
                  const tokenCount = tokensByCharacterId.get(String(char._id))?.length || 0;
                  return (
                    <button
                      key={char._id}
                      type="button"
                      onClick={() => setSelectedSheetCharId(char._id)}
                      className={`${styles.sheetListCard} ${selectedSheetCharacter?._id === char._id ? styles.sheetListCardActive : ''}`}
                    >
                      <img src={char.avatar || 'https://konvajs.org/assets/lion.png'} alt={char.name} className={styles.sheetListAvatar} />
                      <span>
                        <strong>{char.name}</strong>
                        <small>{prettyMeta(char.occupation, 'Função n/d')}</small>
                      </span>
                      {tokenCount > 0 && <em>{tokenCount} no mapa</em>}
                    </button>
                  );
                })}
              </div>

              {!selectedSheetCharacter && <div className={styles.sheetEmptyState}>Nenhuma ficha encontrada.</div>}

              {selectedSheetCharacter && (
              <div className={styles.sheetStack}>
                <section className={styles.sheetHeroCard}>
                  <div className={styles.sheetHeroHeader}>
                    <img src={selectedSheetCharacter.avatar || 'https://konvajs.org/assets/lion.png'} alt={selectedSheetCharacter.name} className={styles.sheetAvatar} />
                    <div className={styles.sheetHeroInfo}>
                      <div className={styles.sheetKicker}>Ficha ativa</div>
                      <div className={styles.sheetName}>{selectedSheetCharacter.name}</div>
                      <div className={styles.sheetSubtext}>{prettyMeta(selectedSheetCharacter.generation, 'Geração n/d')} | {prettyMeta(selectedSheetCharacter.occupation, 'Ocupação n/d')}</div>
                      {!!tokensByCharacterId.get(String(selectedSheetCharacter._id))?.length && (
                        <div className={styles.sheetTokenBadge}>Token no mapa</div>
                      )}
                    </div>
                  </div>

                  {selectedSheetHealth && (
                    <div className={`${styles.sheetHealthBlock} ${styles[`sheetHealth${selectedSheetHealth.severity[0].toUpperCase()}${selectedSheetHealth.severity.slice(1)}`] || ''}`}>
                      <div className={styles.sheetHealthHeader}>
                        <span>Status Vital</span>
                        <strong>{selectedSheetHealth.currentName}</strong>
                      </div>
                      <div className={styles.sheetHealthMeta}>
                        <span>Nível {selectedSheetHealth.currentLevel}/6</span>
                        <span>{selectedSheetHealth.currentValue}/{selectedSheetHealth.maxPerLevel} neste nível</span>
                      </div>
                      <div className={styles.sheetHearts} title={`Vida do nível atual: ${selectedSheetHealth.currentValue}/${selectedSheetHealth.maxPerLevel}`}>
                        {Array.from({ length: selectedSheetHealth.maxPerLevel }).map((_, idx) => (
                          idx < selectedSheetHealth.currentValue
                            ? <FaHeart key={idx} size={14} />
                            : <FaRegHeart key={idx} size={14} />
                        ))}
                      </div>
                      <div className={styles.sheetHealthTrack} aria-label="Trilha de status vital">
                        {[6, 5, 4, 3, 2, 1].map((level) => (
                          <span
                            key={level}
                            className={`${styles.sheetHealthSegment} ${level === selectedSheetHealth.currentLevel ? styles.sheetHealthSegmentActive : ''} ${level < selectedSheetHealth.currentLevel ? styles.sheetHealthSegmentDanger : ''}`}
                            title={`${healthLevelDetails[level].name}: ${selectedSheetHealth.healthLevels[6 - level]}/${selectedSheetHealth.maxPerLevel}`}
                          >
                            {level}
                          </span>
                        ))}
                      </div>
                      <p className={styles.sheetHealthDescription}>{selectedSheetHealth.currentDescription}</p>
                    </div>
                  )}
                </section>

                <div className={styles.sheetStatGrid}>
                  <div className={styles.sheetStatCard}>
                    <div className={styles.sheetStatValue}>{(selectedSheetCharacter.inventory || []).length}</div>
                    <div className={styles.sheetStatLabel}>Itens</div>
                  </div>
                  <div className={styles.sheetStatCard}>
                    <div className={styles.sheetStatValue}>{(selectedSheetCharacter.characteristics || []).length}</div>
                    <div className={styles.sheetStatLabel}>Características</div>
                  </div>
                  <div className={styles.sheetStatCard}>
                    <div className={styles.sheetStatValue}>{(selectedSheetCharacter.assimilations || []).length}</div>
                    <div className={styles.sheetStatLabel}>Assimilações</div>
                  </div>
                  <div className={styles.sheetStatCard}>
                    <div className={styles.sheetStatValue}>{Object.values(selectedSheetCharacter.instincts || {}).reduce((sum, value) => sum + Number(value || 0), 0)}</div>
                    <div className={styles.sheetStatLabel}>Instintos</div>
                  </div>
                </div>

                <div className={styles.sheetActionStack}>
                  <button type="button" onClick={() => setSheetOverlayCharId(selectedSheetCharacter._id)} className={styles.sheetActionBtn}>
                    <FaFolder /> Abrir ficha completa
                  </button>
                  {!!tokensByCharacterId.get(String(selectedSheetCharacter._id))?.length && (
                    <button
                      type="button"
                      onClick={() => {
                        const tokenOnMap = tokensByCharacterId.get(String(selectedSheetCharacter._id))?.[0];
                        if (!tokenOnMap) return;
                        setSelectedTokenId(tokenOnMap.id);
                        setSelectedTokenIds([tokenOnMap.id]);
                        setActiveTool('select');
                      }}
                      className={styles.sheetActionBtn}
                    >
                      <FaCrosshairs /> Localizar token
                    </button>
                  )}
                  {canPlaceSheetToken(selectedSheetCharacter) && (
                    <button type="button" onClick={() => spawnToken(selectedSheetCharacter)} className={`${styles.sheetActionBtn} ${styles.sheetActionBtnAccent}`}>
                      <FaBullseye /> {isMaster
                        ? (tokensByCharacterId.get(String(selectedSheetCharacter._id))?.length ? 'Adicionar outro token' : 'Colocar token no centro')
                        : (tokensByCharacterId.get(String(selectedSheetCharacter._id))?.length ? 'Adicionar outro token meu' : 'Colocar meu token')}
                    </button>
                  )}
                </div>
              </div>
              )}
            </div>
          </div>
        )}
        {rightTab === 'shield' && isMaster && (
          <div className={styles.shieldViewport}>
            <div className={styles.shieldActionGrid}>
              <button type="button" onClick={() => navigate(`/campaign-sheet/${id}`)} className={`${styles.shieldActionBtn} ${styles.shieldActionWide}`}>
                <FaFolder />
                <span>Painel da Campanha</span>
              </button>
              <button type="button" onClick={() => setOpenNpcModal(true)} className={styles.shieldActionBtn}>
                <FaUserSecret />
                <span>Add NPC</span>
              </button>
              <button type="button" onClick={() => setOpenEventDeckModal(true)} className={styles.shieldActionBtn}>
                <FaLayerGroup />
                <span>Baralho</span>
              </button>
              {!activeConflict && (
                <button type="button" onClick={() => setOpenConflictModal(true)} className={`${styles.shieldActionBtn} ${styles.shieldActionDanger} ${styles.shieldActionWide}`}>
                  <FaCrosshairs />
                  <span>Iniciar Conflito</span>
                </button>
              )}
            </div>

            <section className={styles.shieldCard}>
              <div className={styles.shieldCardHeader}>
                <span><FaDiceD20 /> Dados Livres</span>
              </div>
              <MasterDiceRoller
                campaignId={id}
                onRollCreated={(roll) => setRecentRolls((prev) => mergeChatItems(prev, roll, 'roll', 100))}
              />
            </section>

            {!activeConflict && (
              <div className={styles.shieldEmptyState}>Nenhum conflito ativo no momento.</div>
            )}

            {activeConflict && (
              <div className={styles.shieldConflictStack}>
                <section className={styles.shieldCard}>
                  <div className={styles.shieldCardHeader}>
                    <span>Objetivos</span>
                  </div>
                  {(activeConflict.objectives || []).map((obj, idx) => (
                    <div key={`obj-${idx}`} className={styles.shieldProgressRow}>
                      <div>
                        <strong>{obj.name || `Objetivo ${idx + 1}`}</strong>
                        <span>{obj.progress}/{obj.total}</span>
                      </div>
                      <div className={styles.shieldStepper}>
                        <button type="button" onClick={() => handleProgressUpdate('objective', idx, -1)} disabled={isConflictLoading}>-</button>
                        <button type="button" onClick={() => handleProgressUpdate('objective', idx, 1)} disabled={isConflictLoading}>+</button>
                      </div>
                    </div>
                  ))}
                </section>

                <section className={styles.shieldCard}>
                  <div className={styles.shieldCardHeader}>
                    <span>Ameaças</span>
                  </div>
                  {(activeConflict.threats || []).map((threat, tIdx) => (
                    <div key={`thr-${tIdx}`} className={styles.shieldThreatBlock}>
                      <div className={styles.shieldThreatTitle}>{threat.name || `Ameaça ${tIdx + 1}`}</div>
                      {(threat.activations || []).map((act, aIdx) => (
                        <div key={`act-${tIdx}-${aIdx}`} className={styles.shieldProgressRow}>
                          <div>
                            <strong>{act.name || `Ativação ${aIdx + 1}`}</strong>
                            <span>{act.progress}/{act.total}</span>
                          </div>
                          <div className={styles.shieldStepper}>
                            <button type="button" onClick={() => handleProgressUpdate('threat', tIdx, -1, aIdx)} disabled={isConflictLoading}>-</button>
                            <button type="button" onClick={() => handleProgressUpdate('threat', tIdx, 1, aIdx)} disabled={isConflictLoading}>+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </section>

                <button type="button" onClick={handleEndConflict} disabled={isConflictLoading} className={styles.shieldEndBtn}>
                  Encerrar Conflito
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <ConflictTracker open={openConflictModal} onClose={() => setOpenConflictModal(false)} onStartConflict={handleStartConflict} />

      <RollKeepSelector
        open={!!pendingRoll}
        rollData={pendingRoll?.payload}
        keepCount={pendingRoll?.keepCount || 1}
        onCancel={() => setPendingRoll(null)}
        onConfirm={(selectedRoll) => {
          setPendingRoll(null);
          publishRoll(selectedRoll);
        }}
      />

      <Dialog open={isHelpOpen} onClose={() => setIsHelpOpen(false)} title="Atalhos do VTT" size="small" actions={<button type="button" onClick={() => setIsHelpOpen(false)} className={styles.primaryBtn}>Entendi</button>}>
            <ul style={{ listStyle: 'none', padding: 0, color: '#dce5ef', fontSize: 13, lineHeight: '2' }}>
              <li><strong>RMB (Direito)</strong>: Mover câmera (Pan) livre</li>
              <li><strong>V</strong>: Selecionar</li>
              <li><strong>R</strong>: Régua</li>
              <li><strong>D</strong>: Desenho livre (Caneta)</li>
              <li><strong>T</strong>: Texto</li>
              <li><strong>E</strong>: Borracha</li>
              <li><strong>G</strong>: Grade do mapa</li>
              <li><strong>Ctrl + C / Ctrl + V</strong>: Copiar/colar</li>
              <li><strong>Ctrl + Z</strong>: Desfazer</li>
              <li><strong>Ctrl + Y</strong>: Refazer</li>
            </ul>
      </Dialog>

      <Dialog open={openNpcModal} onClose={() => setOpenNpcModal(false)} title="Gerar NPC rápido" size="large" className={styles.vttDialog}>
             <NPCGenerator campaignId={id} onNpcSaved={() => setOpenNpcModal(false)} onShareToChat={handleShareToChat} />
      </Dialog>

      <EventDeckModal open={openEventDeckModal} onClose={() => setOpenEventDeckModal(false)} onSelectEvent={() => setOpenEventDeckModal(false)} onShareToChat={handleShareToChat} />

      <Dialog open={!!sheetOverlayCharId} onClose={() => setSheetOverlayCharId('')} title="Ficha integrada" description="Ficha aberta dentro do VTT" size="large" className={`${styles.sheetModal} ${styles.vttDialog}`}>
        {sheetOverlayCharId && (
            <iframe title="Ficha do personagem" src={`/character-sheet/${sheetOverlayCharId}?embed=1&vtt=1`} className={styles.sheetModalFrame} />
        )}
      </Dialog>

      <Profiler id="VTTMap" onRender={handleMapProfile}>
      <VTTMap
        mapUrl={mapUrl}
        tokens={tokens}
        updateTokenPosition={updateTokenPosition}
        updateTokenProps={updateTokenProps}
        isMaster={isMaster}
        toggleTokenVisibility={toggleTokenVisibility}
        removeToken={removeToken}
        showGrid={showGrid}
        showMapLayer={showMapLayer}
        showTokenLayer={showTokenLayer}
        showGmLayer={showGmLayer}
        gridSize={gridSize}
        gridOpacity={gridOpacity}
        gridColor={gridColor}
        mapScaleMultiplier={mapScaleMultiplier}
        selectedTokenId={selectedTokenId}
        selectedTokenIds={selectedTokenIds}
        setSelectedTokenId={setSelectedTokenId}
        setSelectedTokenIds={setSelectedTokenIds}
        cameraResetKey={cameraResetKey}
        activeTool={activeTool}
        drawColor={drawColor}
        drawWidth={drawWidth}
        drawOpacity={drawOpacity}
        drawMode={drawMode}
        shapeTool={shapeTool}
        fogOfWar={currentFogOfWar}
        fogMode={fogMode}
        fogShape={fogShape}
        onAddFogArea={handleAddFogArea}
        drawFillColor={drawFillColor}
        drawHasFill={drawHasFill}
        drawFillOpacity={drawFillOpacity}
        drawFontFamily={drawFontFamily}
        drawFontSize={drawFontSize}
        drawFontBold={drawFontBold}
        drawFontItalic={drawFontItalic}
        drawTextUnderline={drawTextUnderline}
        drawTextStrokeColor={drawTextStrokeColor}
        drawTextStrokeWidth={drawTextStrokeWidth}
        drawTextShadow={drawTextShadow}
        drawTextAlign={drawTextAlign}
        drawTextBgColor={drawTextBgColor}
        drawTextBgOpacity={drawTextBgOpacity}
        drawTextBg={drawTextBg}
        eraseSize={eraseSize}
        rulerUnit={rulerUnit}
        rulerMultiplier={rulerMultiplier}
        rulerMoveBudget={rulerMoveBudget}
        activeRulers={activeSceneRulers}
        currentUserId={currentUserId}
        onRulerStart={emitRulerStart}
        onRulerUpdate={emitRulerUpdate}
        onRulerEnd={emitRulerEnd}
        initialDrawings={drawings}
        onAddDrawing={handleAddDrawing}
        onRemoveDrawing={handleRemoveDrawing}
        onAddShapeToken={handleAddShapeToken}
        onCommitHistory={recordHistory}
        onTokenContextMenu={handleTokenContextMenu}
        activeEditorLayer={activeEditorLayer}
        onEditLabel={handleEditCanvasLabel}
      />
      </Profiler>
      <VTTPerformancePanel
        tokens={tokens.length}
        drawings={drawings.length}
        fogAreas={currentFogOfWar.areas.length}
        revision={latestRevisionRef.current}
        pending={pendingMutationCount}
        historySize={historyRef.current.length}
      />
    </div>
  );
};

export default VTT;
