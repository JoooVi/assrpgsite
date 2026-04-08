import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import axios from 'axios';
import styles from './VTT.module.css'; 
import VTTMap from '../components/VTT/VTTMap';
import ConflictTracker from '../components/ConflictTracker';
import coruja from '../assets/Coruja_1.png';
import cervo from '../assets/Cervo_1.png';
import joaninha from '../assets/Joaninha_1.png';
import { 
  FaBullseye, FaHandPaper, FaThLarge, FaMapMarkedAlt, FaPlus, FaTrash, 
  FaUpload, FaRuler, FaPencilAlt, FaUserShield, FaFolder, FaTimes, 
  FaTh, FaGhost, FaCar, FaCrosshairs, FaBoxOpen, FaEllipsisH,
  FaFont, FaEraser, FaUndo, FaRedo, FaLayerGroup, FaUserSecret,
  FaQuestionCircle, FaKeyboard, FaEye, FaEyeSlash, FaDiceD20,
  FaUsers, FaCopy, FaImage, FaCircle, FaSquare, FaHeart, FaRegHeart, FaSlidersH
} from 'react-icons/fa';
import MasterDiceRoller from '../components/MasterDiceRoller';
import EventDeckModal from '../components/EventDeckModal';
import NPCGenerator from '../components/NPCGenerator';

const API_BASE = 'https://assrpgsite-be-production.up.railway.app';
const knowledgeKeys = ['geography', 'medicine', 'security', 'biology', 'erudition', 'engineering'];
const practiceKeys = ['weapons', 'athletics', 'expression', 'stealth', 'crafting', 'survival'];

const translations = {
  geography: 'Geografia', medicine: 'Medicina', security: 'Seguranca', biology: 'Biologia', erudition: 'Erudicao', engineering: 'Engenharia',
  weapons: 'Armas', athletics: 'Atletismo', expression: 'Expressao', stealth: 'Furtividade', crafting: 'Manufaturas', survival: 'Sobrevivencia',
  perception: 'Percepcao', potency: 'Potencia', influence: 'Influencia', resolution: 'Resolucao', sagacity: 'Sagacidade', reaction: 'Reacao'
};

const diceSymbols = {
  d6: { 1: [], 2: [], 3: [coruja], 4: [coruja], 5: [cervo, coruja], 6: [joaninha] },
  d10: { 1: [], 2: [], 3: [coruja], 4: [coruja], 5: [cervo, coruja], 6: [joaninha], 7: [joaninha, joaninha], 8: [cervo, joaninha], 9: [cervo, joaninha, coruja], 10: [joaninha, joaninha, coruja] },
  d12: { 1: [], 2: [], 3: [coruja], 4: [coruja], 5: [cervo, coruja], 6: [joaninha], 7: [joaninha, joaninha], 8: [cervo, joaninha], 9: [cervo, joaninha, coruja], 10: [joaninha, joaninha, coruja], 11: [cervo, cervo, joaninha, coruja], 12: [coruja, coruja] }
};

const rollCustomDice = (formula) => {
  const regex = /(\d+)d(\d+)/g;
  const results = [];
  let match;
  while ((match = regex.exec(formula)) !== null) {
    const count = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    const key = `d${sides}`;
    if (!diceSymbols[key]) continue;
    for (let i = 0; i < count; i += 1) {
      const face = Math.floor(Math.random() * sides) + 1;
      results.push({ face, sides, result: diceSymbols[key][face] || [] });
    }
  }
  return results;
};

const timeFmt = (ts) => new Date(ts || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const t = (key) => translations[key] || key;
const getSkillTypeLabel = (skillKey) => knowledgeKeys.includes(skillKey) ? 'Conhecimento' : practiceKeys.includes(skillKey) ? 'Pratica' : 'Pericia';
const getCharacterSkills = (char) => ({ ...(char?.knowledge || {}), ...(char?.practices || {}) });

const VTT = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const { user, token } = useSelector((state) => state.auth);

  const [campaignData, setCampaignData] = useState(null);
  const [availableChars, setAvailableChars] = useState([]);
  const [isMaster, setIsMaster] = useState(false);

  const [scenes, setScenes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [assetLibrary, setAssetLibrary] = useState([]);
  
  const [partySceneId, setPartySceneId] = useState('default');
  const [viewingSceneId, setViewingSceneId] = useState('default');
  
  const [isSceneManagerOpen, setIsSceneManagerOpen] = useState(false);
  const [managerTab, setManagerTab] = useState('scenes'); 
  const [uploadType, setUploadType] = useState('map'); 

  // ======== NUVEM PESSOAL E CTRL+V (GERENCIADOR DE ASSETS) ========
  const [myAssets, setMyAssets] = useState([]);
  const [isAssetManagerOpen, setIsAssetManagerOpen] = useState(false);
  const [activeQuickCategory, setActiveQuickCategory] = useState(null); 
  const [radialMenuData, setRadialMenuData] = useState(null); 
  const [isRadialUploading, setIsRadialUploading] = useState(false);
  const mousePosRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  const currentScene = useMemo(() => scenes.find(s => s.id === viewingSceneId) || scenes[0] || { tokens: [], mapUrl: '', drawings: [], name: 'Carregando...' }, [scenes, viewingSceneId]);
  const tokens = currentScene.tokens || [];
  const mapUrl = currentScene.mapUrl || '';

  const [contextMenu, setContextMenu] = useState(null);
  const [editingToken, setEditingToken] = useState(null); 

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
  const [cameraResetKey, setCameraResetKey] = useState(0);
  const [activeTool, setActiveTool] = useState('select');
  const [drawColor, setDrawColor] = useState('#410202');
  const [drawWidth, setDrawWidth] = useState(3);
  const [rulerUnit, setRulerUnit] = useState('m');
  const [rulerMultiplier, setRulerMultiplier] = useState(1.5);
  const [rulerMoveBudget, setRulerMoveBudget] = useState(0);
  const [undoSignal, setUndoSignal] = useState(0);
  const [redoSignal, setRedoSignal] = useState(0);

  const [activeEditorLayer, setActiveEditorLayer] = useState('token');
  const activeEditorLayerRef = useRef('token');
  useEffect(() => { activeEditorLayerRef.current = activeEditorLayer; }, [activeEditorLayer]);
  const [isLayersMenuOpen, setIsLayersMenuOpen] = useState(false);
  const [chatIdentity, setChatIdentity] = useState('character');
  const [editingLabel, setEditingLabel] = useState(null); // { id, currentLabel, screenX, screenY }
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [openNpcModal, setOpenNpcModal] = useState(false);
  const [openEventDeckModal, setOpenEventDeckModal] = useState(false);

  const [rightTab, setRightTab] = useState('chat');
  const [selectedSheetCharId, setSelectedSheetCharId] = useState('');
  const [sheetOverlayCharId, setSheetOverlayCharId] = useState('');

  const [rollMode, setRollMode] = useState('skill');
  const [selectedSkillKey, setSelectedSkillKey] = useState('');
  const [selectedInstinctKey, setSelectedInstinctKey] = useState('');
  const [assimilateInstinctA, setAssimilateInstinctA] = useState('');
  const [assimilateInstinctB, setAssimilateInstinctB] = useState('');
  const [isRolling, setIsRolling] = useState(false);
  const [recentRolls, setRecentRolls] = useState([]);
  const [systemMessages, setSystemMessages] = useState([]);

  const [textMessages, setTextMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [activeConflict, setActiveConflict] = useState(null);
  const [openConflictModal, setOpenConflictModal] = useState(false);
  const [isConflictLoading, setIsConflictLoading] = useState(false);

  const gridStorageKey = useMemo(() => `vttGridSettings:${id}`, [id]);

  const myCharacter = useMemo(() => {
    if (!campaignData?.players || !user?._id) return null;
    const mine = campaignData.players.find((entry) => String(entry?.user?._id || entry?.user) === String(user._id));
    return mine?.character || null;
  }, [campaignData, user]);

  const sheetCharacters = useMemo(() => isMaster ? availableChars : (myCharacter?._id ? availableChars.filter((char) => String(char._id) === String(myCharacter._id)) : []), [availableChars, isMaster, myCharacter]);
  const selectedSheetCharacter = useMemo(() => sheetCharacters.find((char) => String(char._id) === String(selectedSheetCharId)) || sheetCharacters[0] || null, [sheetCharacters, selectedSheetCharId]);
  const activeRollCharacter = useMemo(() => isMaster ? selectedSheetCharacter : (myCharacter || selectedSheetCharacter || null), [isMaster, myCharacter, selectedSheetCharacter]);
  
  const activeCharacterSkills = useMemo(() => getCharacterSkills(activeRollCharacter), [activeRollCharacter]);
  const activeCharacterInstincts = useMemo(() => activeRollCharacter?.instincts || {}, [activeRollCharacter]);
  const availableSkillKeys = useMemo(() => Object.keys(activeCharacterSkills), [activeCharacterSkills]);
  const availableInstinctKeys = useMemo(() => Object.keys(activeCharacterInstincts), [activeCharacterInstincts]);

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

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

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
      setRecentRolls(res.data || []);
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
    if (!window.confirm('Encerrar conflito atual?')) return;
    setIsConflictLoading(true);
    try {
      await axios.delete(`${API_BASE}/api/campaigns/${id}/conflict`, { headers: { Authorization: `Bearer ${token}` } });
      setActiveConflict(null);
    } catch (error) {} finally { setIsConflictLoading(false); }
  };

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
        const masterId = res.data.master?._id || res.data.master;
        setIsMaster(Boolean(user && String(masterId) === String(user._id)));

        if (res.data.players) setAvailableChars(res.data.players.filter(p => p.character).map(p => p.character));
        if (res.data.vttState?.scenes?.length) setScenes(res.data.vttState.scenes);
        if (res.data.vttState?.folders?.length) setFolders(res.data.vttState.folders);
        if (res.data.vttState?.assetLibrary?.length) setAssetLibrary(res.data.vttState.assetLibrary);
        
        if (res.data.vttState?.activeSceneId) {
          setPartySceneId(res.data.vttState.activeSceneId);
          setViewingSceneId(res.data.vttState.activeSceneId);
        }
        if (res.data.vttState?.chatMessages?.length) setTextMessages(res.data.vttState.chatMessages);
      } catch (error) { console.error('Erro ao carregar campanha:', error); }
    };

    if (user && token) {
      loadCampaign();
      fetchRecentRolls();
      fetchConflict();
      fetchMyAssets(); 
    }

    const newSocket = io(API_BASE, { auth: { token } });
    setSocket(newSocket);

    newSocket.on('connect', () => newSocket.emit('joinCampaign', id));
    newSocket.on('connect_error', (err) => {
      alert('Acesso negado ao VTT. Faca login novamente.');
      navigate(`/campaign-lobby/${id}`);
    });

    newSocket.on('systemMessage', (payload) => setSystemMessages((prev) => [...prev, { message: payload?.message || 'Evento no VTT', timestamp: Date.now() }]));
    newSocket.on('chatMessage', (payload) => setTextMessages((prev) => [...prev, payload]));

    newSocket.on('activeSceneChanged', (sceneId) => {
      setPartySceneId(sceneId);
      setViewingSceneId(sceneId); 
      setSystemMessages((prev) => [...prev, { message: 'Atenção: A party foi movida para uma nova cena!', timestamp: Date.now() }]);
    });
    newSocket.on('sceneCreated', (newScene) => setScenes((prev) => [...prev, newScene]));
    newSocket.on('sceneUpdated', ({ sceneId, mapUrl }) => setScenes((prev) => prev.map(s => s.id === sceneId ? { ...s, mapUrl } : s)));
    newSocket.on('folderCreated', (newFolder) => setFolders((prev) => [...prev, newFolder]));
    newSocket.on('assetAdded', (newAsset) => setAssetLibrary((prev) => [...prev, newAsset]));

    newSocket.on('tokenMoved', ({ sceneId, tokenId, x, y }) => {
      setScenes(prev => prev.map(s => s.id !== sceneId ? s : { ...s, tokens: s.tokens.map(t => t.id === tokenId ? { ...t, x, y } : t) }));
    });
    newSocket.on('tokenUpdated', ({ sceneId, tokenId, patch }) => {
      setScenes(prev => prev.map(s => s.id !== sceneId ? s : { ...s, tokens: s.tokens.map(t => t.id === tokenId ? { ...t, ...patch } : t) }));
    });
    newSocket.on('visibilityChanged', ({ sceneId, tokenId, isVisible }) => {
      setScenes(prev => prev.map(s => s.id !== sceneId ? s : { ...s, tokens: s.tokens.map(t => t.id === tokenId ? { ...t, isVisible } : t) }));
    });
    newSocket.on('tokenAdded', ({ sceneId, token }) => {
      setScenes(prev => prev.map(s => s.id !== sceneId ? s : { ...s, tokens: [...s.tokens, token] }));
    });
    newSocket.on('tokenRemoved', ({ sceneId, tokenId }) => {
      setScenes(prev => prev.map(s => s.id !== sceneId ? s : { ...s, tokens: s.tokens.filter(t => t.id !== tokenId) }));
      setSelectedTokenId((prev) => (prev === tokenId ? null : prev));
    });
    newSocket.on('drawingAdded', ({ sceneId, drawing }) => {
      setScenes(prev => prev.map(s => s.id !== sceneId ? s : { ...s, drawings: [...(s.drawings || []), drawing] }));
    });
    newSocket.on('drawingRemoved', ({ sceneId, drawingId }) => {
      setScenes(prev => prev.map(s => s.id !== sceneId ? s : { ...s, drawings: (s.drawings || []).filter(d => d.id !== drawingId) }));
    });

    return () => newSocket.disconnect();
  }, [fetchConflict, fetchMyAssets, fetchRecentRolls, gridStorageKey, id, navigate, token, user]);

  useEffect(() => { localStorage.setItem(gridStorageKey, JSON.stringify({ showGrid, showMapLayer, showTokenLayer, showGmLayer, gridSize, gridOpacity, mapScaleMultiplier })); }, [gridOpacity, gridSize, gridStorageKey, mapScaleMultiplier, showGrid, showMapLayer, showTokenLayer, showGmLayer]);
  useEffect(() => { if (!selectedSheetCharId && sheetCharacters[0]?._id) setSelectedSheetCharId(sheetCharacters[0]._id); }, [selectedSheetCharId, sheetCharacters]);
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

  const handleCreateScene = (folderId = null) => {
    const name = window.prompt('Nome da nova cena (ex: Taverna, Floresta):');
    if (!name || name.trim() === '') return;
    const newScene = { id: `scene-${Date.now()}`, name: name.trim(), folderId, mapUrl: 'https://konvajs.org/assets/yoda.jpg', gridConfig: { size: 70, opacity: 0.35, offsetX: 0, offsetY: 0 }, tokens: [], drawings: [] };
    setScenes(prev => [...prev, newScene]);
    setViewingSceneId(newScene.id); 
    if (socket) socket.emit('createScene', { campaignId: id, newScene });
  };

  const handleCreateFolder = () => {
    const name = window.prompt('Nome da nova pasta:');
    if (!name || name.trim() === '') return;
    const newFolder = { id: `folder-${Date.now()}`, name: name.trim(), color: '#2d3b4f', sort: folders.length };
    setFolders(prev => [...prev, newFolder]);
    if (socket) socket.emit('createFolder', { campaignId: id, folder: newFolder });
  };

  const handleChangeViewingScene = (sceneId) => setViewingSceneId(sceneId);

  const handlePullParty = () => {
    setPartySceneId(viewingSceneId);
    if (socket) socket.emit('changeActiveScene', { campaignId: id, sceneId: viewingSceneId });
    setSystemMessages((prev) => [...prev, { message: 'Você invocou a party para esta cena.', timestamp: Date.now() }]);
  };

  const handleSetSceneMap = (url) => {
    setScenes((prev) => prev.map(s => s.id === viewingSceneId ? { ...s, mapUrl: url } : s));
    if (socket) socket.emit('updateScene', { campaignId: id, sceneId: viewingSceneId, mapUrl: url });
    setIsSceneManagerOpen(false);
  };

  const handleDropAssetToken = (name, url, assetType = 'token', x = window.innerWidth / 2, y = window.innerHeight / 2) => {
    const newToken = {
      id: `token-${Date.now()}`, 
      name: name || 'Novo Asset',
      assetType, 
      x, y,
      rotation: 0, scale: 1, avatarUrl: url,
      isVisible: isMaster ? false : true, characterId: null, layer: 'token',
      hp: 10, maxHp: 10, status: '', auraColor: ''
    };
    setScenes(prev => prev.map(s => s.id !== viewingSceneId ? s : { ...s, tokens: [...s.tokens, newToken] }));
    if (socket) socket.emit('addToken', { campaignId: id, sceneId: viewingSceneId, token: newToken });
    setActiveQuickCategory(null);
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
        handleSetSceneMap(newAsset.url);
      } else {
        handleDropAssetToken(newAsset.name, newAsset.url, type, radialMenuData.x, radialMenuData.y);
      }
    } catch (error) {
      alert('Falha ao subir a imagem.');
    } finally {
      setIsRadialUploading(false);
      setRadialMenuData(null);
    }
  };

  const handleDeleteMyAsset = async (assetId) => {
    if (!window.confirm('Excluir este asset?')) return;
    try {
      await axios.delete(`${API_BASE}/api/my-assets/${assetId}`, { headers: { Authorization: `Bearer ${token}` } });
      setMyAssets(prev => prev.filter(a => a._id !== assetId));
    } catch (error) {
      alert('Erro ao excluir asset.');
    }
  };

  const updateTokenProps = useCallback((tokenId, patch) => {
    setScenes(prev => prev.map(s => s.id !== viewingSceneId ? s : { ...s, tokens: s.tokens.map(t => t.id === tokenId ? { ...t, ...patch } : t) }));
    if (socket) socket.emit('updateToken', { campaignId: id, sceneId: viewingSceneId, tokenId, patch });
  }, [id, socket, viewingSceneId]);

  const updateTokenPosition = (tokenId, newX, newY) => {
    setScenes(prev => prev.map(s => s.id !== viewingSceneId ? s : { ...s, tokens: s.tokens.map(t => t.id === tokenId ? { ...t, x: newX, y: newY } : t) }));
    if (socket) socket.emit('moveToken', { campaignId: id, sceneId: viewingSceneId, tokenId, x: newX, y: newY });
  };

  const toggleTokenVisibility = (tokenId) => {
    setScenes(prev => prev.map(s => {
      if (s.id !== viewingSceneId) return s;
      return {
        ...s,
        tokens: s.tokens.map(t => {
          if (t.id !== tokenId) return t;
          const newVis = !t.isVisible;
          if (socket) socket.emit('toggleVisibility', { campaignId: id, sceneId: viewingSceneId, tokenId, isVisible: newVis });
          return { ...t, isVisible: newVis };
        })
      };
    }));
  };

  const spawnToken = useCallback((char) => {
    const newToken = {
      id: `${char._id}-${Date.now()}`, name: char.name, assetType: 'token',
      x: window.innerWidth / 2, y: window.innerHeight / 2,
      rotation: 0, scale: 1, avatarUrl: char.tokenImage || char.avatar || 'https://konvajs.org/assets/lion.png',
      isCircularBase: !char.tokenImage,
      isVisible: isMaster ? false : true, characterId: char._id, layer: 'token',
      hp: 10, maxHp: 10, status: '', auraColor: ''
    };
    setScenes(prev => prev.map(s => s.id !== viewingSceneId ? s : { ...s, tokens: [...s.tokens, newToken] }));
    if (socket) socket.emit('addToken', { campaignId: id, sceneId: viewingSceneId, token: newToken });
  }, [id, socket, viewingSceneId, isMaster]);

  const removeToken = useCallback((tokenId) => {
    if (!isMaster) return;
    setScenes(prev => prev.map(s => s.id !== viewingSceneId ? s : { ...s, tokens: s.tokens.filter(t => t.id !== tokenId) }));
    setSelectedTokenId((prev) => (prev === tokenId ? null : prev));
    if (socket) socket.emit('removeToken', { campaignId: id, sceneId: viewingSceneId, tokenId });
  }, [id, isMaster, socket, viewingSceneId]);

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
         setScenes((prev) => prev.map(s => s.id === viewingSceneId ? { ...s, mapUrl: uploadedUrl } : s));
         if (socket) socket.emit('updateScene', { campaignId: id, sceneId: viewingSceneId, mapUrl: uploadedUrl });
      }
      const newAsset = res.data.assetLibrary?.[res.data.assetLibrary.length - 1];
      if (socket && newAsset) socket.emit('addAsset', { campaignId: id, asset: newAsset });
    } catch (error) { alert('Falha ao subir asset.'); }
  };

  const handleAddDrawing = useCallback((drawing) => {
    setScenes(prev => prev.map(s => s.id !== viewingSceneId ? s : { ...s, drawings: [...(s.drawings || []), drawing] }));
    if (socket) socket.emit('addDrawing', { campaignId: id, sceneId: viewingSceneId, drawing });
  }, [id, socket, viewingSceneId]);

  const handleAddShapeToken = useCallback((shapeData) => {
    if (!isMaster) return;

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
        fontSize: shapeData.fontSize || 16,
        isVisible: true, characterId: null, layer: activeEditorLayerRef.current || 'token',
        hp: 1, maxHp: 1, status: '', auraColor: ''
      };
      setScenes(prev => prev.map(s => s.id !== viewingSceneId ? s : { ...s, tokens: [...s.tokens, newToken] }));
      if (socket) socket.emit('addToken', { campaignId: id, sceneId: viewingSceneId, token: newToken });
      return;
    }

    // --- DESENHO (Lápis) ---
    if (shapeData.type === 'drawing') {
      const pts = shapeData.points || [];
      if (pts.length < 4) return;
      // Calcular bounding box e normalizar pontos em relação ao centro
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
        id: `drawing-${Date.now()}`,
        name: 'Traço',
        assetType: 'drawing',
        points: normalizedPts,
        x: cx, y: cy,
        rotation: 0, scale: 1,
        color: shapeData.color || '#ffb347',
        strokeWidth: shapeData.width || 3,
        isVisible: true, characterId: null, layer: activeEditorLayerRef.current || 'token',
        hp: 1, maxHp: 1, status: '', auraColor: ''
      };
      setScenes(prev => prev.map(s => s.id !== viewingSceneId ? s : { ...s, tokens: [...s.tokens, newToken] }));
      if (socket) socket.emit('addToken', { campaignId: id, sceneId: viewingSceneId, token: newToken });
      return;
    }

    let radius = 50, width = 100, height = 100;
    
    // Normalização das dimensões e origem
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
      // Garante que o X,Y seja sempre o topo-esquerdo
      startX = Math.min(shapeData.points[0], shapeData.points[2]);
      startY = Math.min(shapeData.points[1], shapeData.points[3]);
    }
    
    const newToken = {
      id: `shape-${Date.now()}`, 
      name: shapeData.type === 'rect' ? 'Área Retangular' : 'Área Circular',
      assetType: 'shape',
      shapeType: shapeData.type,
      x: startX, 
      y: startY,
      rotation: 0, scale: 1, 
      color: shapeData.color || '#ff0000',
      strokeWidth: shapeData.width || 3,
      width, height, radius,
      isVisible: true, characterId: null, layer: 'token',
      hp: 1, maxHp: 1, status: '', auraColor: ''
    };
    setScenes(prev => prev.map(s => s.id !== viewingSceneId ? s : { ...s, tokens: [...s.tokens, newToken] }));
    if (socket) socket.emit('addToken', { campaignId: id, sceneId: viewingSceneId, token: newToken });
  }, [id, socket, viewingSceneId, isMaster]);

  const handleRemoveDrawing = useCallback((drawingId) => {
    setScenes(prev => prev.map(s => s.id !== viewingSceneId ? s : { ...s, drawings: (s.drawings || []).filter(d => d.id !== drawingId) }));
    if (socket) socket.emit('removeDrawing', { campaignId: id, sceneId: viewingSceneId, drawingId });
  }, [id, socket, viewingSceneId]);

  const handleTokenContextMenu = useCallback((evt, tokenData) => {
    if (!isMaster) return; 
    const tokenId = typeof tokenData === 'string' ? tokenData : tokenData.id;
    const token = scenes.find(s => s.id === viewingSceneId)?.tokens.find(t => t.id === tokenId);
    if (!token) return;
    setContextMenu({ x: evt.evt.clientX, y: evt.evt.clientY, tokenId: token.id, tokenName: token.name, isVisible: token.isVisible, layer: token.layer || 'token', hp: token.hp || '', maxHp: token.maxHp || '', status: token.status || '', auraColor: token.auraColor || '' });
  }, [isMaster, scenes, viewingSceneId]);

  const submitRoll = useCallback(async () => {
    if (!activeRollCharacter?._id) { alert('Abra ou selecione uma ficha para rolar.'); return; }
    let formula = ''; let roll = []; let skillLabel = '';
    if (rollMode === 'skill') {
      if (!selectedSkillKey || !selectedInstinctKey) { alert('Selecione pericia e instinto.'); return; }
      const skillValue = Number(activeCharacterSkills[selectedSkillKey] || 0);
      const instinctValue = Number(activeCharacterInstincts[selectedInstinctKey] || 0);
      const parts = [];
      if (skillValue > 0) parts.push(`${skillValue}d10`);
      if (instinctValue > 0) parts.push(`${instinctValue}d6`);
      formula = parts.join('+');
      if (!formula) { alert('Valores zerados para esta combinacao.'); return; }
      roll = rollCustomDice(formula);
      skillLabel = `${t(selectedSkillKey)} (${getSkillTypeLabel(selectedSkillKey)}) + ${t(selectedInstinctKey)}`;
    } else {
      if (!assimilateInstinctA || !assimilateInstinctB) { alert('Selecione os dois instintos para assimilação.'); return; }
      const total = Number(activeCharacterInstincts[assimilateInstinctA] || 0) + Number(activeCharacterInstincts[assimilateInstinctB] || 0);
      if (!total) { alert('Valores zerados para assimilação.'); return; }
      formula = `${total}d12`;
      roll = rollCustomDice(formula);
      skillLabel = `Assimilação: ${t(assimilateInstinctA)} + ${t(assimilateInstinctB)}`;
    }
    if (!roll.length) { alert('Rolagem invalida.'); return; }
    setIsRolling(true);
    try {
      await axios.post(`${API_BASE}/api/campaigns/${id}/roll`, { rollerId: user?._id, rollerName: (chatIdentity === 'gm' && isMaster) ? `[GM] ${user?.name || 'Mestre'}` : activeRollCharacter.name, characterId: chatIdentity === 'gm' ? null : activeRollCharacter._id, formula, skill: skillLabel, roll, timestamp: new Date() }, { headers: { Authorization: `Bearer ${token}` } });
      await fetchRecentRolls();
    } catch (error) { alert('Nao foi possivel registrar rolagem.'); } finally { setIsRolling(false); }
  }, [activeCharacterInstincts, activeCharacterSkills, activeRollCharacter, assimilateInstinctA, assimilateInstinctB, fetchRecentRolls, id, rollMode, selectedInstinctKey, selectedSkillKey, token, user]);

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
        if (selectedTokenIds.length > 0) {
          e.preventDefault(); 
          selectedTokenIds.forEach(tId => removeToken(tId));
          setSelectedTokenIds([]);
          setSelectedTokenId(null);
          return;
        } else if (selectedTokenId) {
          e.preventDefault();
          removeToken(selectedTokenId);
          setSelectedTokenId(null);
          return;
        }
      }
      if (key === '0') { e.preventDefault(); setCameraResetKey(p => p + 1); return; }
      if (key === 'escape') { setSelectedTokenId(null); setSelectedTokenIds([]); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMaster, removeToken, selectedTokenId, selectedTokenIds]);

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
        <button title="Misc" onClick={() => setActiveQuickCategory(activeQuickCategory === 'misc' ? null : 'misc')} className={`${styles.categoryBtn} ${activeQuickCategory === 'misc' ? styles.categoryBtnActive : ''}`}><FaEllipsisH size={20}/></button>
        <div className={styles.verticalDivider} />
        <button title="Gerenciador de Assets" onClick={() => setIsAssetManagerOpen(true)} className={styles.categoryBtn}><FaTh size={22}/></button>
      </div>

      {/* PRATELEIRA DA CATEGORIA ATIVA */}
      {activeQuickCategory && (
        <div className={styles.assetShelf}>
          {myAssets.filter(a => a.type === activeQuickCategory).length === 0 ? (
            <div style={{ color: '#8fa8bf', padding: '10px' }}>Nenhum asset nesta categoria.</div>
          ) : (
            myAssets.filter(a => a.type === activeQuickCategory).map(asset => (
              <div 
                key={asset._id} 
                className={styles.shelfItem} 
                onClick={() => {
                  if (asset.type === 'map' && isMaster) {
                    if(window.confirm('Quer definir este mapa como o Fundo da Cena?\n(Clique em Cancelar para jogar como Token na mesa)')) {
                      handleSetSceneMap(asset.url);
                    } else {
                      handleDropAssetToken(asset.name, asset.url, asset.type);
                    }
                  } else {
                    handleDropAssetToken(asset.name, asset.url, asset.type);
                  }
                }}
              >
                <img src={asset.url} alt={asset.name} />
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL GERENCIADOR DE ASSETS */}
      {isAssetManagerOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.sceneManagerBox} style={{ width: 900 }}>
            <div className={styles.rightTabsHeader} style={{ padding: '10px 20px', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#fff', margin: 0, fontFamily: 'Orbitron' }}>Gerenciador de Assets</h3>
              <button onClick={() => setIsAssetManagerOpen(false)} style={{ background: 'transparent', border: 'none', color: '#ff6969', cursor: 'pointer' }}><FaTimes size={20}/></button>
            </div>
            <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <select id="assetTypeUpload" className={styles.inputField} style={{ width: 150 }}>
                  <option value="token">Personagem</option><option value="map">Mapa</option><option value="vehicle">Veículo</option>
                  <option value="weapon">Arma</option><option value="prop">Prop</option><option value="misc">Outros</option>
                </select>
                <label className={styles.primaryBtn} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <FaUpload /> Adicionar Asset +
                  <input type="file" hidden onChange={async (e) => {
                    const file = e.target.files[0];
                    const type = document.getElementById('assetTypeUpload').value;
                    const formData = new FormData(); formData.append('assetImage', file); formData.append('type', type);
                    await axios.post(`${API_BASE}/api/my-assets`, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
                    fetchMyAssets();
                  }} />
                </label>
              </div>
              <div className={styles.assetGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
                {myAssets.map(asset => (
                  <div key={asset._id} className={styles.assetCard} style={{ background: '#171d24', padding: 8, borderRadius: 8, textAlign: 'center' }}>
                    <img src={asset.url} alt={asset.name} style={{ width: '100%', height: 80, objectFit: 'cover' }} />
                    <div style={{ fontSize: 10, color: '#67d7ff', margin: '4px 0' }}>{asset.type.toUpperCase()}</div>
                    <button onClick={async () => { if(window.confirm('Excluir asset?')){ await axios.delete(`${API_BASE}/api/my-assets/${asset._id}`, { headers: { Authorization: `Bearer ${token}` } }); fetchMyAssets(); }}} className={styles.dangerBtn} style={{ padding: '2px 6px', fontSize: 10 }}><FaTrash/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BARRA SUPERIOR E GESTOR DE CENAS */}
      <div className={styles.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ color: '#fafafa', fontFamily: 'Orbitron', fontSize: 13 }}>{campaignData?.name} - {isMaster ? 'Mestre' : 'Jogador'}</div>
          {isMaster && viewingSceneId !== partySceneId && (
            <button onClick={handlePullParty} style={{ background: '#e67e22', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}>Puxar Party</button>
          )}
          <button onClick={() => setIsSceneManagerOpen(true)} className={styles.primaryBtn}><FaMapMarkedAlt /> Cenas</button>
        </div>
        <button onClick={() => navigate(`/campaign-lobby/${id}`)} className={styles.dangerBtn}>Sair</button>
      </div>

      {isSceneManagerOpen && isMaster && (
        <div className={styles.modalOverlay}>
          <div className={styles.sceneManagerBox}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', gap: 16 }}>
                <button onClick={() => setManagerTab('scenes')} style={{ background: 'none', border: 'none', color: managerTab === 'scenes' ? '#67d7ff' : '#8fa8bf', fontSize: 16, fontFamily: 'Orbitron', cursor: 'pointer', fontWeight: managerTab === 'scenes' ? 'bold' : 'normal' }}>Cenas e Pastas</button>
                <button onClick={() => setManagerTab('assets')} style={{ background: 'none', border: 'none', color: managerTab === 'assets' ? '#67d7ff' : '#8fa8bf', fontSize: 16, fontFamily: 'Orbitron', cursor: 'pointer', fontWeight: managerTab === 'assets' ? 'bold' : 'normal' }}>Biblioteca Oficial</button>
              </div>
              <button onClick={() => setIsSceneManagerOpen(false)} style={{ background: 'transparent', border: 'none', color: '#ff6969', cursor: 'pointer' }}><FaTimes size={18}/></button>
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {managerTab === 'scenes' && (
                <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h3 style={{ color: '#e8edf2', margin: 0 }}>Gerir Cenas</h3>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={handleCreateFolder} className={styles.primaryBtn} style={{ background: '#2d3b4f', display: 'flex', alignItems: 'center', gap: 6 }}><FaFolder /> Nova Pasta</button>
                      <button onClick={() => handleCreateScene(null)} className={styles.primaryBtn} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FaPlus /> Nova Cena</button>
                    </div>
                  </div>

                  {folders.map(folder => (
                    <div key={folder.id} style={{ background: '#171d24', border: '1px solid #2d3b4f', borderRadius: 8, marginBottom: 12, overflow: 'hidden' }}>
                      <div style={{ padding: '10px 14px', background: 'rgba(45, 59, 79, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2d3b4f' }}>
                        <div style={{ color: '#67d7ff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}><FaFolder color={folder.color}/> {folder.name}</div>
                        <button onClick={() => handleCreateScene(folder.id)} style={{ background: 'transparent', border: '1px solid #67d7ff', color: '#67d7ff', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>+ Cena Aqui</button>
                      </div>
                      <div style={{ padding: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                        {scenes.filter(s => s.folderId === folder.id).length === 0 && <span style={{ color: '#5b6b7a', fontSize: 12, paddingLeft: 10 }}>Pasta vazia.</span>}
                        {scenes.filter(s => s.folderId === folder.id).map(scene => (
                          <div key={scene.id} onClick={() => { handleChangeViewingScene(scene.id); setIsSceneManagerOpen(false); }} style={{ display: 'flex', flexDirection: 'column', background: viewingSceneId === scene.id ? '#1e2f3d' : '#101419', borderRadius: 8, cursor: 'pointer', border: viewingSceneId === scene.id ? '1px solid #67d7ff' : '1px solid #1e2630', overflow: 'hidden', position: 'relative' }}>
                            <div style={{ width: '100%', height: 100, background: '#0a0d12', position: 'relative' }}>
                               {scene.mapUrl ? <img src={scene.mapUrl} alt="Mapa" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#2d3b4f' }}><FaImage size={24}/></div>}
                               {partySceneId === scene.id && <div style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(255, 179, 71, 0.9)', color: '#000', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4 }}><FaUsers /> Party</div>}
                               {viewingSceneId === scene.id && <div style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(50, 205, 50, 0.9)', color: '#000', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4 }}><FaEye /> Vendo</div>}
                            </div>
                            <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: viewingSceneId === scene.id ? '#fff' : '#8fa8bf', fontWeight: 'bold', fontSize: 13 }}>{scene.name.length > 18 ? scene.name.slice(0, 15) + '...' : scene.name}</span>
                                <span style={{ color: '#5b6b7a', fontSize: 10 }}>{(scene.tokens || []).length} tokens</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div style={{ marginTop: 20 }}>
                    <div style={{ color: '#8fa8bf', fontSize: 12, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase' }}>Cenas Soltas</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                      {scenes.filter(s => s.folderId === null).map(scene => (
                          <div key={scene.id} onClick={() => { handleChangeViewingScene(scene.id); setIsSceneManagerOpen(false); }} style={{ display: 'flex', flexDirection: 'column', background: viewingSceneId === scene.id ? '#1e2f3d' : '#171d24', borderRadius: 8, cursor: 'pointer', border: viewingSceneId === scene.id ? '1px solid #67d7ff' : '1px solid #2d3b4f', overflow: 'hidden', position: 'relative' }}>
                            <div style={{ width: '100%', height: 100, background: '#0a0d12', position: 'relative' }}>
                               {scene.mapUrl ? <img src={scene.mapUrl} alt="Mapa" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#2d3b4f' }}><FaImage size={24}/></div>}
                               {partySceneId === scene.id && <div style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(255, 179, 71, 0.9)', color: '#000', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4 }}><FaUsers /> Party</div>}
                               {viewingSceneId === scene.id && <div style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(50, 205, 50, 0.9)', color: '#000', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4 }}><FaEye /> Vendo</div>}
                            </div>
                            <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: viewingSceneId === scene.id ? '#fff' : '#d8ecff', fontWeight: 'bold', fontSize: 13 }}>{scene.name.length > 18 ? scene.name.slice(0, 15) + '...' : scene.name}</span>
                                <span style={{ color: '#5b6b7a', fontSize: 10 }}>{(scene.tokens || []).length} tokens</span>
                            </div>
                          </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {managerTab === 'assets' && (
                <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h3 style={{ color: '#e8edf2', margin: 0 }}>Biblioteca da Campanha</h3>
                    
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select value={uploadType} onChange={(e) => setUploadType(e.target.value)} className={styles.inputField}>
                          <option value="map">🗺️ Mapa</option>
                          <option value="token">🧍 Token</option>
                          <option value="prop">📦 Item/Prop</option>
                      </select>
                      <label className={styles.primaryBtn} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FaUpload /> Fazer Upload
                        <input type="file" accept="image/*" onChange={handleMapUpload} style={{ display: 'none' }} />
                      </label>
                    </div>
                  </div>
                  
                  {assetLibrary.length === 0 ? (
                    <div style={{ color: '#5b6b7a', textAlign: 'center', marginTop: 40 }}>Nenhum asset carregado.</div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
                      {assetLibrary.map(asset => (
                        <div key={asset.id} style={{ background: '#171d24', border: '1px solid #2d3b4f', borderRadius: 8, padding: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <img src={asset.url} alt={asset.name} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4 }} />
                          <span style={{ color: '#8fa8bf', fontSize: 11, textAlign: 'center', wordBreak: 'break-all' }}>{asset.name.slice(0,15)} ({asset.type})</span>
                          
                          {asset.type === 'map' && (
                              <button onClick={() => handleSetSceneMap(asset.url)} style={{ background: '#2d3b4f', border: 'none', color: '#fff', fontSize: 10, padding: '6px', borderRadius: 4, width: '100%', cursor: 'pointer' }}>Mudar Fundo</button>
                          )}
                          
                          {(asset.type === 'token' || asset.type === 'prop') && (
                              <button onClick={() => handleDropAssetToken(asset.name, asset.url, asset.type)} style={{ background: '#3d6b8c', border: 'none', color: '#fff', fontSize: 10, padding: '6px', borderRadius: 4, width: '100%', cursor: 'pointer' }}>Colocar na Mesa</button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDITOR DE TOKEN */}
      {editingToken && (
        <div className={styles.modalOverlay}>
          <div className={styles.tokenEditBox}>
            <h3 style={{ marginTop: 0, color: '#67d7ff', fontFamily: 'Orbitron', fontSize: 14 }}>Editar Token</h3>
            <div style={{ marginBottom: 14, color: '#8fa8bf', fontSize: 12 }}>{editingToken.name}</div>
            
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8fa8bf', marginBottom: 4 }}>Status (ex: Envenenado, Sangrando)</label>
              <input type="text" value={editingToken.status} onChange={(e) => setEditingToken({...editingToken, status: e.target.value})} className={styles.inputField} style={{ width: '100%', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#8fa8bf', marginBottom: 4 }}>HP Atual</label>
                <input type="number" value={editingToken.hp} onChange={(e) => setEditingToken({...editingToken, hp: Number(e.target.value)})} className={styles.inputField} style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#8fa8bf', marginBottom: 4 }}>HP Máximo</label>
                <input type="number" value={editingToken.maxHp} onChange={(e) => setEditingToken({...editingToken, maxHp: Number(e.target.value)})} className={styles.inputField} style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#8fa8bf', marginBottom: 4 }}>Cor da Aura Mágica</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={editingToken.auraColor || '#000000'} onChange={(e) => setEditingToken({...editingToken, auraColor: e.target.value})} style={{ width: 36, height: 36, padding: 0, border: '1px solid #2d3b4f', background: 'transparent', cursor: 'pointer', borderRadius: 4 }} />
                <input type="text" value={editingToken.auraColor} placeholder="#ff0000" onChange={(e) => setEditingToken({...editingToken, auraColor: e.target.value})} className={styles.inputField} style={{ flex: 1 }} />
                <button onClick={() => setEditingToken({...editingToken, auraColor: ''})} style={{ background: '#2a1515', border: '1px solid #4d2626', color: '#ff8080', padding: '8px', borderRadius: 4, cursor: 'pointer' }}>Limpar</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingToken(null)} style={{ background: 'transparent', border: '1px solid #353f4d', color: '#8fa8bf', padding: '8px 14px', borderRadius: 6, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => { updateTokenProps(editingToken.id, { hp: editingToken.hp, maxHp: editingToken.maxHp, status: editingToken.status, auraColor: editingToken.auraColor }); setEditingToken(null); }} className={styles.primaryBtn} style={{ fontWeight: 'bold' }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* INPUT DE LABEL ABAIXO DO TOKEN (duplo clique) */}
      {editingLabel && (
        <div style={{
          position: 'fixed',
          left: editingLabel.screenX,
          top: editingLabel.screenY,
          zIndex: 999999,
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          pointerEvents: 'all',
        }}>
          <input
            autoFocus
            type="text"
            defaultValue={editingLabel.currentLabel}
            placeholder="Escreva algo..."
            style={{
              background: 'rgba(8,12,20,0.95)',
              border: '1.5px solid #3d6b8c',
              borderRadius: 6,
              color: '#bae6ff',
              fontSize: 12,
              padding: '5px 10px',
              outline: 'none',
              minWidth: 130,
              maxWidth: 240,
              textAlign: 'center',
              fontFamily: 'system-ui, sans-serif',
              boxShadow: '0 4px 16px rgba(0,0,0,0.7)',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { setEditingLabel(null); return; }
              if (e.key === 'Enter') {
                updateTokenProps(editingLabel.id, { label: e.target.value.trim() });
                setEditingLabel(null);
              }
            }}
            onBlur={(e) => {
              updateTokenProps(editingLabel.id, { label: e.target.value.trim() });
              setEditingLabel(null);
            }}
          />
          <div style={{ fontSize: 10, color: '#3d6b8c' }}>Enter · Esc</div>
        </div>
      )}

      {/* MENU DE CONTEXTO (redesenho premium) */}
      {contextMenu && (
        <div
          className={styles.contextMenu}
          style={{ top: contextMenu.y, left: contextMenu.x, padding: 0, overflow: 'hidden' }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          {/* Header com nome do token */}
          <div style={{ padding: '10px 14px', background: 'linear-gradient(135deg, #0e1a26, #1a2c3d)', borderBottom: '1px solid #1e3048', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaBullseye size={12} style={{ color: '#67d7ff', flexShrink: 0 }} />
            <span style={{ color: '#d8ecff', fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contextMenu.tokenName}</span>
          </div>

          {/* Ação: Editar */}
          <div style={{ padding: '6px 8px' }}>
            <button
              onClick={() => { setEditingToken({ id: contextMenu.tokenId, name: contextMenu.tokenName, hp: contextMenu.hp || '', maxHp: contextMenu.maxHp || '', status: contextMenu.status || '', auraColor: contextMenu.auraColor || '' }); setContextMenu(null); }}
              className={styles.contextMenuItem}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', color: '#bae6ff' }}
            >
              <FaPencilAlt size={11} style={{ color: '#67d7ff' }} /> Editar token
            </button>
            <button
              onClick={() => { setEditingLabel({ id: contextMenu.tokenId, currentLabel: '', screenX: contextMenu.x, screenY: contextMenu.y }); setContextMenu(null); }}
              className={styles.contextMenuItem}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', color: '#bae6ff' }}
            >
              <FaFont size={11} style={{ color: '#a78bfa' }} /> Renomear
            </button>
          </div>

          <div className={styles.divider} style={{ margin: '0 8px' }} />

          {/* Visibilidade */}
          <div style={{ padding: '6px 8px' }}>
            <button
              onClick={() => { toggleTokenVisibility(contextMenu.tokenId); setContextMenu(null); }}
              className={styles.contextMenuItem}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', color: contextMenu.isVisible ? '#ffd080' : '#80ff9a' }}
            >
              {contextMenu.isVisible
                ? <><FaEyeSlash size={11} style={{ color: '#ffd080' }} /> Ocultar dos jogadores</>
                : <><FaEye size={11} style={{ color: '#80ff9a' }} /> Revelar aos jogadores</>
              }
            </button>
          </div>

          <div className={styles.divider} style={{ margin: '0 8px' }} />

          {/* Mover de camada */}
          <div style={{ padding: '4px 8px 2px', fontSize: 10, color: '#4a6278', fontWeight: 'bold', letterSpacing: 0.8 }}>MOVER PARA CAMADA</div>
          <div style={{ padding: '2px 8px 6px' }}>
            <button onClick={() => { updateTokenProps(contextMenu.tokenId, { layer: 'token' }); setContextMenu(null); }} className={styles.contextMenuItem} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', color: contextMenu.layer === 'token' ? '#ffb347' : '#8fa8bf' }}>
              <FaUsers size={11} style={{ color: '#ffb347' }} /> Tokens (padrão)
            </button>
            <button onClick={() => { updateTokenProps(contextMenu.tokenId, { layer: 'gm' }); setContextMenu(null); }} className={styles.contextMenuItem} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', color: contextMenu.layer === 'gm' ? '#ff6969' : '#8fa8bf' }}>
              <FaGhost size={11} style={{ color: '#ff6969' }} /> Camada do Mestre
            </button>
            <button onClick={() => { updateTokenProps(contextMenu.tokenId, { layer: 'map' }); setContextMenu(null); }} className={styles.contextMenuItem} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', color: contextMenu.layer === 'map' ? '#67d7ff' : '#8fa8bf' }}>
              <FaMapMarkedAlt size={11} style={{ color: '#67d7ff' }} /> Trancado no Fundo
            </button>
          </div>

          <div className={styles.divider} style={{ margin: '0 8px' }} />

          {/* Copiar / Apagar */}
          <div style={{ padding: '6px 8px' }}>
            <button onClick={() => { removeToken(contextMenu.tokenId); setContextMenu(null); }} className={styles.contextMenuItem} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', color: '#ff6969' }}>
              <FaTrash size={11} style={{ color: '#ff6969' }} /> Excluir token
            </button>
          </div>
        </div>
      )}

      {/* BARRA LATERAL (FERRAMENTAS) */}
      <div className={styles.leftSidebar}>
        <button onClick={() => setActiveTool('select')} title="Selecionar (V)" className={`${styles.toolBtn} ${activeTool === 'select' ? styles.toolBtnActive : ''}`}><FaBullseye size={16}/></button>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setActiveTool('ruler')} title="Régua (R)" className={`${styles.toolBtn} ${activeTool === 'ruler' ? styles.toolBtnActive : ''}`}><FaRuler size={15}/></button>
          
          {activeTool === 'ruler' && isMaster && (
            <div style={{ position: 'absolute', left: '100%', top: 0, marginLeft: 8, background: '#1c2430', border: '1px solid #364455', borderRadius: 8, padding: 8, display: 'flex', gap: 6, zIndex: 10, alignItems: 'center' }}>
                <span style={{ color: '#8fa8bf', fontSize: 11, whiteSpace: 'nowrap', fontWeight: 'bold' }}>1 SQ =</span>
                <input type="number" step="0.5" value={rulerMultiplier} onChange={(e) => setRulerMultiplier(Number(e.target.value))} style={{ width: 50, background: '#0a0d12', border: '1px solid #364455', color: '#fff', padding: '4px', borderRadius: 4, outline: 'none', fontSize: 12 }} />
                <select value={rulerUnit} onChange={(e) => setRulerUnit(e.target.value)} style={{ background: '#0a0d12', border: '1px solid #364455', color: '#fff', padding: '4px', borderRadius: 4, outline: 'none', fontSize: 12 }}>
                   <option value="m">Metros</option>
                   <option value="ft">Pés</option>
                   <option value="px">Quadrados</option>
                </select>
            </div>
          )}
        </div>
        
        <div className={styles.divider} />
        
        
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setActiveTool(['draw', 'rect', 'circle'].includes(activeTool) ? activeTool : 'draw')} 
            title="Lápis (D)" 
            className={`${styles.toolBtn} ${['draw','rect','circle'].includes(activeTool) ? styles.toolBtnActive : ''}`}
          >
            {activeTool === 'rect' ? <FaSquare size={14}/> : activeTool === 'circle' ? <FaCircle size={14}/> : <FaPencilAlt size={14}/>}
          </button>
          
          {['draw','rect','circle'].includes(activeTool) && (
            <div style={{ position: 'absolute', left: '100%', top: 0, marginLeft: 8, background: '#1c2430', border: '1px solid #364455', borderRadius: 8, padding: 8, display: 'flex', gap: 6, zIndex: 10, alignItems: 'center' }}>
                <button onClick={() => setActiveTool('draw')} className={`${styles.toolBtn} ${activeTool === 'draw' ? styles.toolBtnActive : ''}`} style={{ margin: 0, width: 32, height: 32 }}><FaPencilAlt size={14}/></button>
                <button onClick={() => setActiveTool('rect')} className={`${styles.toolBtn} ${activeTool === 'rect' ? styles.toolBtnActive : ''}`} style={{ margin: 0, width: 32, height: 32 }}><FaSquare size={14}/></button>
                <button onClick={() => setActiveTool('circle')} className={`${styles.toolBtn} ${activeTool === 'circle' ? styles.toolBtnActive : ''}`} style={{ margin: 0, width: 32, height: 32 }}><FaCircle size={14}/></button>
                
                <div style={{ width: 1, height: 24, background: '#364455', margin: '0 4px' }}/>
                
                <input type="color" title="Cor" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} style={{ width: 24, height: 24, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }} />
                <input type="range" title="Espessura" min="1" max="25" value={drawWidth} onChange={(e) => setDrawWidth(e.target.value)} style={{ width: 80, marginLeft: 5, accentColor: '#67d7ff' }} />
            </div>
          )}
        </div>
        
        <button onClick={() => setActiveTool('text')} title="Texto (T)" className={`${styles.toolBtn} ${activeTool === 'text' ? styles.toolBtnActive : ''}`}><FaFont size={14}/></button>
        <button onClick={() => setActiveTool('erase')} title="Borracha (E)" className={`${styles.toolBtn} ${activeTool === 'erase' ? styles.toolBtnActive : ''}`}><FaEraser size={14}/></button>

        <div className={styles.divider} />
        
        {isMaster && (
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsLayersMenuOpen(!isLayersMenuOpen)} 
              title="Gerenciar Camadas" 
              className={`${styles.toolBtn} ${isLayersMenuOpen || activeEditorLayer !== 'token' ? styles.toolBtnActive : ''}`}
            >
              <FaLayerGroup size={15}/>
            </button>
            
            {isLayersMenuOpen && (
              <div style={{ position: 'absolute', left: '100%', top: 0, marginLeft: 8, background: '#1c2430', border: '1px solid #364455', borderRadius: 8, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 6, zIndex: 10, minWidth: 120 }}>
                <div style={{ color: '#8fa8bf', fontSize: 10, fontWeight: 'bold', marginBottom: 4, textAlign: 'center', borderBottom: '1px solid #2d3b4f', paddingBottom: 6 }}>EDITAR CAMADAS</div>
                <button onClick={() => { setActiveEditorLayer('map'); setIsLayersMenuOpen(false); }} className={`${styles.toolBtn} ${activeEditorLayer === 'map' ? styles.toolBtnActive : ''}`} style={{ margin: 0, width: '100%', justifyContent: 'flex-start', padding: '6px 12px', color: activeEditorLayer === 'map' ? '#67d7ff' : '#8fa8bf' }}><FaMapMarkedAlt size={14}/> <span style={{fontSize:11, marginLeft:8}}>Mapa</span></button>
                <button onClick={() => { setActiveEditorLayer('token'); setIsLayersMenuOpen(false); }} className={`${styles.toolBtn} ${activeEditorLayer === 'token' ? styles.toolBtnActive : ''}`} style={{ margin: 0, width: '100%', justifyContent: 'flex-start', padding: '6px 12px', color: activeEditorLayer === 'token' ? '#ffb347' : '#8fa8bf' }}><FaUsers size={14}/> <span style={{fontSize:11, marginLeft:8}}>Tokens</span></button>
                <button onClick={() => { setActiveEditorLayer('gm'); setIsLayersMenuOpen(false); }} className={`${styles.toolBtn} ${activeEditorLayer === 'gm' ? styles.toolBtnActive : ''}`} style={{ margin: 0, width: '100%', justifyContent: 'flex-start', padding: '6px 12px', color: activeEditorLayer === 'gm' ? '#ff6969' : '#8fa8bf' }}><FaUserSecret size={14}/> <span style={{fontSize:11, marginLeft:8}}>Mestre</span></button>
              </div>
            )}
          </div>
        )}
        
        
        <div className={styles.divider} />

        <button onClick={() => setActiveTool('pan')} title="Mover Câmera (H)" className={`${styles.toolBtn} ${activeTool === 'pan' ? styles.toolBtnActive : ''}`}><FaHandPaper size={16}/></button>
        <button onClick={() => setUndoSignal(v => v + 1)} title="Desfazer (Ctrl+Z)" className={styles.toolBtn}><FaUndo size={14}/></button>
        <button onClick={() => setRedoSignal(v => v + 1)} title="Refazer (Ctrl+Y)" className={styles.toolBtn}><FaRedo size={14}/></button>
        
        <div className={styles.divider} />
        
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowGrid(!showGrid)} title="Alternar Grade (G)" className={`${styles.toolBtn} ${showGrid ? styles.toolBtnActive : ''}`}><FaThLarge size={15}/></button>
        </div>
        {isMaster && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsGridMenuOpen(v => !v)}
              title="Configurar Grade"
              className={`${styles.toolBtn} ${isGridMenuOpen ? styles.toolBtnActive : ''}`}
            >
              <FaSlidersH size={14}/>
            </button>
            {isGridMenuOpen && (
              <div style={{ position: 'absolute', left: '100%', top: 0, marginLeft: 8, background: '#1c2430', border: '1px solid #364455', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10, zIndex: 10, minWidth: 180 }}>
                <div style={{ color: '#8fa8bf', fontSize: 10, fontWeight: 'bold', borderBottom: '1px solid #2d3b4f', paddingBottom: 6, textAlign: 'center' }}>CONFIGURAR GRADE</div>
                <label style={{ color: '#8fa8bf', fontSize: 11, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  Tamanho da Célula: <strong style={{ color: '#bae6ff' }}>{gridSize}px</strong>
                  <input type="range" min="30" max="150" step="5" value={gridSize} onChange={e => setGridSize(Number(e.target.value))} style={{ accentColor: '#67d7ff', width: '100%' }} />
                </label>
                <label style={{ color: '#8fa8bf', fontSize: 11, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  Opacidade: <strong style={{ color: '#bae6ff' }}>{Math.round(gridOpacity * 100)}%</strong>
                  <input type="range" min="0.05" max="1" step="0.05" value={gridOpacity} onChange={e => setGridOpacity(Number(e.target.value))} style={{ accentColor: '#67d7ff', width: '100%' }} />
                </label>
                <label style={{ color: '#8fa8bf', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  Cor da Grade:
                  <input type="color" value={gridColor} onChange={e => setGridColor(e.target.value)} style={{ width: 32, height: 24, border: 'none', background: 'transparent', cursor: 'pointer' }} />
                </label>
              </div>
            )}
          </div>
        )}
        {isMaster && <button onClick={() => setShowGmLayer(!showGmLayer)} title="Ver Camada do Mestre" className={`${styles.toolBtn} ${showGmLayer ? styles.toolBtnActive : ''}`}><FaUserShield size={15}/></button>}
        <div className={styles.divider} />
        <button onClick={() => setIsHelpOpen(true)} title="Atalhos do VTT (?)" className={styles.toolBtn}><FaQuestionCircle size={15}/></button>
      </div>



      {/* PAINEL DIREITO (CHAT, FICHAS E ESCUDO) */}
      <div className={styles.rightPanel}>
        <div className={styles.rightTabsHeader}>
          <button onClick={() => setRightTab('chat')} className={`${styles.rightTabBtn} ${rightTab === 'chat' ? styles.rightTabBtnActive : ''}`}>CHAT</button>
          <button onClick={() => setRightTab('sheet')} className={`${styles.rightTabBtn} ${rightTab === 'sheet' ? styles.rightTabBtnActive : ''}`}>FICHAS</button>
          {isMaster && <button onClick={() => setRightTab('shield')} className={`${styles.rightTabBtn} ${rightTab === 'shield' ? styles.rightTabBtnActive : ''}`}>ESCUDO</button>}
        </div>

        {rightTab === 'chat' && (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {chatEntries.length === 0 && <div style={{ color: '#7b8697', fontSize: 12 }}>Nenhuma atividade ainda.</div>}
              {chatEntries.map((entry, idx) => {
                if (entry.type === 'system') {
                  return (
                    <div key={`sys-${idx}-${entry.ts}`} className={styles.chatEntryText} style={{ background: '#20252c' }}>
                      [Sistema {timeFmt(entry.ts)}] {entry.data.message}
                    </div>
                  );
                }
                if (entry.type === 'text') {
                  let isJson = false;
                  let parsed = null;
                  try {
                     parsed = JSON.parse(entry.data.text);
                     if(parsed && parsed.type) isJson = true;
                  } catch(err) {}

                  if(isJson && parsed.type === 'npc_card') {
                     const { npc, rpDetails } = parsed;
                     return (
                        <div key={`txt-${idx}-${entry.ts}`} style={{ background: '#1c2430', border: '1px solid #364455', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, borderBottom: '1px solid #2d3b4f', paddingBottom: 6 }}>
                              <FaUserSecret color="#ffb347" /> <strong style={{ color: '#ffb347', fontSize: 13 }}>SINTÉTICO DE NPC</strong>
                           </div>
                           <div style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>{npc.name}</div>
                           <div style={{ color: '#8fa8bf', fontSize: 11, marginBottom: 8 }}>{npc.occupation}</div>
                           <div style={{ background: '#101419', padding: 8, borderRadius: 6, fontSize: 12, border: '1px solid #1a222c' }}>
                              <div style={{ color: '#bae6ff', marginBottom: 4 }}><strong>Temperamento:</strong> {rpDetails.temperament}</div>
                              <div style={{ color: '#ffd4d4' }}><strong>Objetivo:</strong> {rpDetails.objective}</div>
                           </div>
                        </div>
                     );
                  }

                  if(isJson && parsed.type === 'event_card') {
                     const { card } = parsed;
                     return (
                        <div key={`txt-${idx}-${entry.ts}`} style={{ background: '#2c141c', border: '1px solid #5a2e4b', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, borderBottom: '1px solid #5a2e4b', paddingBottom: 6 }}>
                              <FaLayerGroup color="#ffb3e6" /> <strong style={{ color: '#ffb3e6', fontSize: 13 }}>EVENTO DO BARALHO</strong>
                           </div>
                           <div style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>{card.title}</div>
                           <div style={{ color: '#ffb3e6', fontSize: 11, marginBottom: 8, textTransform: 'uppercase' }}>{card.type}</div>
                           <div style={{ background: '#1a0d14', padding: 8, borderRadius: 6, fontSize: 12, fontStyle: 'italic', color: '#ffebf5', border: '1px solid #3d1b30' }}>
                              "{card.desc}"
                           </div>
                        </div>
                     );
                  }

                  return (
                    <div key={`txt-${idx}-${entry.ts}`} className={styles.chatEntryText}>
                      <div style={{ color: '#8fd3ff', fontSize: 11, marginBottom: 3 }}>{entry.data.senderName} {timeFmt(entry.ts)}</div>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{entry.data.text}</div>
                    </div>
                  );
                }
                const roll = entry.data;
                const actorName = charNameById.get(String(roll.characterId)) || roll.rollerName || 'Personagem';
                return (
                  <div key={`roll-${idx}-${entry.ts}`} className={styles.chatEntryRoll}>
                    <div style={{ fontSize: 12, marginBottom: 2, color: '#8fd3ff' }}>{actorName} rolou {roll.formula}</div>
                    <div style={{ fontSize: 11, marginBottom: 4, color: '#a8b9cc' }}>Teste: {roll.skill || 'Instinto + Conhecimento/Pratica'}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(roll.roll || []).map((die, dieIndex) => (
                        <div key={`${die.sides}-${die.face}-${dieIndex}`} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#202833', border: '1px solid #2d3744', borderRadius: 4, padding: '4px 6px' }}>
                          <span style={{ fontSize: 10, color: '#9fb0c4' }}>d{die.sides}</span>
                          {(die.result || []).length === 0 && <span style={{ fontSize: 10, color: '#697789' }}>nada</span>}
                          {(die.result || []).map((img, imgI) => (
                            <img key={`${img}-${imgI}`} src={img} alt="simbolo" style={{ width: 16, height: 16, objectFit: 'contain' }} />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={styles.chatInputArea}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ fontSize: 12, color: '#9eacbd' }}>Rolando como: <strong style={{ color: '#fff' }}>{activeRollCharacter?.name || 'Nenhuma ficha selecionada'}</strong></div>
                {isMaster && (
                  <select value={chatIdentity} onChange={(e) => setChatIdentity(e.target.value)} className={styles.inputField} style={{ padding: '2px 8px', fontSize: 11, width: 'auto', marginBottom: 0 }}>
                    <option value="character">Token de {activeRollCharacter?.name || 'Ficha'}</option>
                    <option value="gm">Mestre (Narrador)</option>
                  </select>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => setRollMode('skill')} className={styles.inputField} style={{ flex: 1, background: rollMode === 'skill' ? '#1d3342' : '#12161c', cursor: 'pointer' }}>Pericia + Instinto</button>
                <button type="button" onClick={() => setRollMode('assimilation')} className={styles.inputField} style={{ flex: 1, background: rollMode === 'assimilation' ? '#1d3342' : '#12161c', cursor: 'pointer' }}>Assimilacao</button>
              </div>
              {rollMode === 'skill' ? (
                <>
                  <select value={selectedSkillKey} onChange={(e) => setSelectedSkillKey(e.target.value)} className={styles.inputField}>
                    <option value="">Selecione a pericia</option>
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
              <button type="button" onClick={submitRoll} disabled={isRolling} className={styles.primaryBtn} style={{ opacity: isRolling ? 0.6 : 1 }}>{isRolling ? 'Rolando...' : 'Rolar'}</button>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendTextMessage()} placeholder="Mensagem da mesa..." className={styles.inputField} style={{ flex: 1 }} />
                <button type="button" onClick={sendTextMessage} className={styles.primaryBtn} style={{ background: '#263341', border: '1px solid #455261' }}>Enviar</button>
              </div>
            </div>
          </>
        )}

        {rightTab === 'sheet' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {sheetCharacters.map((char) => (
                <button key={char._id} type="button" onClick={() => setSelectedSheetCharId(char._id)} style={{ padding: '6px 8px', borderRadius: 999, border: selectedSheetCharacter?._id === char._id ? '1px solid #6ad3ff' : '1px solid #2d323a', background: selectedSheetCharacter?._id === char._id ? '#1d3342' : '#141a21', color: '#fff', fontSize: 11, cursor: 'pointer' }}>
                  {char.name}
                </button>
              ))}
            </div>
            {!selectedSheetCharacter && <div style={{ color: '#8b96a8', fontSize: 12 }}>Nenhuma ficha disponivel.</div>}
            {selectedSheetCharacter && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <img src={selectedSheetCharacter.avatar || 'https://konvajs.org/assets/lion.png'} alt={selectedSheetCharacter.name} style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover', border: '1px solid #2d323a' }} />
                  <div>
                    <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{selectedSheetCharacter.name}</div>
                    <div style={{ color: '#9dacbf', fontSize: 12 }}>{selectedSheetCharacter.generation || 'Geracao n/d'} | {selectedSheetCharacter.occupation || 'Ocupacao n/d'}</div>
                  </div>
                </div>
                <div style={{ background: '#151b22', border: '1px solid #2b333d', borderRadius: 8, padding: 10 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                    <span style={{ color: '#9fb2c7', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' }}>Pontos de Vida</span>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {Array.from({ length: selectedSheetCharacter?.healthLevels?.length || 6 }).map((_, idx) => (
                        idx < (selectedSheetCharacter?.currentHealthLevel ?? 6) 
                        ? <FaHeart key={idx} size={20} color="#ff4c4c" />
                        : <FaRegHeart key={idx} size={20} color="#3b4450" />
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <div style={{ background: '#101419', padding: 8, borderRadius: 6, border: '1px solid #1e2630' }}>
                      <div style={{ color: '#6ad3ff', fontSize: 14, fontWeight: 'bold' }}>{(selectedSheetCharacter.inventory || []).length}</div>
                      <div style={{ color: '#7b8697', fontSize: 10, textTransform: 'uppercase' }}>Itens</div>
                    </div>
                    <div style={{ background: '#101419', padding: 8, borderRadius: 6, border: '1px solid #1e2630' }}>
                      <div style={{ color: '#ffb347', fontSize: 14, fontWeight: 'bold' }}>{(selectedSheetCharacter.characteristics || []).length}</div>
                      <div style={{ color: '#7b8697', fontSize: 10, textTransform: 'uppercase' }}>Traços</div>
                    </div>
                    <div style={{ background: '#101419', padding: 8, borderRadius: 6, border: '1px solid #1e2630', gridColumn: '1 / span 2' }}>
                      <div style={{ color: '#bde7ff', fontSize: 14, fontWeight: 'bold' }}>{(selectedSheetCharacter.assimilations || []).length}</div>
                      <div style={{ color: '#7b8697', fontSize: 10, textTransform: 'uppercase' }}>Poderes Assimilados</div>
                    </div>
                  </div>
                </div>
                <button type="button" onClick={() => setSheetOverlayCharId(selectedSheetCharacter._id)} className={styles.primaryBtn} style={{ background: '#202833', border: '1px solid #3b4450', fontWeight: 700 }}>ABRIR FICHA COMPLETA NO VTT</button>
                {isMaster && (
                  <button type="button" onClick={() => spawnToken(selectedSheetCharacter)} className={styles.primaryBtn} style={{ background: '#3a2f12', border: '1px solid #785d20', color: '#ffe3a7', fontWeight: 700 }}>COLOCAR TOKEN DESTA FICHA NO MAPA</button>
                )}
              </div>
            )}
          </div>
        )}

        {rightTab === 'shield' && isMaster && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button type="button" onClick={() => navigate(`/campaign-sheet/${id}`)} className={styles.primaryBtn} style={{ background: '#1b2633', border: '1px solid #3b4450', gridColumn: '1 / span 2' }}>
                <FaFolder /> Painel da Campanha (Fichas)
              </button>
              <button onClick={() => setOpenNpcModal(true)} className={styles.primaryBtn} style={{ background: '#301828', border: '1px solid #5a2e4b', color: '#ffb3e6' }}><FaUserSecret /> Add NPC</button>
              <button onClick={() => setOpenEventDeckModal(true)} className={styles.primaryBtn} style={{ background: '#1a1f33', border: '1px solid #2e385c', color: '#b3c6ff' }}><FaLayerGroup /> Baralho</button>
              {!activeConflict && (
                <button type="button" onClick={() => setOpenConflictModal(true)} className={styles.primaryBtn} style={{ background: '#17344a', border: '1px solid #2a5f86', color: '#bde7ff', fontWeight: 700, gridColumn: '1 / span 2' }}>
                 <FaCrosshairs /> Iniciar Conflito Rastreado
                </button>
              )}
            </div>

            <div style={{ background: '#171d24', border: '1px solid #2c343e', borderRadius: 8, padding: 10, marginTop: 10 }}>
               <div style={{ color: '#9fb2c7', fontSize: 11, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span><FaDiceD20 /> DADOS LIVRES</span>
               </div>
               <MasterDiceRoller campaignId={id} />
            </div>

            {!activeConflict && <div style={{ color: '#8b96a8', fontSize: 12 }}>Nenhum conflito ativo no momento.</div>}
            {activeConflict && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ background: '#171d24', border: '1px solid #2c343e', borderRadius: 8, padding: 10 }}>
                  <div style={{ color: '#9fb2c7', fontSize: 11, marginBottom: 6 }}>OBJETIVOS</div>
                  {(activeConflict.objectives || []).map((obj, idx) => (
                    <div key={`obj-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8 }}>
                      <span style={{ color: '#dce5ef', fontSize: 12 }}>{obj.name || `Objetivo ${idx + 1}`}: {obj.progress}/{obj.total}</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button type="button" onClick={() => handleProgressUpdate('objective', idx, -1)} disabled={isConflictLoading} className={styles.primaryBtn} style={{ width: 24, height: 24, padding: 0, background: '#1f2731', border: '1px solid #3b4450' }}>-</button>
                        <button type="button" onClick={() => handleProgressUpdate('objective', idx, 1)} disabled={isConflictLoading} className={styles.primaryBtn} style={{ width: 24, height: 24, padding: 0, background: '#1f2731', border: '1px solid #3b4450' }}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#171d24', border: '1px solid #2c343e', borderRadius: 8, padding: 10 }}>
                  <div style={{ color: '#9fb2c7', fontSize: 11, marginBottom: 6 }}>AMEACAS</div>
                  {(activeConflict.threats || []).map((threat, tIdx) => (
                    <div key={`thr-${tIdx}`} style={{ marginBottom: 8 }}>
                      <div style={{ color: '#ffd4d4', fontSize: 12, marginBottom: 4 }}>{threat.name || `Ameaca ${tIdx + 1}`}</div>
                      {(threat.activations || []).map((act, aIdx) => (
                        <div key={`act-${tIdx}-${aIdx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, gap: 8 }}>
                          <span style={{ color: '#dce5ef', fontSize: 12 }}>{act.name || `Ativacao ${aIdx + 1}`}: {act.progress}/{act.total}</span>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button type="button" onClick={() => handleProgressUpdate('threat', tIdx, -1, aIdx)} disabled={isConflictLoading} className={styles.primaryBtn} style={{ width: 24, height: 24, padding: 0, background: '#1f2731', border: '1px solid #3b4450' }}>-</button>
                            <button type="button" onClick={() => handleProgressUpdate('threat', tIdx, 1, aIdx)} disabled={isConflictLoading} className={styles.primaryBtn} style={{ width: 24, height: 24, padding: 0, background: '#1f2731', border: '1px solid #3b4450' }}>+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={handleEndConflict} disabled={isConflictLoading} className={styles.dangerBtn} style={{ alignSelf: 'flex-start' }}>
                  Encerrar Conflito
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <ConflictTracker open={openConflictModal} onClose={() => setOpenConflictModal(false)} onStartConflict={handleStartConflict} />

      {isHelpOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsHelpOpen(false)}>
          <div className={styles.tokenEditBox} style={{ maxWidth: 400, transform: 'translateY(-20vh)' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, color: '#67d7ff', fontFamily: 'Orbitron', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><FaKeyboard /> Atalhos do VTT</h3>
            <ul style={{ listStyle: 'none', padding: 0, color: '#dce5ef', fontSize: 13, lineHeight: '2' }}>
              <li><strong>RMB (Direito)</strong>: Mover Câmera (Pan) Livre</li>
              <li><strong>V</strong>: Ferramenta de Seleção</li>
              <li><strong>R</strong>: Ferramenta de Régua Visual</li>
              <li><strong>D</strong>: Desenho Livre (Caneta)</li>
              <li><strong>T</strong>: Texto / Notas de Fundo</li>
              <li><strong>E</strong>: Borracha de Elementos Gráficos</li>
              <li><strong>G</strong>: Liga/Desliga a Grade do Mapa</li>
              <li><strong>Ctrl + C / Ctrl + V</strong>: Colar imagens (Menu Radial / Nuvem)</li>
              <li><strong>Ctrl + Z</strong>: Desfazer pintura ou ação</li>
              <li><strong>Ctrl + Y</strong>: Refazer pintura ou ação</li>
            </ul>
            <button onClick={() => setIsHelpOpen(false)} className={styles.primaryBtn} style={{ marginTop: 15 }}>Entendi</button>
          </div>
        </div>
      )}

      {openNpcModal && (
        <div className={styles.modalOverlay} onClick={() => setOpenNpcModal(false)}>
           <div style={{ width: 800, background: '#111', border: '1px solid #333', borderRadius: 8, padding: 16 }} onClick={e => e.stopPropagation()}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
               <h3 style={{ margin: 0, color: '#fff', fontFamily: 'Orbitron' }}>Gerar NPC Rápido</h3>
               <button onClick={() => setOpenNpcModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18 }}><FaTimes /></button>
             </div>
             <NPCGenerator campaignId={id} onNpcSaved={() => setOpenNpcModal(false)} onShareToChat={handleShareToChat} />
           </div>
        </div>
      )}

      <EventDeckModal open={openEventDeckModal} onClose={() => setOpenEventDeckModal(false)} onSelectEvent={() => setOpenEventDeckModal(false)} onShareToChat={handleShareToChat} />

      {sheetOverlayCharId && (
        <div className={styles.modalOverlay} onClick={() => setSheetOverlayCharId('')}>
          <div style={{ width: 'min(1200px, 95vw)', height: 'min(92vh, 980px)', borderRadius: 10, overflow: 'hidden', border: '1px solid #3b4450', background: '#0f1318', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2b333d', color: '#fff', fontFamily: 'Orbitron', fontSize: 12 }}>
              <span>Ficha Integrada no VTT</span>
              <button type="button" onClick={() => setSheetOverlayCharId('')} className={styles.primaryBtn} style={{ background: '#1b2633', border: '1px solid #4e5968', padding: '4px 12px' }}>FECHAR</button>
            </div>
            <iframe title="Ficha do personagem" src={`/character-sheet/${sheetOverlayCharId}?embed=1&vtt=1`} style={{ flex: 1, width: '100%', border: 'none', background: '#0f1318' }} />
          </div>
        </div>
      )}

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
        rulerUnit={rulerUnit}
        rulerMultiplier={rulerMultiplier}
        rulerMoveBudget={rulerMoveBudget}
        undoSignal={undoSignal}
        redoSignal={redoSignal}
        initialDrawings={currentScene.drawings || []}
        onAddDrawing={handleAddDrawing}
        onRemoveDrawing={handleRemoveDrawing}
        onAddShapeToken={handleAddShapeToken}
        onTokenContextMenu={handleTokenContextMenu}
        activeEditorLayer={activeEditorLayer}
        onEditLabel={(tokenId, currentLabel, screenX, screenY) => {
          setEditingLabel({ id: tokenId, currentLabel, screenX, screenY });
        }}
      />
    </div>
  );
};

export default VTT;