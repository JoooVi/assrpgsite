/* RefugeDashboard.js */
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

// Ícones React Icons
import { 
  FaEdit, FaArrowLeft, FaMapMarkerAlt, FaPlus, FaMinus, FaTrash, 
  FaShieldAlt, FaHammer, FaUsers, FaSkull, FaClipboardList, 
  FaTint, FaLeaf, FaPaw, FaTree, FaGem, FaSeedling, FaUtensils, 
  FaTshirt, FaGasPump, FaCrosshairs, FaFirstAid, FaTools, FaExclamationTriangle,
  FaUserAstronaut
} from "react-icons/fa";

import "./RefugeDashboard.css";

// Configuração de Ícones de Recursos
const resourceIcons = {
  water: <FaTint style={{color:'#4fc3f7'}}/>, plants: <FaLeaf style={{color:'#66bb6a'}}/>,
  animals: <FaPaw style={{color:'#ffb74d'}}/>, wood: <FaTree style={{color:'#8d6e63'}}/>,
  minerals: <FaGem style={{color:'#b0bec5'}}/>, biomass: <FaSeedling style={{color:'#aed581'}}/>,
  food: <FaUtensils style={{color:'#ff7043'}}/>, clothing: <FaTshirt style={{color:'#ce93d8'}}/>,
  fuel: <FaGasPump style={{color:'#ffca28'}}/>, ammo: <FaCrosshairs style={{color:'#ef5350'}}/>,
  meds: <FaFirstAid style={{color:'#f06292'}}/>, construction: <FaTools style={{color:'#8d6e63'}}/>,
};
const resourceLabels = {
    water: "Água", plants: "Plantas", animals: "Animais", wood: "Madeira",
    minerals: "Minerais", biomass: "Biomassa", food: "Alimento", clothing: "Vestuário",
    fuel: "Combustível", ammo: "Munição", meds: "Remédios", construction: "Mat. Constr."
};

// Templates (Baseado nas imagens)
const buildingTemplates = [
  { name: "Dormitório", type: "Habitação", cost: 20, description: "Aumenta Máx. População.", effect: { type: "popMax", value: 2 } }, 
  { name: "Fonte de Água", type: "Recurso", cost: 15, description: "Água infinita (não gasta estoque).", effect: { type: "waterSource" } },
  { name: "Despensa/Celeiro", type: "Armazenamento", cost: 10, description: "Aumenta Teto de Reservas em +5.", effect: { type: "reserves", value: 5 } },
  { name: "Fortificação", type: "Defesa", cost: 10, description: "+1 Nível de Defesa.", effect: { type: "defense", value: 1 } },
  { name: "Enfermaria", type: "Recurso", cost: 15, description: "Ajuda na recuperação de crises de saúde.", effect: { type: "health" } },
  { name: "Oficina", type: "Produção", cost: 10, description: "Permite criar itens.", effect: { type: "craft" } },
];

const RefugeDashboard = () => {
  const { id: campaignId } = useParams(); 
  const { user, token } = useSelector((state) => state.auth);

  const [refuge, setRefuge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [isMaster, setIsMaster] = useState(false);
  
  // Modais
  const [modalType, setModalType] = useState(null); 
  
  // Estados de Formulário
  const [editData, setEditData] = useState({ name: "", location: "", description: "" });
  const [newStructure, setNewStructure] = useState({ name: "", type: "Geral", description: "", cost: 10 });
  const [newNpc, setNewNpc] = useState({ name: "", role: "", notes: "" });
  const [newThreat, setNewThreat] = useState({ name: "", description: "", maxLevel: 4 });
  const [newProject, setNewProject] = useState({ name: "", description: "", cost: 10 });

  // Toast
  const [toast, setToast] = useState({ open: false, msg: "" });

  // --- CÁLCULO DE LIMITES ---
  const calculateRefugeLimits = (currentRefuge) => {
      if (!currentRefuge) return { maxPop: 2, maxReserves: 10 };

      let maxPop = 2; 
      let maxReserves = 10; 
      
      if (currentRefuge.structures) {
        currentRefuge.structures.forEach(struct => {
            const template = buildingTemplates.find(t => t.name === struct.name) || struct;
            
            if (template.effect) {
                if (template.effect.type === 'popMax') maxPop += (template.effect.value || 0);
                if (template.effect.type === 'reserves') maxReserves += (template.effect.value || 0);
            }
            if (struct.name.toLowerCase().includes('dormitório')) maxPop += 1;
            if (struct.name.toLowerCase().includes('armazém') || struct.name.toLowerCase().includes('despensa')) maxReserves += 5;
        });
      }

      return { maxPop, maxReserves };
  };

  // Fetch inicial
  const fetchRefuge = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `https://assrpgsite-be-production.up.railway.app/api/refuge/campaign/${campaignId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRefuge(res.data);
      setIsMaster(true); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRefuge(); }, [campaignId, token]);

  const saveRefugeUpdate = async (updatedData) => {
    try {
      setRefuge(updatedData); 
      await axios.put(
        `https://assrpgsite-be-production.up.railway.app/api/refuge/${updatedData._id}`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      setToast({ open: true, msg: "Erro ao salvar no servidor." });
      fetchRefuge();
    }
  };

  // --- HANDLERS ---
  
  const handleStatChange = (statName, amount) => {
    if (!refuge) return;
    const newStats = { ...refuge.stats };

    if (statName === 'population') {
        let newVal = newStats.population.current + amount;
        if (newVal < 0) newVal = 0; 
        newStats.population.current = newVal;
    } else {
        let newVal = newStats[statName] + amount;
        if (newVal < 0) newVal = 0; if (newVal > 6) newVal = 6;
        newStats[statName] = newVal;
    }
    saveRefugeUpdate({ ...refuge, stats: newStats });
  };

  const handleResourceChange = (cat, type, amount) => {
    const newRes = { ...refuge.resources };
    const { maxReserves } = calculateRefugeLimits(refuge);

    let newVal = newRes[cat][type].level + amount;
    if (newVal < 0) newVal = 0;
    if (newVal > maxReserves) newVal = maxReserves;
    newRes[cat][type].level = newVal;
    saveRefugeUpdate({ ...refuge, resources: newRes });
  };

  const handlePassCycle = async () => {
    if (!window.confirm("Encerrar semana? Recursos serão consumidos.")) return;
    try {
      const res = await axios.post(
        `https://assrpgsite-be-production.up.railway.app/api/refuge/${refuge._id}/cycle`,
        {}, { headers: { Authorization: `Bearer ${token}` } }
      );
      setRefuge(res.data);
      setToast({ open: true, msg: `Ciclo ${res.data.currentCycle} iniciado!` });
    } catch (error) { alert("Erro ao processar ciclo."); }
  };

  // --- PROJETOS E CONSTRUÇÕES ---
  const handleAddStructureProject = () => {
      const template = buildingTemplates.find(t => t.name === newStructure.name);
      
      const proj = { 
          name: `Construir ${newStructure.name}`, 
          description: newStructure.description, 
          cost: newStructure.cost, 
          progress: 0,
          linkedBuilding: { 
              name: newStructure.name, 
              type: newStructure.type, 
              description: newStructure.description,
              effect: template ? template.effect : null
          }
      };
      saveRefugeUpdate({ ...refuge, activeProjects: [...refuge.activeProjects, proj] });
      setModalType(null);
      setToast({ open: true, msg: "Projeto iniciado na Sala de Guerra!" });
  };

  const handleProjectProgress = (idx, amt) => {
      const list = [...refuge.activeProjects];
      let val = list[idx].progress + amt;
      if(val < 0) val = 0;
      list[idx].progress = val;
      
      if(val >= list[idx].cost) {
          if(list[idx].linkedBuilding) {
              const newRefuge = { ...refuge };
              newRefuge.structures.push(list[idx].linkedBuilding);
              newRefuge.activeProjects = list.filter((_, i) => i !== idx);
              
              if (list[idx].linkedBuilding.effect?.type === 'defense') {
                   newRefuge.stats.defense += list[idx].linkedBuilding.effect.value;
              }

              saveRefugeUpdate(newRefuge);
              setToast({ open: true, msg: "Construção concluída!" });
              return;
          }
          const newRefuge = { ...refuge };
          newRefuge.activeProjects = list.filter((_, i) => i !== idx);
          saveRefugeUpdate(newRefuge);
          setToast({ open: true, msg: "Projeto finalizado!" });
          return;
      }
      saveRefugeUpdate({ ...refuge, activeProjects: list });
  };

  // --- NPCS E AMEAÇAS ---
  const handleAddNpc = () => {
      if(!newNpc.name) return;
      const updatedList = [...refuge.populationList, { ...newNpc, health: 'Saudável' }];
      saveRefugeUpdate({ ...refuge, populationList: updatedList });
      setModalType(null);
      setNewNpc({ name: "", role: "", notes: "" });
      setToast({ open: true, msg: "Habitante registrado." });
  };

  const handleAddThreat = () => {
      if(!newThreat.name) return;
      const updatedList = [...refuge.activeThreats, { ...newThreat, level: 0 }];
      saveRefugeUpdate({ ...refuge, activeThreats: updatedList });
      setModalType(null);
      setNewThreat({ name: "", description: "", maxLevel: 4 });
  };

  // --- FUNÇÃO QUE FALTAVA (FIX ESLINT) ---
  const handleThreatProgress = (idx, amount) => {
    const updatedThreats = [...refuge.activeThreats];
    const threat = { ...updatedThreats[idx] };
    
    let newVal = threat.level + amount;
    if (newVal < 0) newVal = 0;
    if (newVal > threat.maxLevel) newVal = threat.maxLevel;
    
    threat.level = newVal;
    updatedThreats[idx] = threat;
    
    saveRefugeUpdate({ ...refuge, activeThreats: updatedThreats });
  };
  // -------------------------------------

  const handleDeleteItem = (list, idx) => {
      if(!window.confirm("Confirmar exclusão?")) return;
      saveRefugeUpdate({ ...refuge, [list]: refuge[list].filter((_, i) => i !== idx) });
  };

  // --- RENDER AUXILIARES ---
  const { maxPop, maxReserves } = calculateRefugeLimits(refuge);

  if (loading) return <div className="refuge-container"><h2 style={{fontFamily:'Orbitron'}}>CARREGANDO BASE...</h2></div>;
  if (!refuge) return <div className="refuge-container"><h2>DADOS INACESSÍVEIS</h2></div>;

  return (
    <div className="refuge-container">
      <div className="refuge-panel">
        
        {/* HEADER */}
        <div className="refuge-header" style={{backgroundImage: `url(${refuge.image || 'http://images.unsplash.com/photo-1590625321528-724dc0f3689f?q=80'})`}}>
            <div className="header-content">
                <div>
                    <Link to={`/campaign-lobby/${campaignId}`} className="btn-nero" style={{marginBottom:'10px', textDecoration:'none'}}>
                        <FaArrowLeft /> VOLTAR
                    </Link>
                    <h1 className="refuge-title">{refuge.name}</h1>
                    <div className="refuge-location">
                        <FaMapMarkerAlt /> {refuge.location || "Localização Desconhecida"}
                        <span className="cycle-badge">CICLO {refuge.currentCycle}</span>
                    </div>
                </div>
                <div style={{display:'flex', gap:'10px'}}>
                    {isMaster && <button className="btn-nero btn-primary" onClick={handlePassCycle}>PASSAR CICLO</button>}
                    {isMaster && <button className="btn-nero btn-secondary" onClick={() => { setEditData(refuge); setModalType('edit'); }}><FaEdit /> EDITAR</button>}
                </div>
            </div>
        </div>

        {/* STATUS BAR */}
        <div className="stats-bar">
            {[
                { l: "POPULAÇÃO", v: refuge.stats.population.current, k: 'population', limit: maxPop },
                { l: "MORAL", v: refuge.stats.morale, k: 'morale', type: 'morale', limit: 6 },
                { l: "DEFESA", v: refuge.stats.defense, k: 'defense', type: 'defense', limit: 6 },
                { l: "MOBILIDADE", v: refuge.stats.mobility, k: 'mobility', limit: 6 },
                { l: "BELIGERÂNCIA", v: refuge.stats.belligerence, k: 'belligerence', type: 'danger', limit: 6 },
                { l: "TETO RESERVAS", v: maxReserves, k: null }
            ].map((s, i) => (
                <div key={i} className="stat-box">
                    <span className="stat-label">{s.l}</span>
                    <div className="stat-value-container">
                        {s.k && <button className="btn-stat-mini" onClick={() => handleStatChange(s.k, -1)}><FaMinus size={10}/></button>}
                        <span className={`stat-value ${s.type || ''}`}>{s.v}</span>
                        {s.limit && <span style={{fontSize:'0.8rem', color:'#666', alignSelf:'flex-end', marginBottom:'5px'}}>/{s.limit}</span>}
                        {s.k && <button className="btn-stat-mini" onClick={() => handleStatChange(s.k, 1)}><FaPlus size={10}/></button>}
                    </div>
                </div>
            ))}
        </div>

        {/* ABAS */}
        <div className="refuge-tabs">
            {['RECURSOS', 'CONSTRUÇÕES', 'HABITANTES', 'SALA DE GUERRA', 'HISTÓRICO'].map((label, idx) => (
                <button key={idx} className={`refuge-tab ${activeTab === idx ? 'active' : ''}`} onClick={() => setActiveTab(idx)}>
                    {label}
                </button>
            ))}
        </div>

        {/* CONTEÚDO */}
        <div className="tab-content">
            
            {/* 0: RECURSOS */}
            {activeTab === 0 && (
                <div>
                    <div className="resource-grid">
                        {Object.entries(refuge.resources.natural).map(([k, v]) => (
                            <div key={k} className="resource-card">
                                <span className="res-icon">{resourceIcons[k]}</span>
                                <span className="res-name">{resourceLabels[k]}</span>
                                <div className="res-control">
                                    <button className="btn-stat-mini" onClick={() => handleResourceChange('natural', k, -1)}><FaMinus/></button>
                                    <span className="res-val">{v.level}</span>
                                    <button className="btn-stat-mini" onClick={() => handleResourceChange('natural', k, 1)}><FaPlus/></button>
                                </div>
                            </div>
                        ))}
                        {Object.entries(refuge.resources.manufactured).map(([k, v]) => (
                            <div key={k} className="resource-card">
                                <span className="res-icon">{resourceIcons[k]}</span>
                                <span className="res-name">{resourceLabels[k]}</span>
                                <div className="res-control">
                                    <button className="btn-stat-mini" onClick={() => handleResourceChange('manufactured', k, -1)}><FaMinus/></button>
                                    <span className="res-val">{v.level}</span>
                                    <button className="btn-stat-mini" onClick={() => handleResourceChange('manufactured', k, 1)}><FaPlus/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 1: CONSTRUÇÕES */}
            {activeTab === 1 && (
                <div>
                    <button className="btn-nero btn-primary btn-float-right" onClick={() => setModalType('structure')}><FaPlus/> INICIAR PROJETO</button>
                    <div style={{clear:'both'}}></div>
                    <div className="build-grid">
                        {refuge.structures.map((s, i) => (
                            <div key={i} className="build-card">
                                <button className="btn-icon-danger" onClick={() => handleDeleteItem('structures', i)}><FaTrash/></button>
                                <h4>{s.name}</h4>
                                <span className="type">{s.type}</span>
                                <p>{s.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2: HABITANTES */}
            {activeTab === 2 && (
                <div>
                    <button className="btn-nero btn-primary btn-float-right" onClick={() => setModalType('npc')}><FaPlus/> NOVO NPC</button>
                    <div style={{clear:'both'}}></div>
                    <div className="build-grid" style={{gridTemplateColumns:'1fr 1fr'}}>
                        
                        {/* COLUNA 1: JOGADORES (PJs) */}
                        <div style={{background:'#111', padding:'20px', border:'1px solid #333'}}>
                            <h4 style={{color:'#4c86ff', borderBottom:'1px solid #333', paddingBottom:'10px', display:'flex', alignItems:'center', gap:'10px'}}>
                                <FaUserAstronaut/> JOGADORES (PJs)
                            </h4>
                            {refuge.playerCharacters && refuge.playerCharacters.length > 0 ? (
                                refuge.playerCharacters.map(pj => (
                                    <div key={pj._id} style={{padding:'10px', borderBottom:'1px solid #222', color:'#fff'}}>
                                        <strong>{pj.name}</strong> <br/>
                                        <span style={{color:'#666', fontSize:'0.85rem'}}>{pj.role || 'Sem função'} • {pj.health || 'Saudável'}</span>
                                    </div>
                                ))
                            ) : (
                                <p style={{color:'#666'}}>Nenhum jogador na campanha.</p>
                            )}
                        </div>

                        {/* COLUNA 2: NPCs */}
                        <div style={{background:'#111', padding:'20px', border:'1px solid #333'}}>
                            <h4 style={{color:'#b0c4de', borderBottom:'1px solid #333', paddingBottom:'10px', display:'flex', alignItems:'center', gap:'10px'}}>
                                <FaUsers/> HABITANTES (NPCs)
                            </h4>
                            {refuge.populationList.map((npc, i) => (
                                <div key={i} style={{padding:'10px', borderBottom:'1px solid #222', color:'#fff', display:'flex', justifyContent:'space-between'}}>
                                    <div>
                                        <strong>{npc.name}</strong> <br/>
                                        <span style={{color:'#666', fontSize:'0.85rem'}}>{npc.role}</span>
                                    </div>
                                    <button className="btn-icon-danger" style={{position:'static'}} onClick={() => handleDeleteItem('populationList', i)}><FaTrash/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 3: SALA DE GUERRA */}
            {activeTab === 3 && (
                <div className="war-room-grid">
                    <div>
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
                            <h3 style={{fontFamily:'Orbitron', color:'#ff5252', margin:0}}><FaSkull/> AMEAÇAS</h3>
                            <button className="btn-nero btn-secondary" onClick={() => setModalType('threat')}><FaPlus/> NOVA</button>
                        </div>
                        {refuge.activeThreats.map((t, i) => (
                            <div key={i} className="threat-card">
                                <button className="btn-icon-danger" onClick={() => handleDeleteItem('activeThreats', i)}><FaTrash/></button>
                                <div className="threat-title">{t.name}</div>
                                <div className="threat-desc">{t.description}</div>
                                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                    <button className="btn-stat-mini" onClick={() => handleThreatProgress(i, -1)}><FaMinus/></button>
                                    <div style={{flex:1}} className="nero-progress"><div className="nero-bar red" style={{width: `${(t.level/t.maxLevel)*100}%`}}></div></div>
                                    <button className="btn-stat-mini" onClick={() => handleThreatProgress(i, 1)}><FaPlus/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div>
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
                            <h3 style={{fontFamily:'Orbitron', color:'#4c86ff', margin:0}}><FaTools/> PROJETOS</h3>
                            <button className="btn-nero btn-secondary" onClick={() => setModalType('project')}><FaPlus/> NOVO</button>
                        </div>
                        {refuge.activeProjects.map((p, i) => (
                            <div key={i} className="build-card" style={{marginBottom:'15px', borderLeftColor:'#4c86ff'}}>
                                <button className="btn-icon-danger" onClick={() => handleDeleteItem('activeProjects', i)}><FaTrash/></button>
                                <h4>{p.name}</h4>
                                <p>{p.description}</p>
                                <div style={{display:'flex', alignItems:'center', gap:'10px', marginTop:'10px'}}>
                                    <button className="btn-stat-mini" onClick={() => handleProjectProgress(i, -1)}><FaMinus/></button>
                                    <div style={{flex:1}} className="nero-progress"><div className="nero-bar blue" style={{width: `${(p.progress/p.cost)*100}%`}}></div></div>
                                    <button className="btn-stat-mini" onClick={() => handleProjectProgress(i, 1)}><FaPlus/></button>
                                </div>
                                <div style={{textAlign:'right', fontSize:'0.8rem', color:'#666', marginTop:'5px'}}>{p.progress}/{p.cost}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 4: HISTÓRICO */}
            {activeTab === 4 && (
                <div className="log-list">
                    {refuge.logs && refuge.logs.map((log, i) => (
                        <div key={i} className={`log-item ${log.type}`}>
                            <span className="log-time">{new Date(log.timestamp).toLocaleDateString()}</span>
                            <strong>CICLO {log.cycle}:</strong> {log.message}
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* --- MODAIS --- */}
      
      {/* EDITAR REFÚGIO */}
      {modalType === 'edit' && (
          <div className="nero-modal-overlay">
              <div className="nero-modal">
                  <div className="nero-modal-header">EDITAR REFÚGIO</div>
                  <div className="nero-modal-body">
                      <div className="form-group"><label>NOME</label><input className="nero-input" value={editData.name} onChange={e=>setEditData({...editData, name:e.target.value})}/></div>
                      <div className="form-group"><label>LOCALIZAÇÃO</label><input className="nero-input" value={editData.location} onChange={e=>setEditData({...editData, location:e.target.value})}/></div>
                      <div className="form-group"><label>DESCRIÇÃO</label><textarea className="nero-textarea" rows="3" value={editData.description} onChange={e=>setEditData({...editData, description:e.target.value})}/></div>
                  </div>
                  <div className="nero-modal-footer"><button className="btn-nero" onClick={()=>setModalType(null)}>CANCELAR</button><button className="btn-nero btn-primary" onClick={()=>{saveRefugeUpdate({...refuge, ...editData}); setModalType(null);}}>SALVAR</button></div>
              </div>
          </div>
      )}

      {/* CONSTRUÇÃO */}
      {modalType === 'structure' && (
          <div className="nero-modal-overlay">
              <div className="nero-modal">
                  <div className="nero-modal-header">INICIAR PROJETO</div>
                  <div className="nero-modal-body">
                      <div className="form-group"><label>MODELO</label>
                          <select className="nero-select" onChange={e => {
                              const t = buildingTemplates.find(t => t.name === e.target.value);
                              if(t) setNewStructure({name:t.name, type:t.type, description:t.description, cost:t.cost});
                          }}>
                              <option value="">-- Selecionar --</option>
                              {buildingTemplates.map(t => <option key={t.name} value={t.name}>{t.name} (Custo: {t.cost})</option>)}
                          </select>
                      </div>
                      <div className="form-group"><label>NOME</label><input className="nero-input" value={newStructure.name} onChange={e=>setNewStructure({...newStructure, name:e.target.value})}/></div>
                      <div className="form-group"><label>TIPO</label><select className="nero-select" value={newStructure.type} onChange={e=>setNewStructure({...newStructure, type:e.target.value})}><option>Geral</option><option>Habitação</option><option>Recurso</option><option>Defesa</option></select></div>
                      <div className="form-group"><label>CUSTO</label><input type="number" className="nero-input" value={newStructure.cost} onChange={e=>setNewStructure({...newStructure, cost:Number(e.target.value)})}/></div>
                  </div>
                  <div className="nero-modal-footer"><button className="btn-nero" onClick={()=>setModalType(null)}>CANCELAR</button><button className="btn-nero btn-primary" onClick={handleAddStructureProject}>INICIAR</button></div>
              </div>
          </div>
      )}

      {/* NPC */}
      {modalType === 'npc' && (
          <div className="nero-modal-overlay">
              <div className="nero-modal">
                  <div className="nero-modal-header">NOVO NPC</div>
                  <div className="nero-modal-body">
                      <div className="form-group"><label>NOME</label><input className="nero-input" value={newNpc.name} onChange={e=>setNewNpc({...newNpc, name:e.target.value})}/></div>
                      <div className="form-group"><label>FUNÇÃO</label><input className="nero-input" value={newNpc.role} onChange={e=>setNewNpc({...newNpc, role:e.target.value})}/></div>
                  </div>
                  <div className="nero-modal-footer"><button className="btn-nero" onClick={()=>setModalType(null)}>CANCELAR</button><button className="btn-nero btn-primary" onClick={handleAddNpc}>ADICIONAR</button></div>
              </div>
          </div>
      )}

      {/* Ameaça */}
      {modalType === 'threat' && (
          <div className="nero-modal-overlay">
              <div className="nero-modal">
                  <div className="nero-modal-header">NOVA AMEAÇA</div>
                  <div className="nero-modal-body">
                      <div className="form-group"><label>NOME</label><input className="nero-input" value={newThreat.name} onChange={e=>setNewThreat({...newThreat, name:e.target.value})}/></div>
                      <div className="form-group"><label>DESCRIÇÃO</label><textarea className="nero-textarea" value={newThreat.description} onChange={e=>setNewThreat({...newThreat, description:e.target.value})}/></div>
                      <div className="form-group"><label>TAMANHO DO RELÓGIO</label><input type="number" className="nero-input" value={newThreat.maxLevel} onChange={e=>setNewThreat({...newThreat, maxLevel:Number(e.target.value)})}/></div>
                  </div>
                  <div className="nero-modal-footer"><button className="btn-nero" onClick={()=>setModalType(null)}>CANCELAR</button><button className="btn-nero btn-primary" onClick={handleAddThreat}>CRIAR</button></div>
              </div>
          </div>
      )}

      {/* Projeto */}
      {modalType === 'project' && (
          <div className="nero-modal-overlay">
              <div className="nero-modal">
                  <div className="nero-modal-header">NOVO PROJETO</div>
                  <div className="nero-modal-body">
                      <div className="form-group"><label>NOME</label><input className="nero-input" value={newProject.name} onChange={e=>setNewProject({...newProject, name:e.target.value})}/></div>
                      <div className="form-group"><label>CUSTO</label><input type="number" className="nero-input" value={newProject.cost} onChange={e=>setNewProject({...newProject, cost:Number(e.target.value)})}/></div>
                      <div className="form-group"><label>DESCRIÇÃO</label><textarea className="nero-textarea" value={newProject.description} onChange={e=>setNewProject({...newProject, description:e.target.value})}/></div>
                  </div>
                  <div className="nero-modal-footer"><button className="btn-nero" onClick={()=>setModalType(null)}>CANCELAR</button><button className="btn-nero btn-primary" onClick={() => {
                      saveRefugeUpdate({ ...refuge, activeProjects: [...refuge.activeProjects, { ...newProject, progress: 0 }] });
                      setModalType(null);
                  }}>INICIAR</button></div>
              </div>
          </div>
      )}

      {/* Toast */}
      {toast.open && <div className="nero-toast">{toast.msg}</div>}

    </div>
  );
};

export default RefugeDashboard;