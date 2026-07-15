import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

// Redux Imports
import { updateSkills, setSelectedInstinct } from "../redux/slices/skillsSlice";
import { saveSkillsToBackend } from "../redux/actions/skillActions";
import { updateInstincts } from "../redux/slices/instinctsSlice";
import { fetchInstincts } from "../redux/actions/instinctsActions";

// Components Internos do Projeto
import EditItemDialog from "../components/EditItemDialog";
import InventoryGrid from "../components/InventoryGrid";
import TugOfWar from "../components/TugOfWar";
import ItemsModal from "../components/ItemsModal";
import AssimilationsModal from "../components/AssimilationsModal";
import CharacteristicsModal from "../components/CharacteristicsModal";
import SystemText from "../components/SystemText";
import RollResultCard from "../components/RollResultCard";
import RollKeepSelector from "../components/RollKeepSelector";
import { dispatchToast } from "../components/notifications/ToastProvider";
import PageLoader from "../components/ui/PageLoader";
import EmptyState from "../components/ui/EmptyState";
import Dialog from "../components/ui/Dialog";
import api from "../api";
import { getItemImageUrl, normalizeItemImageFields } from "../utils/itemImages";
import { applyRollSelectionFallback, rollAssimilationDice } from "../utils/assimilationDice";
import { HEALTH_LEVEL_DETAILS, normalizeCharacterHealth } from "../utils/characterHealth";

// Icons (Apenas ícones visuais para UI interna)
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from "@mui/icons-material/History";
import CloseIcon from "@mui/icons-material/Close";

// SVG Components
import { ReactComponent as MeuIcone } from "../assets/icons/d10_forma.svg";
import { ReactComponent as MeuIcone2 } from "../assets/icons/d12_forma.svg";
import { ReactComponent as HeartFullIcon } from "../assets/icons/heart-full.svg";
import { ReactComponent as HeartEmptyIcon } from "../assets/icons/heart-empty.svg";

// Assets Placeholders
import ArmaPlaceholder from "../assets/arma_placeholder.svg";
import UtilidadePlaceholder from "../assets/utilidade_placeholder.svg";
import ConsumivelPlaceholder from "../assets/consumivel_placeholder.svg";
import conhecimentosIcon from "../assets/icons/conhecimentos.png";
import praticasIcon from "../assets/icons/praticas.png";
import instintosIcon from "../assets/icons/instintos.png";
import determinationPointIcon from "../assets/icons/ICONES_PONTOS_NIVEIS_ASSIMILACAO_DETERMINACAO_pontos_determinacao_cima_NOVO.png";
import assimilationPointIcon from "../assets/icons/ICONES_PONTOS_NIVEIS_ASSIMILACAO_DETERMINACAO_pontos_assimilacao_baixo_NOVA.png";

// Procure por volta da linha 25 e adicione:
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";

// CSS Module
import styles from "./CharacterSheet.module.css";

// ------------------------------------------
// LÓGICA DE DADOS (DADOS E FÓRMULAS)
// ------------------------------------------

// ------------------------------------------
// TRADUÇÕES E CONFIGURAÇÕES
// ------------------------------------------

const knowledgeKeys = [
  "geography",
  "medicine",
  "security",
  "biology",
  "erudition",
  "engineering",
];
const practiceKeys = [
  "weapons",
  "athletics",
  "expression",
  "stealth",
  "crafting",
  "survival",
];

const translateKey = (key) => {
  const translations = {
    // Status e Labels
    health: "Saúde",
    Current: "Atual",
    current: "Atual",
    collapse: "Colapso",

    // GERAÇÕES (Adicionadas para tradução de display se necessário em outros lugares)
    preCollapse: "Pré-Colapso",
    postCollapse: "Pós-Colapso",

    // Atributos
    Knowledge: "Conhecimento",
    knowledge: "Conhecimento",
    Practices: "Práticas",
    practices: "Práticas",
    Instincts: "Instintos",
    instincts: "Instintos",
    Perception: "Percepção",
    perception: "Percepção",
    Potency: "Potência",
    potency: "Potência",
    Influence: "Influência",
    influence: "Influência",
    Resolution: "Resolução",
    resolution: "Resolução",
    Sagacity: "Sagacidade",
    sagacity: "Sagacidade",
    Reaction: "Reação",
    reaction: "Reação",

    // Skills
    geography: "Geografia",
    Geography: "Geografia",
    medicine: "Medicina",
    Medicine: "Medicina",
    security: "Segurança",
    Security: "Segurança",
    biology: "Biologia",
    Biology: "Biologia",
    erudition: "Erudição",
    Erudition: "Erudição",
    engineering: "Engenharia",
    Engineering: "Engenharia",
    weapons: "Armas",
    Weapons: "Armas",
    athletics: "Atletismo",
    Athletics: "Atletismo",
    expression: "Expressão",
    Expression: "Expressão",
    stealth: "Furtividade",
    Stealth: "Furtividade",
    crafting: "Manufaturas",
    Crafting: "Manufaturas",
    survival: "Sobrevivência",
    Survival: "Sobrevivência",
  };
  return translations[key] || key;
};

const healthLevelDetails = HEALTH_LEVEL_DETAILS;

const qualityLevels = {
  0: "Quebrado",
  1: "Defeituoso",
  2: "Comprometido",
  3: "Padrão",
  4: "Reforçado",
  5: "Superior",
  6: "Obra-Prima",
};

const quickAccessPlaceholders = [
  { type: "Arma", icon: ArmaPlaceholder },
  { type: "Utilidade", icon: UtilidadePlaceholder },
  { type: "Consumível", icon: ConsumivelPlaceholder },
];

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const validateImageFile = (file) => {
  if (!file) return { ok: false, message: "Nenhum arquivo selecionado." };

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { ok: false, message: "Formato inválido. Use JPG ou PNG." };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { ok: false, message: "Imagem acima de 5MB. Escolha um arquivo menor." };
  }

  return { ok: true };
};

// ------------------------------------------
// COMPONENTES AUXILIARES (UI)
// ------------------------------------------

const CustomModal = ({ open, onClose, title, children }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="small"
      actions={<button type="button" className={styles.mainBtn} onClick={onClose}>Fechar</button>}
    >
      <div className={styles.modalContent}>{children}</div>
    </Dialog>
  );
};

const CustomToast = ({ open, rollResult, customRollResult, onClose }) => {
  if (!open) return null;

  // Fecha automaticamente após 6s
  setTimeout(() => {
    if (open && onClose) onClose();
  }, 6000);

  const displayData = rollResult || customRollResult;
  if (!displayData) return null;

  return ReactDOM.createPortal(
    <div className={styles.toastContainer} onClick={onClose}>
      {displayData.effectMessage && (
        <div
          style={{
            color: "#4caf50",
            fontStyle: "italic",
            marginBottom: "8px",
            fontSize: "0.9rem",
          }}
        >
          <SystemText text={displayData.effectMessage} />
        </div>
      )}

      <RollResultCard
        roll={displayData.roll || []}
        actionLabel={displayData.skill ? translateKey(displayData.skill) : "Rolagem livre"}
        formula={displayData.formula}
        timestamp={displayData.timestamp || Date.now()}
        selection={displayData.selection}
        variant="latest"
        recent
      />
    </div>,
    document.body
  );
};

const RollResourceControl = ({
  character,
  checked,
  disabled,
  onChange,
  assimilation = false,
}) => {
  const determinationPoints = Number(character?.determinationPoints || 0);
  const determinationLevel = Number(character?.determinationLevel || 0);
  const assimilationPoints = Number(character?.assimilationPoints || 0);
  const assimilationLevel = Number(character?.assimilationLevel || 0);
  const instinctCost = assimilationPoints > 0 ? "1 ASS" : "2 DET";

  return (
    <div className={styles.rollResourceControl}>
      <div className={styles.rollResourceCounters} aria-label="Recursos do Cabo de Guerra">
        <span title="Pontos de Determinação disponíveis">
          <img src={determinationPointIcon} alt="" />
          <b>{determinationPoints}</b><small>/{determinationLevel}</small>
        </span>
        <span title="Pontos de Assimilação disponíveis">
          <img src={assimilationPointIcon} alt="" />
          <b>{assimilationPoints}</b><small>/{assimilationLevel}</small>
        </span>
        {assimilation && <em title="Custo de Agir por Instinto">Instinto -{instinctCost}</em>}
      </div>
      <label
        className={`${styles.rollResourceSwitch} ${checked ? styles.rollResourceSwitchActive : ""}`}
        title="Empenho: gaste 1 Ponto de Determinação antes da rolagem para manter um dado adicional. Máximo de uma vez por rodada."
      >
        <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange} />
        <i aria-hidden="true" />
        <span>Empenho <small>+1 dado</small></span>
      </label>
    </div>
  );
};

// ------------------------------------------
// COMPONENTES DE FICHA
// ------------------------------------------

const SkillList = ({ title, id, addRollToHistory, character, onCharacterResourcesUpdated }) => {
  const dispatch = useDispatch();
  const globalSkills = useSelector((state) => state.skills?.skills || {});
  const selectedInstinct = useSelector(
    (state) => state.skills.selectedInstinct
  );
  const instincts = useSelector((state) => state.instincts.instincts);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSkillDesc, setSelectedSkillDesc] = useState({
    name: "",
    desc: "",
  });
  const [rollToastOpen, setRollToastOpen] = useState(false);
  const [currentRoll, setCurrentRoll] = useState(null);
  const [pendingSkillRoll, setPendingSkillRoll] = useState(null);
  const [useDetermination, setUseDetermination] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchInitialData = async () => {
        try {
          const response = await api.get(`/characters/${id}`);
          const { knowledge = {}, practices = {} } = response.data;
          const combinedSkills = { ...knowledge, ...practices };
          dispatch(updateSkills(combinedSkills));
        } catch (error) {
          console.error("Error loading skills:", error);
        }
      };
      fetchInitialData();
      dispatch(fetchInstincts(id));
    }
  }, [id, dispatch]);

  const handleRoll = async (key) => {
    const instinctKey = selectedInstinct[key];
    if (!instinctKey) {
      dispatchToast({ message: "Selecione um instinto!", type: "warning" });
      return;
    }

    const skillVal = parseInt(globalSkills[key]) || 0;
    const instVal = parseInt(instincts[instinctKey]) || 0;

    const formulaParts = [];
    if (skillVal > 0) formulaParts.push(`${skillVal}d10`);
    if (instVal > 0) formulaParts.push(`${instVal}d6`);

    if (!formulaParts.length) {
      dispatchToast({ message: "Os valores desta rolagem estão zerados.", type: "warning" });
      return;
    }
    const formula = formulaParts.join("+");
    let keepCount = 1;

    if (useDetermination) {
      try {
        const response = await api.post(`/characters/${id}/prepare-roll`, {
          rollMode: "skill",
          useDetermination: true,
        });
        keepCount = Number(response.data?.keepCount) || 2;
        onCharacterResourcesUpdated?.(response.data?.character);
        setUseDetermination(false);
      } catch (error) {
        dispatchToast({
          message: error.response?.data?.message || "Não foi possível usar Empenho.",
          type: "warning",
        });
        return;
      }
    }

    const result = rollAssimilationDice(formula);

    const rollData = {
      skill: `${translateKey(key)} + ${translateKey(instinctKey)}`,
      formula,
      rollMode: "skill",
      pileSources: [
        { label: translateKey(key), count: skillVal, sides: 10 },
        { label: translateKey(instinctKey), count: instVal, sides: 6 },
      ].filter((source) => source.count > 0),
      selectionRule: {
        label: keepCount > 1 ? "Empenho" : "Escolha padrão",
        reason: keepCount > 1 ? "Mantenha 2 resultados desta pilha." : "Mantenha um resultado desta pilha.",
      },
      roll: result,
    };
    setPendingSkillRoll({ rollData, keepCount });
  };

  const handleEditSkill = (key, val) => {
    const newSkills = { ...globalSkills, [key]: parseInt(val) || 0 };
    dispatch(updateSkills(newSkills));
    dispatch(saveSkillsToBackend(id, newSkills));
  };

  const openDesc = (key) => {
    const descriptions = {
      geography:
        "Conhecimento sobre terrenos, mapas, rotas e ambientes naturais ou urbanos.",
      medicine:
        "Conhecimento sobre medicina, anatomia, tratamentos e primeiros socorros.",
      security:
        "Habilidade em sistemas de segurança, travas, vigilância e contra-inteligência.",
      biology: "Conhecimento sobre fauna, flora, ecologia e ciências naturais.",
      erudition:
        "Conhecimento sobre história, culturas, política e informações gerais do mundo pré e pós-colapso.",
      engineering:
        "Habilidade com mecânica, eletrônica, construção e reparo de estruturas e equipamentos.",
      weapons: "Habilidade com armas de fogo e combate corpo a corpo.",
      athletics:
        "Habilidades envolvendo corrida, escalada, natação e outras proezas físicas.",
      expression:
        "Capacidade de se comunicar efetivamente, seja por persuasão, intimidação, performance ou arte.",
      stealth:
        "Habilidade de se mover silenciosamente, se esconder e passar despercebido.",
      crafting:
        "Habilidades manuais para criar, modificar ou consertar itens, desde vestimentas a pequenas ferramentas.",
      survival:
        "Habilidade de encontrar recursos, rastrear, caçar e se virar em ambientes hostis.",
    };
    setSelectedSkillDesc({
      name: key,
      desc: descriptions[key] || "Sem descrição.",
    });
    setModalOpen(true);
  };

  // Funções Auxiliares para Cor
  const getSkillStyle = (key) => {
    const k = key.toLowerCase();
    // Conhecimento = Azul Ciano
    if (knowledgeKeys.includes(k)) return { borderLeft: "4px solid #02425fff" };
    // Prática = Laranja Vivo
    if (practiceKeys.includes(k)) return { borderLeft: "4px solid #4e0202ff" };
    // Padrão
    return { borderLeft: "4px solid #444" };
  };

  const getSkillLabel = (key) => {
    const k = key.toLowerCase();
    if (knowledgeKeys.includes(k)) return "CONHECIMENTO";
    if (practiceKeys.includes(k)) return "PRÁTICA";
    return "";
  };

  const getSkillIcon = (key) => {
    const k = key.toLowerCase();
    if (knowledgeKeys.includes(k)) return conhecimentosIcon;
    if (practiceKeys.includes(k)) return praticasIcon;
    return null;
  };

  return (
    <>
      <div className={styles.sectionTitle}>{translateKey(title)}</div>
      <RollResourceControl
        character={character}
        checked={useDetermination}
        disabled={Number(character?.determinationPoints || 0) < 1}
        onChange={(event) => setUseDetermination(event.target.checked)}
      />

      {/* Aqui fazemos o loop para mostrar as skills com a cor nova */}
      {Object.entries(globalSkills).map(([key, val]) => (
        <div
          key={key}
          className={styles.rowItem}
          // APLICA A COR DA BORDA AQUI:
          style={getSkillStyle(key)}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              cursor: "pointer",
            }}
            onClick={() => openDesc(key)}
          >
            <div className={styles.itemName} style={{ lineHeight: "1.2" }}>
              {translateKey(key)}
            </div>
            {/* TEXTO PEQUENO (Conhecimento/Prática) */}
            <span
              style={{
                fontSize: "0.65rem",
                color: "#666",
                fontWeight: "bold",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {getSkillIcon(key) && (
                <img
                  src={getSkillIcon(key)}
                  alt=""
                  style={{ width: 13, height: 13, objectFit: "contain", verticalAlign: "-3px", marginRight: 5 }}
                />
              )}
              {getSkillLabel(key)}
            </span>
          </div>

          <input
            type="number"
            className={`${styles.inputField} ${styles.smallInput}`}
            value={val}
            onChange={(e) => handleEditSkill(key, e.target.value)}
          />

          <div className={styles.selectInputWrapper}>
            <select
              className={styles.selectField}
              value={selectedInstinct[key] || ""}
              onChange={(e) =>
                dispatch(setSelectedInstinct({ [key]: e.target.value }))
              }
              style={{ padding: "4px" }}
            >
              <option value="" disabled>
                Instinto
              </option>
              {Object.keys(instincts).map((i) => (
                <option key={i} value={i}>
                  {translateKey(i)}
                </option>
              ))}
            </select>
          </div>
          <button
            className={styles.rollBtn}
            onClick={() => handleRoll(key)}
            disabled={!selectedInstinct[key]}
            title="Rolar Teste"
          >
            <MeuIcone style={{ width: 20, height: 20 }} />
          </button>
        </div>
      ))}

      <CustomModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={translateKey(selectedSkillDesc.name)}
      >
        <p>{selectedSkillDesc.desc}</p>
      </CustomModal>

      <CustomToast
        open={rollToastOpen}
        onClose={() => setRollToastOpen(false)}
        rollResult={currentRoll}
      />
      <RollKeepSelector
        open={!!pendingSkillRoll}
        rollData={pendingSkillRoll?.rollData}
        keepCount={pendingSkillRoll?.keepCount || 1}
        onCancel={() => setPendingSkillRoll(null)}
        onConfirm={(selectedRoll) => {
          setPendingSkillRoll(null);
          setCurrentRoll(selectedRoll);
          setRollToastOpen(true);
          addRollToHistory(selectedRoll);
        }}
      />
    </>
  );
};

const InstinctList = ({
  title,
  instincts,
  selectedInstinct,
  handleInstinctChange,
  onAssimilatedRoll,
  onHealthUpdated,
  id,
  character,
}) => {
  const dispatch = useDispatch();
  const [descModalOpen, setDescModalOpen] = useState(false);
  const [selectedInstinctDesc, setSelectedInstinctDesc] = useState({
    key: "",
    desc: "",
  });
  const [useDetermination, setUseDetermination] = useState(false);

  const updateInstinctValue = async (key, val) => {
    const newValue = Number(val);
    const updated = { ...instincts, [key]: newValue };
    dispatch(updateInstincts(updated));

    try {
      const response = await api.put(`/characters/${id}/instincts`, { instincts: updated });
      onHealthUpdated?.(response.data);
    } catch (err) {
      console.error("Error updating instincts", err);
    }
  };

  const showDesc = (key) => {
    const descs = {
      reaction:
        "Instinto básico que mede a velocidade de reação do indivíduo. Geralmente, é usado em situações em que o personagem está em risco e precisa agir rapidamente ou em testes reflexivos em geral.",
      perception:
        "Governa a capacidade sensorial do personagem, incluindo todos os sentidos e a atenção.",
      sagacity:
        "Facilidade para entender e interpretar dados, explicações ou situações; agudeza de espírito; perspicácia, argúcia, astúcia.",
      potency:
        "Capacidade de exercer pressão física do personagem, incluindo resistência a pressões físicas externas. Mede seu poder físico e elasticidade, relacionando seu sistema nervoso central com seu sistema muscular e ósseo.",
      influence:
        "Sua capacidade de influenciar outras pessoas, seu magnetismo pessoal, carisma, escolha e cuidado com palavras e liderança.",
      resolution:
        "Sua determinação física e mental, capacidade de resistir à pressão psicológica interna e externa.",
    };
    setSelectedInstinctDesc({ key, desc: descs[key] || "Sem descrição." });
    setDescModalOpen(true);
  };

  return (
    <>
      <div className={styles.sectionTitle}>
        <img src={instintosIcon} alt="" style={{ width: 18, height: 18, objectFit: "contain", marginRight: 8, verticalAlign: "-4px" }} />
        {translateKey(title)}
      </div>
      <RollResourceControl
        character={character}
        checked={useDetermination}
        disabled={Number(character?.determinationPoints || 0) < (Number(character?.assimilationPoints || 0) > 0 ? 1 : 3)}
        onChange={(event) => setUseDetermination(event.target.checked)}
        assimilation
      />
      {Object.entries(instincts).map(([key, val]) => (
        <div key={key} className={styles.rowItem}>
          <div className={styles.itemName} onClick={() => showDesc(key)}>
            {translateKey(key)}
          </div>
          <input
            type="number"
            className={`${styles.inputField} ${styles.smallInput}`}
            value={val}
            onChange={(e) => updateInstinctValue(key, e.target.value)}
          />
          <div className={styles.selectInputWrapper}>
            <select
              className={styles.selectField}
              value={selectedInstinct[key] || ""}
              onChange={(e) => handleInstinctChange(key, e.target.value)}
              style={{ padding: "4px" }}
            >
              <option value="" disabled>
                Combinar
              </option>
              {Object.keys(instincts).map((i) => (
                <option key={i} value={i}>
                  {translateKey(i)}
                </option>
              ))}
            </select>
          </div>
          <button
            className={styles.rollBtn}
            onClick={() => onAssimilatedRoll(key, selectedInstinct[key], useDetermination).then((success) => {
              if (success) setUseDetermination(false);
            })}
            title="Rolar Assimilado"
          >
            <MeuIcone2 style={{ width: 20, height: 20 }} />
          </button>
        </div>
      ))}
      <CustomModal
        open={descModalOpen}
        onClose={() => setDescModalOpen(false)}
        title={translateKey(selectedInstinctDesc.key)}
      >
        <p><SystemText text={selectedInstinctDesc.desc} /></p>
      </CustomModal>
    </>
  );
};

// ------------------------------------------
// MAIN COMPONENT (CharacterSheet)
// ------------------------------------------

const CharacterSheet = () => {
  const { id } = useParams();
  const { user, token: reduxToken } = useSelector((state) => state.auth);
  const token = reduxToken || localStorage.getItem("token");
  // Data State
  const [character, setCharacter] = useState(null);
  const [error, setError] = useState(null);
  const instincts = useSelector((state) => state.instincts.instincts);

  // UI Controls
  const [activeTab, setActiveTab] = useState("inventory");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [rollHistory, setRollHistory] = useState([]);

  // Drag and Drop
  const [draggedItem, setDraggedItem] = useState(null); // ITEM ARRASTADO ATUALMENTE

  // Rolls & Modals
  const [customDiceFormula, setCustomDiceFormula] = useState("");
  const [customToastOpen, setCustomToastOpen] = useState(false);
  const [lastCustomRoll, setLastCustomRoll] = useState(null);
  const [pendingRollSelection, setPendingRollSelection] = useState(null);
  const [expandedHealthLevel, setExpandedHealthLevel] = useState(null);

  const [editItem, setEditItem] = useState(null);
  const [itemsModalOpen, setItemsModalOpen] = useState(false);
  const [charsModalOpen, setCharsModalOpen] = useState(false);
  const [assimsModalOpen, setAssimsModalOpen] = useState(false);
  const [inventoryItemsDB, setInventoryItemsDB] = useState([]);
  const [characteristicsDB, setCharacteristicsDB] = useState([]);
  const [assimilationsDB, setAssimilationsDB] = useState([]);

  const [selectedInstinct, setSelectedInstinct] = useState({});
  const [notes, setNotes] = useState("");

  // LOAD DATA
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Você precisa estar autenticado.");
      return;
    }

    const fetchCharacter = async () => {
  try {
    const response = await api.get(`/characters/${id}?t=${new Date().getTime()}`);
    setCharacter(response.data);
    setNotes(response.data.notes || "");
  } catch (error) {
    // Se o servidor respondeu com um erro
    if (error.response) {
      const status = error.response.status;
      const msg = error.response.data.message || "";

      if (status === 403) {
        setError("ACESSO NEGADO: Esta ficha é privada.");
      } else if (status === 401) {
        setError("SESSÃO EXPIRADA: Faça login novamente.");
      } else {
        setError(`ERRO ${status}: ${msg || "Falha ao carregar dados."}`);
      }
    } else {
      // Erro de rede ou servidor fora do ar
      setError("ERRO DE REDE: Não foi possível conectar ao servidor.");
    }
    console.error("Erro detalhado:", error.response);
  }
};
    fetchCharacter();
  }, [id, token]); // Adicionei token aqui por boa prática, já que ele é usado dentro

  // Funções de Fetch Auxiliares
  const fetchInventoryItems = async () => {
    try {
      const res = await api.get("/items");
      setInventoryItemsDB(res.data);
    } catch (e) {}
  };
  const fetchTraits = async (type) => {
    try {
      const url = type === "traits" ? "charactertraits" : "assimilations";
      const setter =
        type === "traits" ? setCharacteristicsDB : setAssimilationsDB;
      const res = await api.get(`/${url}`);
      setter(res.data);
    } catch (e) {}
  };

  // LOGICA DE SLOTS (Calcula espaços)
  const calculateSlots = useCallback(() => {
    if (!character)
      return {
        totalBodySlots: 3,
        totalBackpackSlots: 6,
        usedBodySlots: 0,
        usedBackpackSlots: 0,
        itemsInBody: [],
        itemsInBackpack: [],
      };

    const inventory = character.inventory || [];
    const baseBackpack = 6;

    // Itens que não ocupam espaço (Vestimenta, etc)
    const exemptItems = inventory.filter((inv) => {
      const details = inv.itemData || inv.item;
      return (
        details?.modifiers?.includes("Isento") ||
        ["Vestimenta", "Cantil"].includes(details?.type)
      );
    });

    const itemsInBody = inventory.filter(
      (inv) => inv.slotLocation === "corpo" && !exemptItems.includes(inv)
    );
    const itemsInBackpack = inventory.filter(
      (inv) => inv.slotLocation === "mochila" && !exemptItems.includes(inv)
    );

    // Bonus de mochila
    const backpackBonus = [...itemsInBody, ...itemsInBackpack].reduce(
      (acc, inv) => {
        const details = inv.itemData || inv.item;
        const espacoso = details?.modifiers?.find(
          (m) => m && m.startsWith && m.startsWith("Espaçoso")
        );
        if (espacoso) {
          const val = parseInt(espacoso.split(":")[1]) || 2;
          return acc + val;
        }
        return acc;
      },
      0
    );

    const totalBackpackSlots = baseBackpack + backpackBonus;

    // Função de contagem de slots ocupados
    const calcUsed = (list) =>
      list.reduce((sum, inv) => {
        const det = inv.itemData || inv.item;
        if (!det) return sum;
        let slots = det.slots ?? 1;
        if (det.modifiers?.includes("Pequeno")) slots = 0;
        else if (det.modifiers?.includes("Pesado")) slots += 1;
        return sum + slots;
      }, 0);

    return {
      totalBodySlots: 3,
      totalBackpackSlots,
      usedBodySlots: calcUsed(itemsInBody),
      usedBackpackSlots: calcUsed(itemsInBackpack),
      itemsInBody: inventory.filter((i) => i.slotLocation === "corpo"),
      itemsInBackpack: inventory.filter((i) => i.slotLocation === "mochila"),
    };
  }, [character]);

  const slotsInfo = calculateSlots();
  const canEditSheet = !!character?.canEdit || String(character?.userId || "") === String(user?._id || "");

  // HANDLERS E SAVE
  const saveInventory = async (newCharState) => {
    if (!canEditSheet) {
      dispatchToast({ message: "Você não tem permissão para editar esta ficha.", type: "warning" });
      return;
    }
    try {
      await api.put(`/characters/${id}/inventory`, {
        inventory: newCharState.inventory,
        notes: notes,
        characteristics: newCharState.characteristics,
        assimilations: newCharState.assimilations,
      });
    } catch (err) {
      console.error("Erro ao salvar backend", err);
      dispatchToast({ message: "Falha ao salvar alterações da ficha.", type: "error" });
    }
  };

  const handleInputChange = (field, val) => {
    if (!canEditSheet) return;
    setCharacter((prev) => ({ ...prev, [field]: val }));
    api.put(`/characters/${id}/details`, { [field]: val });
  };

  const handleAvatarChange = async (e) => {
    if (!canEditSheet) return;
    const file = e.target.files[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.ok) {
        dispatchToast({ message: validation.message, type: "warning" });
        e.target.value = "";
        return;
      }

      const formData = new FormData();
      formData.append("avatar", file);
      try {
        const res = await api.put(`/characters/${id}/avatar`, formData);
        if (res.data.character) setCharacter(res.data.character);
        dispatchToast({ message: "Avatar atualizado.", type: "success" });
      } catch (err) {
        dispatchToast({ message: err?.response?.data?.message || "Erro ao subir imagem.", type: "error" });
      }
    }
  };

  const togglePrivacy = async () => {
    try {
      const newVal = !character.isPrivate;
      // Usamos a mesma URL de "details" que você já tem no projeto
      await api.put(`/characters/${id}/details`, { isPrivate: newVal });

      // Atualiza o estado local para o botão refletir a mudança na hora
      setCharacter({ ...character, isPrivate: newVal });
      dispatchToast({
        message: newVal ? "Ficha marcada como privada." : "Ficha marcada como pública.",
        type: "success",
      });
    } catch (err) {
      console.error("Erro ao mudar privacidade", err);
      dispatchToast({ message: "Falha ao atualizar privacidade.", type: "error" });
    }
  };

  // Movimentação e Drag and Drop
  const handleMoveItem = (itemToMove, targetLocation) => {
    if (!itemToMove) return;
    if (itemToMove.slotLocation === targetLocation) return; // Já está lá

    // 2. Atualizar Inventário
    const updatedInventory = character.inventory.map((invItem) => {
      // Compara referência do objeto para saber qual é
      if (invItem === itemToMove) {
        return { ...invItem, slotLocation: targetLocation };
      }
      return invItem;
    });

    const newState = { ...character, inventory: updatedInventory };
    setCharacter(newState);
    saveInventory(newState);
  };

  // Funções D&D passadas para o Grid
  const onDragStartItem = (item) => {
    setDraggedItem(item);
  };

  const onDropItem = (targetLocation) => {
    if (draggedItem) {
      handleMoveItem(draggedItem, targetLocation);
      setDraggedItem(null); // Reseta
    }
  };

  const handleAddItem = (item) => {
    const normalizedItem = normalizeItemImageFields(item);
    const imageUrl = getItemImageUrl(normalizedItem);
    const updatedInv = [
      ...(character.inventory || []),
      {
        quantity: 1,
        quality: normalizedItem.quality ?? 3,
        slotLocation: "mochila",
        currentUses: 0,
        itemData: {
          originalItemId: normalizedItem._id,
          name: normalizedItem.name,
          type: normalizedItem.type,
          category: normalizedItem.category,
          imageUrl,
          iconUrl: imageUrl,
          icon: imageUrl,
          slots: normalizedItem.slots,
          modifiers: normalizedItem.modifiers || [],
          description: normalizedItem.description,
          characteristics: normalizedItem.characteristics,
          isArtefato: normalizedItem.isArtefato,
          isConsumable: normalizedItem.isConsumable,
          resourceType: normalizedItem.resourceType,
        },
      },
    ];
    const newState = { ...character, inventory: updatedInv };
    setCharacter(newState);
    saveInventory(newState);
    setItemsModalOpen(false);
    dispatchToast({ message: "Item adicionado ao invent?rio.", type: "success" });
  };

  const handleDeleteItem = (index, type = "inventory") => {
    const listName =
      type === "inventory"
        ? "inventory"
        : type === "trait"
        ? "characteristics"
        : "assimilations";
    const newList = [...(character[listName] || [])];
    newList.splice(index, 1);
    const newState = { ...character, [listName]: newList };
    setCharacter(newState);
    saveInventory(newState);
    dispatchToast({ message: "Registro removido da ficha.", type: "info" });
  };


  const handleSaveEditedItem = (originalItem, newItemState) => {
    // 1. Atualiza o array do inventário localmente
    const updatedInventory = character.inventory.map((item) => {
      // Compara se é o item que estava sendo editado (por referência de objeto)
      if (item === originalItem) {
        // CORREÇÃO: Mesclamos os dados novos mantendo a estrutura original (slotLocation, etc)
        return {
          ...item, // Mantém slotLocation, currentUses, _id, etc.
          quality: newItemState.quality, // Atualiza a qualidade na raiz do objeto
          itemData: {
            ...(item.itemData || {}), // Mantém dados antigos do itemData que não foram editados
            ...newItemState // Sobrescreve com os novos dados (name, type, slots, description...)
          }
        };
      }
      return item;
    });

    // 2. Atualiza o estado e salva no Backend
    const newState = { ...character, inventory: updatedInventory };
    setCharacter(newState);
    saveInventory(newState);

    // 3. Fecha o modal
    setEditItem(null);
    dispatchToast({ message: "Item atualizado.", type: "success" });
  };

  const handleHealthChange = (index, value) => {
    if (!canEditSheet) return;
    const normalized = normalizeCharacterHealth(character);
    const updatedLevels = [...normalized.healthLevels];
    const nextValue = Math.min(normalized.maxPerLevel, Math.max(0, Number(value || 0)));
    updatedLevels[index] = nextValue;
    const selectedLevel = 6 - index;
    const currentLevel = nextValue === 0 && selectedLevel > 1 ? selectedLevel - 1 : selectedLevel;
    setExpandedHealthLevel(currentLevel);
    setCharacter((prev) => ({
      ...prev,
      healthLevels: updatedLevels,
      currentHealthLevel: currentLevel,
    }));
    api.put(`/characters/${id}/health`, { healthLevels: updatedLevels, currentHealthLevel: currentLevel })
      .then(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("vtt") === "1" && window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: "ASSIMILACAO_CHARACTER_HEALTH_UPDATED",
            characterId: id,
            healthLevels: updatedLevels,
            currentHealthLevel: currentLevel,
          }, window.location.origin);
        }
      })
      .catch(() => {
        dispatchToast({ message: "Falha ao atualizar vida.", type: "error" });
      });
  };

  // Roll Utils
  const addRollToHistory = async (rollData, display = false) => {
    const entry = {
      ...rollData,
      rollerName: character.name,
      timestamp: Date.now(),
    };
    setRollHistory((prev) => [...prev, entry].slice(-20));

    api.put(`/characters/${id}/last-roll`, { lastRoll: entry });

    if (character.campaign) {
      api.post(`/campaigns/${character.campaign}/roll`, { ...entry, rollerId: user?._id, characterId: id })
        .then((response) => {
          const createdRoll = applyRollSelectionFallback(
            response.data?.roll || (Array.isArray(response.data) ? response.data[0] : entry),
            entry,
          );
          const params = new URLSearchParams(window.location.search);
          if (params.get("vtt") === "1" && window.parent && window.parent !== window) {
            window.parent.postMessage({
              type: "ASSIMILACAO_CHARACTER_ROLL_CREATED",
              roll: createdRoll,
            }, window.location.origin);
          }
        })
        .catch(() => {
          dispatchToast({ message: "A rolagem foi feita, mas não pôde ser registrada na campanha.", type: "error" });
        });
    }
    if (display) {
      setLastCustomRoll(rollData);
      setCustomToastOpen(true);
    }
  };

  const handleCustomRoll = () => {
    if (!customDiceFormula) {
      dispatchToast({ message: "Informe uma fórmula antes de rolar.", type: "warning" });
      return;
    }
    const res = rollAssimilationDice(customDiceFormula);
    if (!res.length) {
      dispatchToast({ message: "Use uma fórmula válida, como 1d6+2d10.", type: "warning" });
      return;
    }
    setPendingRollSelection({
      rollData: {
        formula: customDiceFormula,
        rollMode: "manual",
        selectionRule: { label: "Escolha padrão", reason: "Mantenha um resultado desta pilha." },
        roll: res,
      },
      display: true,
      keepCount: 1,
    });
  };

  const handleInstinctChange = (key, val) =>
    setSelectedInstinct((prev) => ({ ...prev, [key]: val }));
  const handleAssimilatedRoll = async (k1, k2, useDetermination = false) => {
    if (!k2) {
      dispatchToast({ message: "Combine os instintos antes de rolar.", type: "warning" });
      return false;
    }
    const total = (instincts[k1] || 0) + (instincts[k2] || 0);
    if (!total) {
      dispatchToast({ message: "Os instintos selecionados estão zerados.", type: "warning" });
      return false;
    }

    let preparation;
    try {
      const response = await api.post(`/characters/${id}/prepare-roll`, {
        rollMode: "assimilation",
        useDetermination,
      });
      preparation = response.data;
      if (preparation?.character) setCharacter(preparation.character);
    } catch (error) {
      dispatchToast({
        message: error.response?.data?.message || "Não foi possível pagar o custo de Agir por Instinto.",
        type: "warning",
      });
      return false;
    }

    const res = rollAssimilationDice(`${total}d12`);
    const keepCount = Number(preparation?.keepCount) || (useDetermination ? 3 : 2);
    setPendingRollSelection({
      rollData: {
        skill: `Assimilação: ${translateKey(k1)} + ${translateKey(k2)}`,
        formula: `${total}d12`,
        rollMode: "assimilation",
        pileSources: [{ label: "Assimilação", count: total, sides: 12 }],
        resourceSpend: preparation?.resourceSpend,
        selectionRule: {
          label: useDetermination ? "Instinto + Empenho" : "Escolha assimilada",
          reason: `Mantenha ${keepCount} resultados desta pilha.`,
        },
        roll: res,
      },
      display: true,
      keepCount,
    });
    return true;
  };

  // Render
  const normalizedHealth = normalizeCharacterHealth(character || {});
  const displayedHealthLevel = expandedHealthLevel || normalizedHealth.currentLevel;
  const displayedHealthIndex = 6 - displayedHealthLevel;
  const displayedHealthValue = normalizedHealth.healthLevels[displayedHealthIndex];
  const displayedHealthInfo = healthLevelDetails[displayedHealthLevel] || healthLevelDetails[6];
  if (error)
    return (
      <div className={styles.loaderBox}>
        <EmptyState
          title="Ficha indisponível"
          description={error}
          compact
        />
      </div>
    );
  if (!character)
    return (
      <PageLoader title="Carregando ficha" subtitle="Sincronizando inventário e atributos..." />
    );

  return (
    <div className={styles.characterSheet}>
      <div className={styles.container}>
        {/* Header Panel */}
        <div className={styles.headerPanel}>
          <button
            onClick={togglePrivacy}
            className={`${styles.privacyToggle} ${
              character.isPrivate ? styles.isLocked : ""
            }`}
            title={
              character.isPrivate
                ? "Ficha Privada (Apenas Mestre e Você)"
                : "Ficha Pública (Todos na Campanha podem ver)"
            }
          >
            {character.isPrivate ? (
              <LockIcon fontSize="small" />
            ) : (
              <LockOpenIcon fontSize="small" />
            )}
            <span className={styles.privacyLabel}>
              {character.isPrivate ? "PRIVADA" : "PÚBLICA"}
            </span>
          </button>

          <div className={styles.avatarContainer}>
            {character.avatar ? (
              <img
                src={character.avatar}
                alt="Avatar"
                className={styles.avatarImg}
              />
            ) : (
              <div
                style={{
                  color: "#555",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                SEM ID
              </div>
            )}
            <label
              htmlFor="avatar-upload"
              className={styles.avatarEditOverlay}
              aria-label="Alterar imagem do personagem"
              title="Alterar imagem do personagem"
            >
              <PhotoCameraIcon aria-hidden="true" style={{ color: "white", fontSize: 30 }} />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/png,image/jpeg"
              hidden
              onChange={handleAvatarChange}
            />
          </div>

          <div className={styles.headerInputs}>
            <div className={styles.headerInfoRow}>
              <div className={styles.inputGroup}>
                <span className={styles.label}>Nome</span>
                <input
                  className={styles.inputField}
                  value={character.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>

              {/* --- CAMPO CORRIGIDO: EVENTO MARCANTE --- */}
              <div className={styles.inputGroup}>
                <span className={styles.label}>Evento Marcante</span>
                <input
                  className={styles.inputField}
                  placeholder="Trauma ou evento chave..."
                  value={character.event || ""}
                  onChange={(e) =>
                    // MUDANÇA AQUI: De "strikingEvent" para "event"
                    handleInputChange("event", e.target.value)
                  }
                />
              </div>

              {/* === MUDANÇA AQUI: INPUT VIROU SELECT === */}
              <div className={styles.inputGroup}>
                <span className={styles.label}>Geração</span>
                <select
                  className={styles.selectField}
                  value={character.generation || ""}
                  onChange={(e) =>
                    handleInputChange("generation", e.target.value)
                  }
                >
                  <option value="" disabled>
                    Selecione...
                  </option>
                  <option value="preCollapse">Pré-Colapso</option>
                  <option value="collapse">Colapso</option>
                  <option value="postCollapse">Pós-Colapso</option>
                </select>
              </div>
              {/* ======================================= */}

              <div className={styles.inputGroup}>
                <span className={styles.label}>Ocupação</span>
                <input
                  className={styles.inputField}
                  value={character.occupation || ""}
                  onChange={(e) =>
                    handleInputChange("occupation", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Linha 2: Propósitos (Grid 4 colunas) */}
            <div className={styles.headerPurposeRow}>
              <div className={styles.inputGroup}>
                <span className={styles.label} style={{ color: "#8b3434" }}>
                  Propósito Individual 1
                </span>
                <input
                  className={styles.inputField}
                  value={character.purpose1 || ""}
                  onChange={(e) =>
                    handleInputChange("purpose1", e.target.value)
                  }
                />
              </div>
              <div className={styles.inputGroup}>
                <span className={styles.label} style={{ color: "#8b3434" }}>
                  Propósito Individual 2
                </span>
                <input
                  className={styles.inputField}
                  value={character.purpose2 || ""}
                  onChange={(e) =>
                    handleInputChange("purpose2", e.target.value)
                  }
                />
              </div>
              <div className={styles.inputGroup}>
                <span className={styles.label} style={{ color: "#167695" }}>
                  Prop. Relacional 1
                </span>
                <input
                  className={styles.inputField}
                  value={character.relationalPurpose1 || ""}
                  onChange={(e) =>
                    handleInputChange("relationalPurpose1", e.target.value)
                  }
                />
              </div>
              <div className={styles.inputGroup}>
                <span className={styles.label} style={{ color: "#167695" }}>
                  Prop. Relacional 2
                </span>
                <input
                  className={styles.inputField}
                  value={character.relationalPurpose2 || ""}
                  onChange={(e) =>
                    handleInputChange("relationalPurpose2", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* ... RESTO DO CÓDIGO ... */}
        {/* Main Layout, etc. (Mantém o resto igual) */}
        <div className={styles.mainLayout}>
          <div className={styles.colLeft}>
            <InstinctList
              title="Instintos"
              instincts={instincts}
              selectedInstinct={selectedInstinct}
              handleInstinctChange={handleInstinctChange}
              onAssimilatedRoll={handleAssimilatedRoll}
              onHealthUpdated={(payload) => {
                setCharacter((prev) => ({
                  ...prev,
                  instincts: payload.instincts || prev.instincts,
                  healthLevels: Array.isArray(payload.healthLevels) ? payload.healthLevels : prev.healthLevels,
                  currentHealthLevel: payload.currentHealthLevel ?? prev.currentHealthLevel,
                }));
                const params = new URLSearchParams(window.location.search);
                if (params.get("vtt") === "1" && window.parent && window.parent !== window) {
                  window.parent.postMessage({
                    type: "ASSIMILACAO_CHARACTER_HEALTH_UPDATED",
                    characterId: id,
                    healthLevels: payload.healthLevels,
                    currentHealthLevel: payload.currentHealthLevel,
                    instincts: payload.instincts,
                  }, window.location.origin);
                }
              }}
              id={id}
              character={character}
            />
            <section className={styles.vitalStatusSection}>
              <div className={styles.vitalStatusTitleRow}>
                <h3 className={styles.sectionTitle}>Status Vital</h3>
                <span className={styles.vitalStatusFormula}>1 + Potência + Resolução</span>
              </div>

              <div className={`${styles.vitalStatusFocus} ${displayedHealthLevel === normalizedHealth.currentLevel ? styles.vitalStatusFocusCurrent : ""}`}>
                <div className={styles.vitalStatusFocusHeader}>
                  <div>
                    <span className={styles.vitalStatusEyebrow}>
                      {displayedHealthLevel === normalizedHealth.currentLevel ? "Estado atual" : "Ajuste manual"}
                    </span>
                    <strong>{displayedHealthInfo.name}</strong>
                  </div>
                  <span className={styles.vitalStatusValue}>{displayedHealthValue}/{normalizedHealth.maxPerLevel}</span>
                </div>

                <p className={styles.vitalStatusDescription}>{displayedHealthInfo.description}</p>

                <div className={styles.vitalHeartEditor} aria-label={`Pontos de ${displayedHealthInfo.name}`}>
                  {Array.from({ length: normalizedHealth.maxPerLevel }, (_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={styles.vitalHeartButton}
                      onClick={() => handleHealthChange(displayedHealthIndex, index + 1)}
                      disabled={!canEditSheet}
                      aria-label={`Definir ${index + 1} ponto${index === 0 ? "" : "s"} em ${displayedHealthInfo.name}`}
                    >
                      {index < displayedHealthValue
                        ? <HeartFullIcon width={23} height={23} style={{ fill: "#b71c1c" }} />
                        : <HeartEmptyIcon width={23} height={23} style={{ fill: "#292929" }} />}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={styles.vitalClearButton}
                    onClick={() => handleHealthChange(displayedHealthIndex, 0)}
                    disabled={!canEditSheet || displayedHealthValue === 0}
                    title={`Zerar ${displayedHealthInfo.name}`}
                  >
                    <DeleteIcon aria-hidden="true" />
                    Zerar
                  </button>
                </div>
              </div>

              <div className={styles.vitalStatusTrack} aria-label="Trilha do Status Vital">
                {[6, 5, 4, 3, 2, 1].map((level) => {
                  const index = 6 - level;
                  const info = healthLevelDetails[level];
                  const isCurrent = level === normalizedHealth.currentLevel;
                  const isExpanded = level === displayedHealthLevel;
                  return (
                    <button
                      key={level}
                      type="button"
                      className={`${styles.vitalStatusStep} ${isCurrent ? styles.vitalStatusStepCurrent : ""} ${isExpanded ? styles.vitalStatusStepExpanded : ""}`}
                      onClick={() => setExpandedHealthLevel(level)}
                      aria-pressed={isExpanded}
                    >
                      <span className={styles.vitalStatusNode}>{level}</span>
                      <span className={styles.vitalStatusStepName}>{info.name}</span>
                      <span className={styles.vitalStatusStepValue}>{normalizedHealth.healthLevels[index]}/{normalizedHealth.maxPerLevel}</span>
                    </button>
                  );
                })}
              </div>

              {displayedHealthLevel !== normalizedHealth.currentLevel && (
                <button type="button" className={styles.vitalReturnButton} onClick={() => setExpandedHealthLevel(null)}>
                  Voltar ao estado atual
                </button>
              )}
            </section>
          </div>

          <div className={styles.colCenter}>
            <SkillList
              title="Conhecimentos & Práticas"
              id={id}
              character={character}
              addRollToHistory={addRollToHistory}
              onCharacterResourcesUpdated={(updatedCharacter) => {
                if (updatedCharacter) setCharacter(updatedCharacter);
              }}
            />
            <div className={styles.tugOfWarBlock}>
              <TugOfWar character={character} setCharacter={setCharacter} />
            </div>
          </div>

          <div className={styles.colRight}>
            <div className={styles.customDiceArea}>
              <label className={styles.label}>Rolagem Manual</label>
              <div className={styles.customDiceRow}>
                <input
                  className={styles.inputField}
                  placeholder="Ex: 1d6+2d10"
                  value={customDiceFormula}
                  onChange={(e) => setCustomDiceFormula(e.target.value)}
                />
                <button className={styles.mainBtn} onClick={handleCustomRoll}>
                  Rolar
                </button>
              </div>
            </div>
            <div className={styles.tabsContainer}>
              {["inventory", "notes", "traits", "assimilations"].map((tab) => (
                <button
                  key={tab}
                  className={`${styles.tabBtn} ${
                    activeTab === tab ? styles.active : ""
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "traits"
                    ? "Características"
                    : tab === "assimilations"
                    ? "Assimilações"
                    : tab === "notes"
                    ? "Anotações"
                    : "Inventário"}
                </button>
              ))}
            </div>
            {activeTab === "inventory" && (
              <div className={styles.inventoryBox}>
                <div className={styles.inventoryHeaderFlex}>
                  <div
                    className={styles.sectionTitle}
                    style={{ border: 0, margin: 0 }}
                  >
                    ARSENAL
                  </div>
                  {canEditSheet && (
                    <>
                      <button
                        className={styles.mainBtn}
                        onClick={() => {
                          fetchInventoryItems();
                          setItemsModalOpen(true);
                        }}
                        style={{ fontSize: "0.75rem" }}
                      >
                        + Item
                      </button>
                    </>
                  )}
                </div>
                <InventoryGrid
                  title={`Corpo (${slotsInfo.usedBodySlots}/${slotsInfo.totalBodySlots})`}
                  items={slotsInfo.itemsInBody}
                  totalSlots={3}
                  location="corpo"
                  styles={styles}
                  qualityLevels={qualityLevels}
                  placeholders={quickAccessPlaceholders}
                  onMove={(item) => handleMoveItem(item, "mochila")}
                  onDragStartItem={onDragStartItem}
                  onDropItem={() => onDropItem("corpo")}
                  onDelete={(item) =>
                    handleDeleteItem(character.inventory.indexOf(item))
                  }
                  onEdit={(item) => setEditItem({ invItemData: item })}
                  onUse={(item) => {}}
                  readOnly={!canEditSheet}
                />
                <div style={{ height: 20 }}></div>
                <InventoryGrid
                  title={`Mochila (${slotsInfo.usedBackpackSlots}/${slotsInfo.totalBackpackSlots})`}
                  items={slotsInfo.itemsInBackpack}
                  totalSlots={slotsInfo.totalBackpackSlots}
                  location="mochila"
                  styles={styles}
                  qualityLevels={qualityLevels}
                  onMove={(item) => handleMoveItem(item, "corpo")}
                  onDragStartItem={onDragStartItem}
                  onDropItem={() => onDropItem("mochila")}
                  onDelete={(item) =>
                    handleDeleteItem(character.inventory.indexOf(item))
                  }
                  onEdit={(item) => setEditItem({ invItemData: item })}
                  readOnly={!canEditSheet}
                />
              </div>
            )}
            {activeTab === "notes" && (
              <textarea
                className={styles.notesArea}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={() => saveInventory(character)}
                placeholder="Registros da missão..."
              />
            )}
            {activeTab === "traits" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 15,
                  }}
                >
                  <h3>CARACTERÍSTICAS</h3>
                  <button
                    className={styles.mainBtn}
                    onClick={() => {
                      fetchTraits("traits");
                      setCharsModalOpen(true);
                    }}
                  >
                    +
                  </button>
                </div>
                {character.characteristics?.map((c, i) => (
                  <div key={i} className={styles.rowItem}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#fff", fontWeight: "bold" }}>
                        {c.name}
                      </div>
                      <div style={{ fontSize: "0.8em", color: "#888" }}>
                        <SystemText text={c.description} />
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => handleDeleteItem(i, "trait")}
                      aria-label={`Remover característica ${c.name}`}
                      title={`Remover característica ${c.name}`}
                    >
                      <DeleteIcon aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "assimilations" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 15,
                  }}
                >
                  <h3>ASSIMILAÇÕES</h3>
                  <button
                    className={styles.mainBtn}
                    onClick={() => {
                      fetchTraits("assims");
                      setAssimsModalOpen(true);
                    }}
                  >
                    +
                  </button>
                </div>
                {character.assimilations?.map((c, i) => (
                  <div key={i} className={styles.rowItem}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#fff", fontWeight: "bold" }}>
                        {c.name}
                      </div>
                      <div style={{ fontSize: "0.8em", color: "#888" }}>
                        <SystemText text={c.description} />
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => handleDeleteItem(i, "assimilations")}
                      aria-label={`Remover assimilação ${c.name}`}
                      title={`Remover assimilação ${c.name}`}
                    >
                      <DeleteIcon aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <CustomToast
        open={customToastOpen}
        rollResult={null}
        customRollResult={lastCustomRoll}
        onClose={() => setCustomToastOpen(false)}
      />

      <>
          <ItemsModal
            open={itemsModalOpen}
            handleClose={() => setItemsModalOpen(false)}
            items={inventoryItemsDB}
            onItemSelect={handleAddItem}
          />
          <CharacteristicsModal
            open={charsModalOpen}
            handleClose={() => setCharsModalOpen(false)}
            items={characteristicsDB}
            onItemSelect={(trait) => {
              const newState = {
                ...character,
                characteristics: [...(character.characteristics || []), trait],
              };
              setCharacter(newState);
              saveInventory(newState);
              setCharsModalOpen(false);
            }}
          />
          <AssimilationsModal
            open={assimsModalOpen}
            handleClose={() => setAssimsModalOpen(false)}
            items={assimilationsDB}
            onItemSelect={(assim) => {
              const newState = {
                ...character,
                assimilations: [...(character.assimilations || []), assim],
              };
              setCharacter(newState);
              saveInventory(newState);
              setAssimsModalOpen(false);
            }}
          />
          <EditItemDialog
            editItem={editItem}
            onClose={() => setEditItem(null)}
            onSave={(originalItem, newItem) =>
              handleSaveEditedItem(originalItem, newItem)
            }
          />
          <RollKeepSelector
            open={!!pendingRollSelection}
            rollData={pendingRollSelection?.rollData}
            keepCount={pendingRollSelection?.keepCount || 1}
            onCancel={() => setPendingRollSelection(null)}
            onConfirm={(selectedRoll) => {
              const shouldDisplay = pendingRollSelection?.display;
              setPendingRollSelection(null);
              addRollToHistory(selectedRoll, shouldDisplay);
            }}
          />
      </>
      {/* --- INICIO DA ÁREA FLUTUANTE (PORTAL) --- */}
      {ReactDOM.createPortal(
        <>
          {/* Botão de Histórico (Fixo) */}
          <button
            type="button"
            className={`${styles.fabHistory} ${historyOpen ? styles.fabHistoryOpen : ""}`}
            onClick={() => setHistoryOpen((isOpen) => !isOpen)}
            title={historyOpen ? "Fechar histórico de rolagens" : "Abrir histórico de rolagens"}
            aria-label={historyOpen ? "Fechar histórico de rolagens" : "Abrir histórico de rolagens"}
            aria-expanded={historyOpen}
          >
            <span className={styles.fabHistoryIcon} aria-hidden="true">
              {historyOpen ? <CloseIcon /> : <HistoryIcon />}
            </span>
            <span className={styles.fabHistoryLabel}>Rolagens</span>
          </button>

          {/* Popover do Histórico (Janela) */}
          {historyOpen && (
            <div className={styles.historyPopover} style={{ zIndex: 99999 }}>
              {/* Cabeçalho */}
              <div className={styles.historyHeader}>
                <h4 className={styles.historyTitle}>Histórico Recente</h4>
                <button
                  className={styles.clearBtn}
                  onClick={() => setRollHistory([])}
                >
                  Limpar
                </button>
              </div>

              {/* Lista */}
              <div className={styles.historyList}>
                {rollHistory.length === 0 && (
                  <p
                    style={{
                      color: "#555",
                      textAlign: "center",
                      fontStyle: "italic",
                      fontSize: "0.9rem",
                    }}
                  >
                    Nenhuma rolagem feita.
                  </p>
                )}

                {rollHistory
                  .slice()
                  .reverse()
                  .map((h, i) => (
                    <RollResultCard
                      key={h._id || h.id || h.timestamp || i}
                      roll={h.roll || []}
                      actorName={character?.name}
                      actionLabel={h.skill ? translateKey(h.skill) : "Rolagem manual"}
                      formula={h.formula}
                      timestamp={h.timestamp}
                      selection={h.selection}
                      variant="compact"
                    />
                  ))}
              </div>
            </div>
          )}
        </>,
        document.body
      )}
    </div>
  );
};

export default CharacterSheet;
