/* RefugeDashboard.js */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaArrowLeft,
  FaCrosshairs,
  FaEdit,
  FaExclamationTriangle,
  FaFirstAid,
  FaGasPump,
  FaGem,
  FaHistory,
  FaLeaf,
  FaMapMarkerAlt,
  FaMinus,
  FaPaw,
  FaPlus,
  FaSave,
  FaSeedling,
  FaSkull,
  FaTint,
  FaTools,
  FaTrash,
  FaTree,
  FaTshirt,
  FaUserAstronaut,
  FaUsers,
  FaUtensils,
} from "react-icons/fa";
import "./RefugeDashboard.css";
import { dispatchToast } from "../components/notifications/ToastProvider";
import { useConfirm } from "../components/notifications/ConfirmProvider";
import PageLoader from "../components/ui/PageLoader";
import EmptyState from "../components/ui/EmptyState";
import InlineLoader from "../components/ui/InlineLoader";
import api from "../api";

const DEFAULT_REFUGE_IMAGE =
  "https://images.unsplash.com/photo-1590625321528-724dc0f3689f?q=80&w=1200&auto=format&fit=crop";

const resourceIcons = {
  water: <FaTint style={{ color: "#4fc3f7" }} />,
  plants: <FaLeaf style={{ color: "#66bb6a" }} />,
  animals: <FaPaw style={{ color: "#ffb74d" }} />,
  wood: <FaTree style={{ color: "#8d6e63" }} />,
  minerals: <FaGem style={{ color: "#b0bec5" }} />,
  biomass: <FaSeedling style={{ color: "#aed581" }} />,
  food: <FaUtensils style={{ color: "#ff7043" }} />,
  clothing: <FaTshirt style={{ color: "#ce93d8" }} />,
  fuel: <FaGasPump style={{ color: "#ffca28" }} />,
  ammo: <FaCrosshairs style={{ color: "#ef5350" }} />,
  meds: <FaFirstAid style={{ color: "#f06292" }} />,
  construction: <FaTools style={{ color: "#8d6e63" }} />,
};

const resourceLabels = {
  water: "Água",
  plants: "Plantas",
  animals: "Animais",
  wood: "Madeira",
  minerals: "Minerais",
  biomass: "Biomassa",
  food: "Alimento",
  clothing: "Vestuário",
  fuel: "Combustível",
  ammo: "Munição",
  meds: "Remédios",
  construction: "Mat. Construção",
};

const buildingTemplates = [
  {
    name: "Dormitório",
    type: "Habitação",
    cost: 20,
    description: "Aumenta o máximo de população.",
    effect: { type: "popMax", value: 2 },
  },
  {
    name: "Fonte de Água",
    type: "Recurso",
    cost: 15,
    description: "Água infinita, sem gastar estoque.",
    effect: { type: "waterSource" },
  },
  {
    name: "Despensa/Celeiro",
    type: "Armazenamento",
    cost: 10,
    description: "Aumenta o teto de reservas em +5.",
    effect: { type: "reserves", value: 5 },
  },
  {
    name: "Fortificação",
    type: "Defesa",
    cost: 10,
    description: "+1 nível de defesa.",
    effect: { type: "defense", value: 1 },
  },
  {
    name: "Enfermaria",
    type: "Recurso",
    cost: 15,
    description: "Ajuda na recuperação de crises de saúde.",
    effect: { type: "health" },
  },
  {
    name: "Oficina",
    type: "Produção",
    cost: 10,
    description: "Permite criar itens.",
    effect: { type: "craft" },
  },
];

const tabs = ["RECURSOS", "CONSTRUÇÕES", "HABITANTES", "SALA DE GUERRA", "HISTÓRICO"];
const npcHealthOptions = ["Saudável", "Ferido", "Doente", "Crítico", "Ausente"];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const calculateRefugeLimits = (currentRefuge) => {
  if (!currentRefuge) return { maxPop: 2, maxReserves: 10 };

  let maxPop = 2;
  let maxReserves = 10;

  (currentRefuge.structures || []).forEach((structure) => {
    const template = buildingTemplates.find((item) => item.name === structure.name) || structure;
    const structureName = structure.name?.toLowerCase() || "";

    if (template.effect?.type === "popMax") maxPop += template.effect.value || 0;
    if (template.effect?.type === "reserves") maxReserves += template.effect.value || 0;
    if (structureName.includes("dormitório")) maxPop += 1;
    if (structureName.includes("armazém") || structureName.includes("despensa")) maxReserves += 5;
  });

  return { maxPop, maxReserves };
};

const RefugeDashboard = () => {
  const { id: campaignId, refugeId } = useParams();
  const { token } = useSelector((state) => state.auth);
  const { confirm } = useConfirm();

  const [refuge, setRefuge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [isMaster, setIsMaster] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editData, setEditData] = useState({ name: "", location: "", description: "" });
  const [newStructure, setNewStructure] = useState({
    name: "",
    type: "Geral",
    description: "",
    cost: 10,
  });
  const [newNpc, setNewNpc] = useState({ name: "", role: "", health: "Saudável", notes: "" });
  const [newThreat, setNewThreat] = useState({ name: "", description: "", maxLevel: 4 });
  const [newProject, setNewProject] = useState({ name: "", description: "", cost: 10 });

  const { maxPop, maxReserves } = useMemo(() => calculateRefugeLimits(refuge), [refuge]);

  const fetchRefugeList = useCallback(async () => {
    const res = await api.get(`/refuge/campaign/${campaignId}/refuges`);
    return res.data || [];
  }, [campaignId]);

  const fetchRefuge = useCallback(async (targetRefugeId = "") => {
    if (!token) return null;

    try {
      const query = targetRefugeId ? `?refugeId=${targetRefugeId}` : "";
      const res = await api.get(`/refuge/campaign/${campaignId}${query}`);
      setRefuge(res.data);
      setIsMaster(true);
      return res.data;
    } catch (error) {
      console.error(error);
      dispatchToast({ message: "Erro ao carregar dados do refúgio.", type: "error" });
      return null;
    }
  }, [campaignId, token]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) return;

      try {
        setLoading(true);
        let list = await fetchRefugeList();

        if (!list.length) {
          const createdDefault = await fetchRefuge();
          if (createdDefault?._id) list = await fetchRefugeList();
        }

        const activeId = refugeId && list.some((item) => item._id === refugeId)
          ? refugeId
          : list[0]?._id;

        if (activeId) {
          await fetchRefuge(activeId);
        } else {
          setRefuge(null);
        }
      } catch (error) {
        console.error(error);
        dispatchToast({ message: "Erro ao preparar o painel do refúgio.", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [fetchRefuge, fetchRefugeList, refugeId, token]);

  const saveRefugeUpdate = async (updatedData, successMessage = "") => {
    const previousRefuge = refuge;

    try {
      setSaving(true);
      setRefuge(updatedData);
      await api.put(`/refuge/${updatedData._id}`, updatedData);

      if (successMessage) {
        dispatchToast({ message: successMessage, type: "success" });
      }
    } catch (error) {
      console.error(error);
      setRefuge(previousRefuge);
      dispatchToast({ message: "Erro ao salvar no servidor.", type: "error" });
      await fetchRefuge(updatedData._id);
    } finally {
      setSaving(false);
    }
  };

  const handleStatChange = (statName, amount) => {
    if (!refuge || saving) return;
    const stats = { ...refuge.stats, population: { ...refuge.stats.population } };

    if (statName === "population") {
      stats.population.current = clamp((stats.population.current || 0) + amount, 0, maxPop);
    } else {
      stats[statName] = clamp((stats[statName] || 0) + amount, 0, 6);
    }

    saveRefugeUpdate({ ...refuge, stats });
  };

  const handleResourceChange = (category, type, amount) => {
    if (!refuge || saving) return;

    const resources = {
      ...refuge.resources,
      [category]: {
        ...refuge.resources[category],
        [type]: { ...refuge.resources[category][type] },
      },
    };

    const currentValue = resources[category][type].level || 0;
    resources[category][type].level = clamp(currentValue + amount, 0, maxReserves);
    saveRefugeUpdate({ ...refuge, resources });
  };

  const handlePassCycle = async () => {
    const confirmed = await confirm({
      title: "Encerrar semana",
      message: "Encerrar a semana vai consumir recursos e avançar todos os efeitos do refúgio.",
      tone: "warning",
      confirmLabel: "Encerrar semana",
    });
    if (!confirmed) return;

    try {
      setSaving(true);
      const res = await api.post(`/refuge/${refuge._id}/cycle`, {});
      setRefuge(res.data);
      dispatchToast({ message: `Ciclo ${res.data.currentCycle} iniciado.`, type: "success" });
    } catch (error) {
      dispatchToast({ message: "Erro ao processar ciclo.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleAddStructureProject = () => {
    if (!newStructure.name.trim()) {
      dispatchToast({ message: "Escolha ou informe uma construção.", type: "warning" });
      return;
    }

    const template = buildingTemplates.find((item) => item.name === newStructure.name);
    const project = {
      name: `Construir ${newStructure.name}`,
      description: newStructure.description,
      cost: Math.max(Number(newStructure.cost) || 1, 1),
      progress: 0,
      linkedBuilding: {
        name: newStructure.name,
        type: newStructure.type,
        description: newStructure.description,
        effect: template ? template.effect : null,
      },
    };

    saveRefugeUpdate(
      { ...refuge, activeProjects: [...(refuge.activeProjects || []), project] },
      "Projeto iniciado na Sala de Guerra."
    );
    setModalType(null);
  };

  const handleProjectProgress = (index, amount) => {
    if (!refuge || saving) return;

    const activeProjects = [...(refuge.activeProjects || [])];
    const project = { ...activeProjects[index] };
    project.progress = clamp((project.progress || 0) + amount, 0, project.cost || 1);
    activeProjects[index] = project;

    if (project.progress >= project.cost) {
      const updatedRefuge = {
        ...refuge,
        activeProjects: activeProjects.filter((_, projectIndex) => projectIndex !== index),
      };

      if (project.linkedBuilding) {
        updatedRefuge.structures = [...(refuge.structures || []), project.linkedBuilding];
        if (project.linkedBuilding.effect?.type === "defense") {
          updatedRefuge.stats = {
            ...refuge.stats,
            defense: clamp((refuge.stats.defense || 0) + project.linkedBuilding.effect.value, 0, 6),
          };
        }
        saveRefugeUpdate(updatedRefuge, "Construção concluída.");
        return;
      }

      saveRefugeUpdate(updatedRefuge, "Projeto finalizado.");
      return;
    }

    saveRefugeUpdate({ ...refuge, activeProjects });
  };

  const handleAddNpc = () => {
    if (!newNpc.name.trim()) {
      dispatchToast({ message: "Informe o nome do habitante.", type: "warning" });
      return;
    }

    const populationList = [
      ...(refuge.populationList || []),
      { ...newNpc, health: newNpc.health || "Saudável" },
    ];

    saveRefugeUpdate({ ...refuge, populationList }, "Habitante registrado.");
    setNewNpc({ name: "", role: "", health: "Saudável", notes: "" });
    setModalType(null);
  };

  const handleNpcHealthChange = (index, health) => {
    if (!refuge || saving) return;

    const populationList = [...(refuge.populationList || [])];
    populationList[index] = { ...populationList[index], health };
    saveRefugeUpdate({ ...refuge, populationList }, "Estado do habitante atualizado.");
  };

  const handleAddThreat = () => {
    if (!newThreat.name.trim()) {
      dispatchToast({ message: "Informe o nome da ameaça.", type: "warning" });
      return;
    }

    const activeThreats = [
      ...(refuge.activeThreats || []),
      { ...newThreat, maxLevel: Math.max(Number(newThreat.maxLevel) || 1, 1), level: 0 },
    ];

    saveRefugeUpdate({ ...refuge, activeThreats }, "Ameaça registrada.");
    setNewThreat({ name: "", description: "", maxLevel: 4 });
    setModalType(null);
  };

  const handleThreatProgress = (index, amount) => {
    if (!refuge || saving) return;

    const activeThreats = [...(refuge.activeThreats || [])];
    const threat = { ...activeThreats[index] };
    threat.level = clamp((threat.level || 0) + amount, 0, threat.maxLevel || 1);
    activeThreats[index] = threat;

    saveRefugeUpdate({ ...refuge, activeThreats });
  };

  const handleAddProject = () => {
    if (!newProject.name.trim()) {
      dispatchToast({ message: "Informe o nome do projeto.", type: "warning" });
      return;
    }

    const activeProjects = [
      ...(refuge.activeProjects || []),
      { ...newProject, cost: Math.max(Number(newProject.cost) || 1, 1), progress: 0 },
    ];

    saveRefugeUpdate({ ...refuge, activeProjects }, "Projeto iniciado.");
    setNewProject({ name: "", description: "", cost: 10 });
    setModalType(null);
  };

  const handleDeleteItem = async (listName, index) => {
    const confirmed = await confirm({
      title: "Excluir registro",
      message: "Deseja excluir este registro do refúgio?",
      tone: "danger",
      confirmLabel: "Excluir",
    });
    if (!confirmed) return;

    const updatedList = (refuge[listName] || []).filter((_, itemIndex) => itemIndex !== index);
    saveRefugeUpdate({ ...refuge, [listName]: updatedList }, "Registro removido.");
  };

  const handleSaveEdit = () => {
    if (!editData.name?.trim()) {
      dispatchToast({ message: "O refúgio precisa ter um nome.", type: "warning" });
      return;
    }

    saveRefugeUpdate({ ...refuge, ...editData }, "Refúgio atualizado.");
    setModalType(null);
  };

  const openEditModal = () => {
    setEditData({
      name: refuge.name || "",
      location: refuge.location || "",
      description: refuge.description || "",
    });
    setModalType("edit");
  };

  const handleTemplateChange = (event) => {
    const template = buildingTemplates.find((item) => item.name === event.target.value);
    if (!template) return;

    setNewStructure({
      name: template.name,
      type: template.type,
      description: template.description,
      cost: template.cost,
    });
  };

  const renderResourceSection = (title, category, resources = {}) => (
    <section className="refuge-section">
      <div className="section-heading">
        <h3>{title}</h3>
        <span>Teto: {maxReserves}</span>
      </div>
      <div className="resource-grid">
        {Object.entries(resources).map(([key, value]) => (
          <div key={key} className="resource-card">
            <span className="res-icon">{resourceIcons[key]}</span>
            <span className="res-name">{resourceLabels[key] || key}</span>
            <div className="res-control">
              <button className="btn-stat-mini" disabled={saving} onClick={() => handleResourceChange(category, key, -1)}>
                <FaMinus />
              </button>
              <span className="res-val">{value.level || 0}</span>
              <button className="btn-stat-mini" disabled={saving} onClick={() => handleResourceChange(category, key, 1)}>
                <FaPlus />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderEmptyState = (title, description, action = null) => (
    <div className="refuge-empty-inline">
      <EmptyState title={title} description={description} action={action} />
    </div>
  );

  if (loading) {
    return <PageLoader title="Carregando base" subtitle="Atualizando recursos, estruturas e ameaças..." />;
  }

  if (!refuge) {
    return (
      <div className="refuge-container">
        <div className="refuge-panel refuge-missing-panel">
          <EmptyState
            title="Dados inacessíveis"
            description="Não foi possível abrir este refúgio. Volte ao lobby e tente novamente."
            action={<Link to={`/campaign/${campaignId}/refuges`} className="btn-nero btn-primary">Voltar aos refúgios</Link>}
          />
        </div>
      </div>
    );
  }

  const stats = [
    { label: "POPULAÇÃO", value: refuge.stats?.population?.current || 0, key: "population", limit: maxPop },
    { label: "MORAL", value: refuge.stats?.morale || 0, key: "morale", type: "morale", limit: 6 },
    { label: "DEFESA", value: refuge.stats?.defense || 0, key: "defense", type: "defense", limit: 6 },
    { label: "MOBILIDADE", value: refuge.stats?.mobility || 0, key: "mobility", limit: 6 },
    { label: "BELIGERÂNCIA", value: refuge.stats?.belligerence || 0, key: "belligerence", type: "danger", limit: 6 },
    { label: "TETO RESERVAS", value: maxReserves },
  ];
  const playerCount = (refuge.playerCharacters || []).length;
  const npcCount = (refuge.populationList || []).length;
  const totalResidents = playerCount + npcCount;
  const populationCapacity = maxPop * 10;

  return (
    <div className="refuge-container">
      <div className="refuge-panel">
        <div className="refuge-header" style={{ backgroundImage: `url(${refuge.image || DEFAULT_REFUGE_IMAGE})` }}>
          <div className="header-content">
            <div className="refuge-heading-block">
              <Link to={`/campaign/${campaignId}/refuges`} className="btn-nero btn-back">
                <FaArrowLeft /> Voltar
              </Link>
              <h1 className="refuge-title">{refuge.name}</h1>
              <div className="refuge-location">
                <FaMapMarkerAlt /> {refuge.location || "Localização desconhecida"}
                <span className="cycle-badge">CICLO {refuge.currentCycle || 1}</span>
              </div>
              {refuge.description && <p className="refuge-description">{refuge.description}</p>}
            </div>

            <div className="refuge-header-actions">
              {saving && (
                <span className="saving-pill">
                  <InlineLoader label="Salvando" />
                </span>
              )}
              {isMaster && (
                <button className="btn-nero btn-danger-action" disabled={saving} onClick={handlePassCycle}>
                  <FaExclamationTriangle /> Passar ciclo
                </button>
              )}
              {isMaster && (
                <button className="btn-nero btn-secondary" disabled={saving} onClick={openEditModal}>
                  <FaEdit /> Editar
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="stats-bar">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-box">
              <span className="stat-label">{stat.label}</span>
              <div className="stat-value-container">
                {stat.key && (
                  <button className="btn-stat-mini" disabled={saving} onClick={() => handleStatChange(stat.key, -1)}>
                    <FaMinus size={10} />
                  </button>
                )}
                <span className={`stat-value ${stat.type || ""}`}>{stat.value}</span>
                {stat.limit && <span className="stat-limit">/{stat.limit}</span>}
                {stat.key && (
                  <button className="btn-stat-mini" disabled={saving} onClick={() => handleStatChange(stat.key, 1)}>
                    <FaPlus size={10} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="refuge-tabs">
          {tabs.map((label, index) => (
            <button
              key={label}
              className={`refuge-tab ${activeTab === index ? "active" : ""}`}
              onClick={() => setActiveTab(index)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {activeTab === 0 && (
            <>
              {renderResourceSection("Recursos naturais", "natural", refuge.resources?.natural)}
              {renderResourceSection("Recursos manufaturados", "manufactured", refuge.resources?.manufactured)}
            </>
          )}

          {activeTab === 1 && (
            <section className="refuge-section">
              <div className="tab-toolbar">
                <div className="section-heading">
                  <h3>Construções</h3>
                  <span>{(refuge.structures || []).length} estruturas</span>
                </div>
                <button className="btn-nero btn-primary" onClick={() => setModalType("structure")}>
                  <FaPlus /> Iniciar projeto
                </button>
              </div>

              {(refuge.structures || []).length === 0 ? (
                renderEmptyState(
                  "Nenhuma construção pronta",
                  "Inicie um projeto para transformar recursos em estruturas permanentes.",
                  <button className="btn-nero btn-primary" onClick={() => setModalType("structure")}>
                    <FaPlus /> Iniciar construção
                  </button>
                )
              ) : (
                <div className="build-grid">
                  {(refuge.structures || []).map((structure, index) => (
                    <article key={`${structure.name}-${index}`} className="build-card">
                      <button className="btn-icon-danger" onClick={() => handleDeleteItem("structures", index)}>
                        <FaTrash />
                      </button>
                      <h4>{structure.name}</h4>
                      <span className="type">{structure.type || "Geral"}</span>
                      <p>{structure.description || "Sem descrição registrada."}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 2 && (
            <section className="refuge-section">
              <div className="tab-toolbar">
                <div className="section-heading">
                  <h3>Habitantes</h3>
                  <span>{totalResidents} registros</span>
                </div>
                <button className="btn-nero btn-primary" onClick={() => setModalType("npc")}>
                  <FaPlus /> Novo NPC
                </button>
              </div>

              <div className="population-summary">
                <div>
                  <strong>{playerCount}</strong>
                  <span>Jogadores</span>
                </div>
                <div>
                  <strong>{npcCount}</strong>
                  <span>NPCs</span>
                </div>
                <div>
                  <strong>{refuge.stats?.population?.current || 0}/{maxPop}</strong>
                  <span>Nível populacional</span>
                </div>
                <div>
                  <strong>{populationCapacity}</strong>
                  <span>Capacidade estimada</span>
                </div>
              </div>

              <div className="population-grid">
                <div className="population-panel">
                  <h4><FaUserAstronaut /> Jogadores</h4>
                  {(refuge.playerCharacters || []).length === 0 ? (
                    <p className="muted-text">Nenhum personagem de jogador vinculado à campanha.</p>
                  ) : (
                    refuge.playerCharacters.map((player) => (
                      <div key={player._id} className="person-row">
                        <div>
                          <strong>{player.name}</strong>
                          <span>{player.role || player.occupation || "Sem função"} · {player.health || "Saudável"}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="population-panel">
                  <h4><FaUsers /> NPCs do refúgio</h4>
                  {(refuge.populationList || []).length === 0 ? (
                    <div className="compact-empty">
                      <p>Nenhum NPC registrado.</p>
                      <button className="btn-nero btn-secondary" onClick={() => setModalType("npc")}>
                        <FaPlus /> Adicionar
                      </button>
                    </div>
                  ) : (
                    refuge.populationList.map((npc, index) => (
                      <div key={`${npc.name}-${index}`} className="person-card">
                        <div className="person-card-main">
                          <div>
                            <strong>{npc.name}</strong>
                            <span>{npc.role || "Sem função"}</span>
                          </div>
                          <select
                            className="npc-health-select"
                            value={npc.health || "Saudável"}
                            disabled={saving}
                            onChange={(event) => handleNpcHealthChange(index, event.target.value)}
                          >
                            {npcHealthOptions.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        {npc.notes && <p>{npc.notes}</p>}
                        <div className="person-card-footer">
                          <span className={`health-chip health-${(npc.health || "saudavel").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}>
                            {npc.health || "Saudável"}
                          </span>
                          <button className="btn-icon-danger inline" onClick={() => handleDeleteItem("populationList", index)}>
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          )}

          {activeTab === 3 && (
            <section className="war-room-grid">
              <div className="war-panel">
                <div className="tab-toolbar">
                  <div className="section-heading danger-title">
                    <h3><FaSkull /> Ameaças</h3>
                    <span>{(refuge.activeThreats || []).length} ativas</span>
                  </div>
                  <button className="btn-nero btn-secondary" onClick={() => setModalType("threat")}>
                    <FaPlus /> Nova
                  </button>
                </div>

                {(refuge.activeThreats || []).length === 0 ? (
                  renderEmptyState("Sem ameaças ativas", "Registre relógios de perigo para acompanhar pressão sobre a base.")
                ) : (
                  refuge.activeThreats.map((threat, index) => (
                    <article key={`${threat.name}-${index}`} className="threat-card">
                      <button className="btn-icon-danger" onClick={() => handleDeleteItem("activeThreats", index)}>
                        <FaTrash />
                      </button>
                      <div className="threat-title">{threat.name}</div>
                      <div className="threat-desc">{threat.description || "Sem descrição registrada."}</div>
                      <div className="progress-row">
                        <button className="btn-stat-mini" disabled={saving} onClick={() => handleThreatProgress(index, -1)}>
                          <FaMinus />
                        </button>
                        <div className="nero-progress">
                          <div className="nero-bar red" style={{ width: `${((threat.level || 0) / (threat.maxLevel || 1)) * 100}%` }} />
                        </div>
                        <button className="btn-stat-mini" disabled={saving} onClick={() => handleThreatProgress(index, 1)}>
                          <FaPlus />
                        </button>
                      </div>
                      <div className="progress-meta">{threat.level || 0}/{threat.maxLevel || 1}</div>
                    </article>
                  ))
                )}
              </div>

              <div className="war-panel">
                <div className="tab-toolbar">
                  <div className="section-heading project-title">
                    <h3><FaTools /> Projetos</h3>
                    <span>{(refuge.activeProjects || []).length} em andamento</span>
                  </div>
                  <button className="btn-nero btn-secondary" onClick={() => setModalType("project")}>
                    <FaPlus /> Novo
                  </button>
                </div>

                {(refuge.activeProjects || []).length === 0 ? (
                  renderEmptyState("Nenhum projeto em andamento", "Projetos livres e construções aparecerão aqui até serem concluídos.")
                ) : (
                  refuge.activeProjects.map((project, index) => (
                    <article key={`${project.name}-${index}`} className="build-card project-card">
                      <button className="btn-icon-danger" onClick={() => handleDeleteItem("activeProjects", index)}>
                        <FaTrash />
                      </button>
                      <h4>{project.name}</h4>
                      <p>{project.description || "Sem descrição registrada."}</p>
                      <div className="progress-row">
                        <button className="btn-stat-mini" disabled={saving} onClick={() => handleProjectProgress(index, -1)}>
                          <FaMinus />
                        </button>
                        <div className="nero-progress">
                          <div className="nero-bar blue" style={{ width: `${((project.progress || 0) / (project.cost || 1)) * 100}%` }} />
                        </div>
                        <button className="btn-stat-mini" disabled={saving} onClick={() => handleProjectProgress(index, 1)}>
                          <FaPlus />
                        </button>
                      </div>
                      <div className="progress-meta">{project.progress || 0}/{project.cost || 1}</div>
                    </article>
                  ))
                )}
              </div>
            </section>
          )}

          {activeTab === 4 && (
            <section className="refuge-section">
              <div className="section-heading">
                <h3><FaHistory /> Histórico</h3>
                <span>{(refuge.logs || []).length} registros</span>
              </div>

              {(refuge.logs || []).length === 0 ? (
                renderEmptyState("Nenhum ciclo registrado", "Quando semanas forem encerradas, os eventos do refúgio aparecerão aqui.")
              ) : (
                <div className="log-list">
                  {(refuge.logs || []).map((log, index) => (
                    <div key={`${log.timestamp}-${index}`} className={`log-item ${log.type || ""}`}>
                      <span className="log-time">{log.timestamp ? new Date(log.timestamp).toLocaleDateString() : ""}</span>
                      <strong>CICLO {log.cycle || "-"}</strong> {log.message}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {modalType === "edit" && (
        <div className="nero-modal-overlay" onClick={() => setModalType(null)}>
          <div className="nero-modal" onClick={(event) => event.stopPropagation()}>
            <div className="nero-modal-header">Editar refúgio</div>
            <div className="nero-modal-body">
              <div className="form-group">
                <label>Nome</label>
                <input className="nero-input" value={editData.name} onChange={(event) => setEditData({ ...editData, name: event.target.value })} />
              </div>
              <div className="form-group">
                <label>Localização</label>
                <input className="nero-input" value={editData.location} onChange={(event) => setEditData({ ...editData, location: event.target.value })} />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea className="nero-textarea" rows="4" value={editData.description} onChange={(event) => setEditData({ ...editData, description: event.target.value })} />
              </div>
            </div>
            <div className="nero-modal-footer">
              <button className="btn-nero" onClick={() => setModalType(null)}>Cancelar</button>
              <button className="btn-nero btn-primary" disabled={saving} onClick={handleSaveEdit}><FaSave /> Salvar</button>
            </div>
          </div>
        </div>
      )}

      {modalType === "structure" && (
        <div className="nero-modal-overlay" onClick={() => setModalType(null)}>
          <div className="nero-modal" onClick={(event) => event.stopPropagation()}>
            <div className="nero-modal-header">Iniciar construção</div>
            <div className="nero-modal-body">
              <div className="form-group">
                <label>Modelo</label>
                <select className="nero-select" onChange={handleTemplateChange}>
                  <option value="">Selecionar modelo</option>
                  {buildingTemplates.map((template) => (
                    <option key={template.name} value={template.name}>{template.name} (Custo: {template.cost})</option>
                  ))}
                </select>
                <span className="field-hint">Escolha um modelo para preencher nome, tipo, custo e descrição.</span>
              </div>
              <div className="form-group">
                <label>Nome</label>
                <input className="nero-input" value={newStructure.name} onChange={(event) => setNewStructure({ ...newStructure, name: event.target.value })} />
              </div>
              <div className="form-group">
                <label>Tipo</label>
                <select className="nero-select" value={newStructure.type} onChange={(event) => setNewStructure({ ...newStructure, type: event.target.value })}>
                  <option>Geral</option>
                  <option>Habitação</option>
                  <option>Recurso</option>
                  <option>Defesa</option>
                  <option>Armazenamento</option>
                  <option>Produção</option>
                </select>
              </div>
              <div className="form-group">
                <label>Custo</label>
                <input type="number" min="1" className="nero-input" value={newStructure.cost} onChange={(event) => setNewStructure({ ...newStructure, cost: Number(event.target.value) })} />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea className="nero-textarea" rows="3" value={newStructure.description} onChange={(event) => setNewStructure({ ...newStructure, description: event.target.value })} />
              </div>
            </div>
            <div className="nero-modal-footer">
              <button className="btn-nero" onClick={() => setModalType(null)}>Cancelar</button>
              <button className="btn-nero btn-primary" disabled={saving} onClick={handleAddStructureProject}>Iniciar</button>
            </div>
          </div>
        </div>
      )}

      {modalType === "npc" && (
        <div className="nero-modal-overlay" onClick={() => setModalType(null)}>
          <div className="nero-modal" onClick={(event) => event.stopPropagation()}>
            <div className="nero-modal-header">Novo NPC</div>
            <div className="nero-modal-body">
              <div className="form-group">
                <label>Nome</label>
                <input className="nero-input" value={newNpc.name} onChange={(event) => setNewNpc({ ...newNpc, name: event.target.value })} />
              </div>
              <div className="form-group">
                <label>Função</label>
                <input className="nero-input" value={newNpc.role} onChange={(event) => setNewNpc({ ...newNpc, role: event.target.value })} placeholder="Ex: vigia, médico, batedor..." />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select className="nero-select" value={newNpc.health} onChange={(event) => setNewNpc({ ...newNpc, health: event.target.value })}>
                  {npcHealthOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Notas</label>
                <textarea className="nero-textarea" rows="3" value={newNpc.notes} onChange={(event) => setNewNpc({ ...newNpc, notes: event.target.value })} />
              </div>
            </div>
            <div className="nero-modal-footer">
              <button className="btn-nero" onClick={() => setModalType(null)}>Cancelar</button>
              <button className="btn-nero btn-primary" disabled={saving} onClick={handleAddNpc}>Adicionar</button>
            </div>
          </div>
        </div>
      )}

      {modalType === "threat" && (
        <div className="nero-modal-overlay" onClick={() => setModalType(null)}>
          <div className="nero-modal" onClick={(event) => event.stopPropagation()}>
            <div className="nero-modal-header">Nova ameaça</div>
            <div className="nero-modal-body">
              <div className="form-group">
                <label>Nome</label>
                <input className="nero-input" value={newThreat.name} onChange={(event) => setNewThreat({ ...newThreat, name: event.target.value })} />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea className="nero-textarea" rows="3" value={newThreat.description} onChange={(event) => setNewThreat({ ...newThreat, description: event.target.value })} />
              </div>
              <div className="form-group">
                <label>Tamanho do relógio</label>
                <input type="number" min="1" className="nero-input" value={newThreat.maxLevel} onChange={(event) => setNewThreat({ ...newThreat, maxLevel: Number(event.target.value) })} />
              </div>
            </div>
            <div className="nero-modal-footer">
              <button className="btn-nero" onClick={() => setModalType(null)}>Cancelar</button>
              <button className="btn-nero btn-primary" disabled={saving} onClick={handleAddThreat}>Criar</button>
            </div>
          </div>
        </div>
      )}

      {modalType === "project" && (
        <div className="nero-modal-overlay" onClick={() => setModalType(null)}>
          <div className="nero-modal" onClick={(event) => event.stopPropagation()}>
            <div className="nero-modal-header">Novo projeto</div>
            <div className="nero-modal-body">
              <div className="form-group">
                <label>Nome</label>
                <input className="nero-input" value={newProject.name} onChange={(event) => setNewProject({ ...newProject, name: event.target.value })} />
              </div>
              <div className="form-group">
                <label>Custo</label>
                <input type="number" min="1" className="nero-input" value={newProject.cost} onChange={(event) => setNewProject({ ...newProject, cost: Number(event.target.value) })} />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea className="nero-textarea" rows="3" value={newProject.description} onChange={(event) => setNewProject({ ...newProject, description: event.target.value })} />
              </div>
            </div>
            <div className="nero-modal-footer">
              <button className="btn-nero" onClick={() => setModalType(null)}>Cancelar</button>
              <button className="btn-nero btn-primary" disabled={saving} onClick={handleAddProject}>Iniciar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefugeDashboard;
