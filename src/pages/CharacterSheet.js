import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
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

// Icons (Apenas ícones visuais para UI interna)
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from "@mui/icons-material/History";

// SVG Components
import { ReactComponent as MeuIcone } from "../assets/d10.svg";
import { ReactComponent as MeuIcone2 } from "../assets/d12.svg";
import { ReactComponent as HeartFullIcon } from "../assets/icons/heart-full.svg";
import { ReactComponent as HeartEmptyIcon } from "../assets/icons/heart-empty.svg";

// Assets Placeholders
import ArmaPlaceholder from "../assets/arma_placeholder.svg";
import UtilidadePlaceholder from "../assets/utilidade_placeholder.svg";
import ConsumivelPlaceholder from "../assets/consumivel_placeholder.svg";

// Procure por volta da linha 25 e adicione:
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
// CSS Module
import styles from "./CharacterSheet.module.css";

// ------------------------------------------
// LÓGICA DE DADOS (DADOS E FORMULAS)
// ------------------------------------------

const dados = {
  d6: {
    1: [],
    2: [],
    3: [require("../assets/Coruja_1.png")],
    4: [require("../assets/Coruja_1.png")],
    5: [require("../assets/Cervo_1.png"), require("../assets/Coruja_1.png")],
    6: [require("../assets/Joaninha_1.png")],
  },
  d10: {
    1: [],
    2: [],
    3: [require("../assets/Coruja_1.png")],
    4: [require("../assets/Coruja_1.png")],
    5: [require("../assets/Cervo_1.png"), require("../assets/Coruja_1.png")],
    6: [require("../assets/Joaninha_1.png")],
    7: [
      require("../assets/Joaninha_1.png"),
      require("../assets/Joaninha_1.png"),
    ],
    8: [require("../assets/Cervo_1.png"), require("../assets/Joaninha_1.png")],
    9: [
      require("../assets/Cervo_1.png"),
      require("../assets/Joaninha_1.png"),
      require("../assets/Coruja_1.png"),
    ],
    10: [
      require("../assets/Joaninha_1.png"),
      require("../assets/Joaninha_1.png"),
      require("../assets/Coruja_1.png"),
    ],
  },
  d12: {
    1: [],
    2: [],
    3: [require("../assets/Coruja_1.png")],
    4: [require("../assets/Coruja_1.png")],
    5: [require("../assets/Cervo_1.png"), require("../assets/Coruja_1.png")],
    6: [require("../assets/Joaninha_1.png")],
    7: [
      require("../assets/Joaninha_1.png"),
      require("../assets/Joaninha_1.png"),
    ],
    8: [require("../assets/Cervo_1.png"), require("../assets/Joaninha_1.png")],
    9: [
      require("../assets/Cervo_1.png"),
      require("../assets/Joaninha_1.png"),
      require("../assets/Coruja_1.png"),
    ],
    10: [
      require("../assets/Joaninha_1.png"),
      require("../assets/Joaninha_1.png"),
      require("../assets/Coruja_1.png"),
    ],
    11: [
      require("../assets/Cervo_1.png"),
      require("../assets/Cervo_1.png"),
      require("../assets/Joaninha_1.png"),
      require("../assets/Coruja_1.png"),
    ],
    12: [require("../assets/Coruja_1.png"), require("../assets/Coruja_1.png")],
  },
};

const rollCustomDice = (formula) => {
  const regex = /(\d+)d(\d+)/g;
  let match;
  const results = [];

  while ((match = regex.exec(formula)) !== null) {
    const [, count, sides] = match;
    const countInt = parseInt(count);
    const sidesInt = parseInt(sides);
    if (!dados[`d${sidesInt}`]) {
      continue;
    }

    for (let i = 0; i < countInt; i++) {
      const face = Math.floor(Math.random() * sidesInt) + 1;
      const result = dados[`d${sidesInt}`][face] || [];
      results.push({ face, result, sides: sidesInt });
    }
  }

  return results;
};

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

const healthLevelDetails = {
  6: {
    name: "Saudável",
    description: "Recuperação ativa após repouso completo.",
  },
  5: {
    name: "Escoriado",
    description: "Recuperação ativa após repouso completo.",
  },
  4: {
    name: "Lacerado",
    description:
      "Ativa Recuperação após uma semana. Menos 1 em todos os testes.",
  },
  3: {
    name: "Ferido",
    description:
      "Ativa Recuperação após uma semana. Menos 1 em todos os testes.",
  },
  2: {
    name: "Arrebentado",
    description:
      "Incapaz de agir, mas mantém a consciência. Menos 2 em todos os testes.",
  },
  1: {
    name: "Incapacitado",
    description:
      "Inconsciente. Qualquer Ação com teste exige 2 de Adaptação para ativar.",
  },
};

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

// ------------------------------------------
// COMPONENTES AUXILIARES (UI)
// ------------------------------------------

const CustomModal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.modalContent}>{children}</div>
        <div className={styles.modalActions}>
          <button
            className={`${styles.mainBtn}`}
            onClick={onClose}
            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
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
      {/* Cabeçalho do Toast */}
      <div className={styles.toastHeader}>
        <span className={styles.toastLabel}>RESULTADO</span>
        <span
          className={styles.toastTitle}
          title={
            displayData.skill
              ? translateKey(displayData.skill)
              : displayData.formula
          }
        >
          {displayData.skill
            ? translateKey(displayData.skill)
            : displayData.formula || "Manual"}
        </span>
      </div>

      {displayData.effectMessage && (
        <div
          style={{
            color: "#4caf50",
            fontStyle: "italic",
            marginBottom: "8px",
            fontSize: "0.9rem",
          }}
        >
          {displayData.effectMessage}
        </div>
      )}

      {/* Área dos Dados */}
      <div className={styles.toastDiceContainer}>
        {displayData.roll &&
          displayData.roll.map((die, i) => (
            <div key={i} className={styles.toastDieBox}>
              <div className={styles.toastDieType}>d{die.sides}</div>
              <div className={styles.toastDieValue}>
                {die.result && die.result.length > 0 ? (
                  die.result.map((imgSrc, imgIndex) => (
                    <img
                      key={imgIndex}
                      src={imgSrc}
                      alt="dado"
                      style={{
                        width: "28px",
                        height: "28px",
                        objectFit: "contain",
                      }}
                    />
                  ))
                ) : (
                  <span
                    style={{
                      fontSize: "1.4em",
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    {die.face}
                  </span>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>,
    document.body
  );
};

// ------------------------------------------
// COMPONENTES DE FICHA
// ------------------------------------------

const SkillList = ({ title, id, addRollToHistory, character }) => {
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

  useEffect(() => {
    if (id) {
      const fetchInitialData = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `https://assrpgsite-be-production.up.railway.app/api/characters/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
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
    if (!selectedInstinct[key]) {
      alert("Selecione um instinto!");
      return;
    }

    const skillVal = parseInt(globalSkills[key]) || 0;
    const instVal = parseInt(instincts[selectedInstinct[key]]) || 0;

    const formulaParts = [];
    if (skillVal > 0) formulaParts.push(`${skillVal}d10`);
    if (instVal > 0) formulaParts.push(`${instVal}d6`);

    const formula = formulaParts.join("+") || "0d0";
    const result = rollCustomDice(formula);

    const rollData = { skill: key, roll: result };
    setCurrentRoll(rollData);
    setRollToastOpen(true);
    addRollToHistory(rollData);
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

  return (
    <>
      <div className={styles.sectionTitle}>{translateKey(title)}</div>

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
    </>
  );
};

const InstinctList = ({
  title,
  instincts,
  selectedInstinct,
  handleInstinctChange,
  onAssimilatedRoll,
  id,
}) => {
  const dispatch = useDispatch();
  const [descModalOpen, setDescModalOpen] = useState(false);
  const [selectedInstinctDesc, setSelectedInstinctDesc] = useState({
    key: "",
    desc: "",
  });

  const updateInstinctValue = async (key, val) => {
    const newValue = Number(val);
    const updated = { ...instincts, [key]: newValue };
    dispatch(updateInstincts(updated));

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://assrpgsite-be-production.up.railway.app/api/characters/${id}/instincts`,
        { instincts: updated },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
      <div className={styles.sectionTitle}>{translateKey(title)}</div>
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
            onClick={() => onAssimilatedRoll(key, selectedInstinct[key])}
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
        <p>{selectedInstinctDesc.desc}</p>
      </CustomModal>
    </>
  );
};

// ------------------------------------------
// MAIN COMPONENT (CharacterSheet)
// ------------------------------------------

const CharacterSheet = () => {
  const dispatch = useDispatch();
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
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [selectedHealthInfo, setSelectedHealthInfo] = useState({
    name: "",
    desc: "",
  });

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
    const response = await axios.get(
      `https://assrpgsite-be-production.up.railway.app/api/characters/${id}?t=${new Date().getTime()}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
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
      const res = await axios.get(
        "https://assrpgsite-be-production.up.railway.app/api/items",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setInventoryItemsDB(res.data);
    } catch (e) {}
  };
  const fetchTraits = async (type) => {
    try {
      const url = type === "traits" ? "charactertraits" : "assimilations";
      const setter =
        type === "traits" ? setCharacteristicsDB : setAssimilationsDB;
      const res = await axios.get(
        `https://assrpgsite-be-production.up.railway.app/api/${url}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
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

  const getSkillColor = (key) => {
    // Normalização para lowerCase para garantir match
    const k = key.toLowerCase();

    // Conhecimento = Azulão / Cyan
    if (knowledgeKeys.includes(k)) return "3px solid #00b0ff";

    // Prática = Laranja / Amarelo
    if (practiceKeys.includes(k)) return "3px solid #ff9100";

    // Padrão (sem match) = Cinza
    return "3px solid #444";
  };

  const getSkillTypeLabel = (key) => {
    const k = key.toLowerCase();
    if (knowledgeKeys.includes(k)) return "CONHECIMENTO";
    if (practiceKeys.includes(k)) return "PRÁTICA";
    return "";
  };

  // HANDLERS E SAVE
  const saveInventory = async (newCharState) => {
    try {
      await axios.put(
        `https://assrpgsite-be-production.up.railway.app/api/characters/${id}/inventory`,
        {
          inventory: newCharState.inventory,
          notes: notes,
          characteristics: newCharState.characteristics,
          assimilations: newCharState.assimilations,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
    } catch (err) {
      console.error("Erro ao salvar backend", err);
    }
  };

  const handleInputChange = (field, val) => {
    setCharacter((prev) => ({ ...prev, [field]: val }));
    axios.put(
      `https://assrpgsite-be-production.up.railway.app/api/characters/${id}/details`,
      { [field]: val },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("avatar", file);
      try {
        const res = await axios.put(
          `https://assrpgsite-be-production.up.railway.app/api/characters/${id}/avatar`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.data.character) setCharacter(res.data.character);
      } catch (err) {
        alert("Erro ao subir imagem.");
      }
    }
  };

  const togglePrivacy = async () => {
    try {
      const newVal = !character.isPrivate;
      // Usamos a mesma URL de "details" que você já tem no projeto
      await axios.put(
        `https://assrpgsite-be-production.up.railway.app/api/characters/${id}/details`,
        { isPrivate: newVal },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Atualiza o estado local para o botão refletir a mudança na hora
      setCharacter({ ...character, isPrivate: newVal });
    } catch (err) {
      console.error("Erro ao mudar privacidade", err);
      alert("Falha ao atualizar privacidade.");
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
    const updatedInv = [
      ...(character.inventory || []),
      {
        quantity: 1,
        quality: 3,
        slotLocation: "mochila",
        currentUses: 0,
        itemData: {
          originalItemId: item._id,
          name: item.name,
          type: item.type,
          category: item.category,
          icon: item.icon || "", 
          slots: item.slots,
          modifiers: item.modifiers || [],
          description: item.description,
          characteristics: item.characteristics,
          isArtefato: item.isArtefato,
          isConsumable: item.isConsumable,
          resourceType: item.resourceType,
        },
      },
    ];
    const newState = { ...character, inventory: updatedInv };
    setCharacter(newState);
    saveInventory(newState);
    setItemsModalOpen(false);
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
  };

  const handleHealthChange = (index, value) => {
    const updatedLevels = [...character.healthLevels];
    updatedLevels[index] = value || 0;
    const currentLevel = 6 - index;
    setCharacter((prev) => ({
      ...prev,
      healthLevels: updatedLevels,
      currentHealthLevel: currentLevel,
    }));
    axios.put(
      `https://assrpgsite-be-production.up.railway.app/api/characters/${id}/health`,
      { healthLevels: updatedLevels, currentHealthLevel: currentLevel },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
  };

  // Roll Utils
  const addRollToHistory = async (rollData, display = false) => {
    const entry = {
      ...rollData,
      rollerName: character.name,
      timestamp: Date.now(),
    };
    setRollHistory((prev) => [...prev, entry].slice(-20));

    const token = localStorage.getItem("token");
    axios.put(
      `https://assrpgsite-be-production.up.railway.app/api/characters/${id}/last-roll`,
      { lastRoll: entry },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (character.campaign) {
      axios.post(
        `https://assrpgsite-be-production.up.railway.app/api/campaigns/${character.campaign}/roll`,
        { ...entry, rollerId: user?._id, characterId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
    if (display) {
      setLastCustomRoll(rollData);
      setCustomToastOpen(true);
    }
  };

  const handleCustomRoll = () => {
    if (!customDiceFormula) return;
    const res = rollCustomDice(customDiceFormula);
    addRollToHistory({ formula: customDiceFormula, roll: res }, true);
  };

  const handleInstinctChange = (key, val) =>
    setSelectedInstinct((prev) => ({ ...prev, [key]: val }));
  const handleAssimilatedRoll = (k1, k2) => {
    if (!k2) {
      alert("Combine!");
      return;
    }
    const total = (instincts[k1] || 0) + (instincts[k2] || 0);
    const res = rollCustomDice(`${total}d12`);
    addRollToHistory(
      {
        skill: `Assimilação: ${translateKey(k1)}+${translateKey(k2)}`,
        roll: res,
      },
      true
    );
  };

  // Render
  if (error)
    return (
      <div className={styles.loaderBox}>
        <h2 style={{ color: "red" }}>{error}</h2>
      </div>
    );
  if (!character)
    return (
      <div className={styles.loaderBox}>
        <div className="spinner"></div>Carregando Sistema...
      </div>
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
            <label htmlFor="avatar-upload" className={styles.avatarEditOverlay}>
              <PhotoCameraIcon style={{ color: "white", fontSize: 30 }} />
            </label>
            <input
              id="avatar-upload"
              type="file"
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
                <span className={styles.label} style={{ color: "#a87575" }}>
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
                <span className={styles.label} style={{ color: "#a87575" }}>
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
                <span className={styles.label} style={{ color: "#758ca8" }}>
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
                <span className={styles.label} style={{ color: "#758ca8" }}>
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
              id={id}
            />
            <div
              style={{
                marginTop: 30,
                borderTop: "2px solid #222",
                paddingTop: 20,
              }}
            >
              <h3 className={styles.sectionTitle}>Status Vital</h3>
              {character.healthLevels.map((val, idx) => {
                const level = 6 - idx;
                const info = healthLevelDetails[level];
                const max =
                  1 +
                  (character.instincts?.potency || 0) +
                  (character.instincts?.resolution || 0);
                return (
                  <div key={level} className={styles.healthRow}>
                    <div
                      className={styles.healthHeader}
                      onClick={() => {
                        setSelectedHealthInfo(info);
                        setHealthModalOpen(true);
                      }}
                    >
                      <span
                        className={`${styles.healthName} ${
                          character.currentHealthLevel === level
                            ? styles.healthNameActive
                            : ""
                        }`}
                      >
                        {info.name}
                      </span>
                      <span style={{ fontSize: "0.8em", color: "#666" }}>
                        {val} / {max}
                      </span>
                    </div>
                    <div className={styles.heartContainer}>
                      {[...Array(max)].map((_, i) => (
                        <div
                          key={i}
                          className={styles.heartIcon}
                          onClick={() => handleHealthChange(idx, i + 1)}
                        >
                          {i < val ? (
                            <HeartFullIcon
                              width={22}
                              height={22}
                              style={{ fill: "#b71c1c" }}
                            />
                          ) : (
                            <HeartEmptyIcon
                              width={22}
                              height={22}
                              style={{ fill: "#222" }}
                            />
                          )}
                        </div>
                      ))}
                      <div
                        className={styles.heartIcon}
                        onClick={() => handleHealthChange(idx, 0)}
                        style={{ marginLeft: "auto" }}
                      >
                        <DeleteIcon style={{ fontSize: 16, color: "#444" }} />
                      </div>
                    </div>
                  </div>
                );
              })}
              <TugOfWar character={character} setCharacter={setCharacter} />
            </div>
          </div>

          <div className={styles.colCenter}>
            <SkillList
              title="Conhecimentos & Práticas"
              id={id}
              character={character}
              addRollToHistory={addRollToHistory}
            />
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
                        {c.description}
                      </div>
                    </div>
                    <DeleteIcon
                      onClick={() => handleDeleteItem(i, "trait")}
                      style={{ cursor: "pointer", color: "#aaa" }}
                    />
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
                        {c.description}
                      </div>
                    </div>
                    <DeleteIcon
                      onClick={() => handleDeleteItem(i, "assimilations")}
                      style={{ cursor: "pointer", color: "#aaa" }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <CustomModal
        open={healthModalOpen}
        onClose={() => setHealthModalOpen(false)}
        title={selectedHealthInfo.name}
      >
        <p>{selectedHealthInfo.description}</p>
      </CustomModal>
      <CustomToast
        open={customToastOpen}
        rollResult={null}
        customRollResult={lastCustomRoll}
        onClose={() => setCustomToastOpen(false)}
      />

      {/* Envolva os modais existentes no final do arquivo com o ReactDOM.createPortal */}
      {ReactDOM.createPortal(
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
        </>,
        document.body
      )}
      {/* --- INICIO DA ÁREA FLUTUANTE (PORTAL) --- */}
      {ReactDOM.createPortal(
        <>
          {/* Botão de Histórico (Fixo) */}
          <button
            className={styles.fabHistory}
            onClick={() => setHistoryOpen(!historyOpen)}
            style={{ zIndex: 99999 }}
            title={historyOpen ? "Fechar Histórico" : "Abrir Histórico"}
          >
            {historyOpen ? (
              <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>×</span>
            ) : (
              <HistoryIcon />
            )}
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
                    <div key={i} className={styles.historyItem}>
                      {/* Título e Hora */}
                      <div className={styles.histTopRow}>
                        <span
                          className={styles.histSkillName}
                          title={h.skill ? translateKey(h.skill) : h.formula}
                        >
                          {h.skill
                            ? translateKey(h.skill)
                            : h.formula || "Rolagem Manual"}
                        </span>
                        <span className={styles.histTime}>
                          {new Date(h.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Dados */}
                      <div className={styles.histDiceGrid}>
                        {h.roll.map((die, idx) => (
                          <div key={idx} className={styles.histDie}>
                            <span className={styles.histDieType}>
                              d{die.sides}
                            </span>
                            <div className={styles.histDieVal}>
                              {/* Lógica: Se tem array de imagens, mostra imagens. Senão mostra número. */}
                              {die.result && die.result.length > 0 ? (
                                die.result.map((src, imgI) => (
                                  <img
                                    key={imgI}
                                    src={src}
                                    alt="dado"
                                    className={styles.histImg}
                                  />
                                ))
                              ) : (
                                <span>{die.face}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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
