/* src/components/NPCGenerator.js */

import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FaDiceD20, FaSave, FaUserSecret, FaSyncAlt, FaSuitcase, FaBrain, FaCubes, FaShareSquare } from 'react-icons/fa';
import './NPCGenerator.css'; 

const archetypes = [
  "Aleatório", "Combatente", "Curandeiro(a)", "Desbravador(a)", 
  "Estudioso(a)", "Negociador(a)", "Furtivo(a)", "Sobrevivente"
];

/* --- DADOS LÓGICOS CATEGORIZADOS --- */
const temperaments = [
  "Hostil", "Desconfiado", "Cooperativo", "Em Choque", "Pragmático", 
  "Agressivo", "Covarde", "Líder Nato", "Egoísta", "Altruísta", "Instável"
];

const logicalData = {
    "Combatente": {
        objectives: ["Caçando uma criatura assimilada", "Patrulhando território", "Buscando vingança contra um grupo", "Limpando uma rota perigosa"],
        loot: ["Munição deflagrada", "Faca tática desgastada", "Plaqueta de identificação suja", "Ração militar seca", "Cantil de metal"]
    },
    "Curandeiro(a)": {
        objectives: ["Buscando suprimentos médicos", "Tentando curar uma infecção", "Procurando ervas limpas na zona morta", "Cuidando de um aliado ferido"],
        loot: ["Bandagens encardidas", "Frasco de álcool pela metade", "Bisturi enferrujado", "Seringa vazia", "Anotações sobre anatomia"]
    },
    "Desbravador(a)": {
        objectives: ["Mapeando ruínas desconhecidas", "Buscando uma nova fonte de água", "Procurando abrigo seguro para a noite", "Rastreando um comboio perdido"],
        loot: ["Bússola com vidro trincado", "Corda puída", "Mapa rabiscado", "Binóculos sem lente", "Sinalizador de emergência"]
    },
    "Estudioso(a)": {
        objectives: ["Analisando fungos da Assimilação", "Tentando consertar um rádio antigo", "Catalogando artefatos do Velho Mundo", "Buscando registros em uma ruína"],
        loot: ["Caderno de anotações manchado", "Caneta sem tinta", "Pen drive enferrujado", "Óculos com fita adesiva", "Peça de motor inutilizável"]
    },
    "Negociador(a)": {
        objectives: ["Indo fechar um acordo de escambo", "Fugindo de uma dívida de recursos", "Tentando recrutar aliados", "Procurando clientes para um item raro"],
        loot: ["Moedas antigas inúteis", "Relógio de bolso quebrado", "Caderneta de devedores", "Isqueiro de metal", "Joia suja de lama"]
    },
    "Furtivo(a)": {
        objectives: ["Espionando um Refúgio rival", "Fugindo após roubar suprimentos", "Escondendo loot num esconderijo", "Evitando chamar atenção"],
        loot: ["Gazuas improvisadas", "Faca de lâmina escura", "Máscara de pano suja", "Veneno extraído de planta", "Saco com comida roubada"]
    },
    "Sobrevivente": {
        objectives: ["Fugindo de uma horda", "Procurando restos de comida", "Tentando não congelar de frio", "Escondendo a própria mordida"],
        loot: ["Lata de feijão vazia", "Pedaço de lona", "Fósforos úmidos", "Garrafa de água rachada", "Foto de família rasgada"]
    }
};

// Junta tudo caso o utilizador escolha "Aleatório"
const allObjectives = Object.values(logicalData).flatMap(d => d.objectives);
const allLoot = Object.values(logicalData).flatMap(d => d.loot);

// --- FUNÇÃO DE TRADUÇÃO ---
const translateKey = (key) => {
    const map = {
        reaction: "Reação", perception: "Percepção", sagacity: "Sagacidade",
        potency: "Potência", influence: "Influência", resolution: "Resolução",
        geography: "Geografia", medicine: "Medicina", security: "Segurança",
        biology: "Biologia", erudition: "Erudição", engineering: "Engenharia",
        weapons: "Armas", athletics: "Atletismo", expression: "Expressão",
        stealth: "Furtividade", crafting: "Manufaturas", survival: "Sobrevivência"
    };
    return map[key.toLowerCase()] || key.toUpperCase();
};

const NPCGenerator = ({ campaignId, onNpcSaved, onShareToChat }) => {
  const token = useSelector((state) => state.auth.token);
  const [loading, setLoading] = useState(false);
  const [npc, setNpc] = useState(null);
  const [rpDetails, setRpDetails] = useState({ temperament: "", objective: "", loot: [] });
  const [config, setConfig] = useState({ type: "Aleatório", level: 1 });

  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // GERAÇÃO LÓGICA BASEADA NO ARQUÉTIPO
  const generateLocalDetails = (archetype) => {
    const numItems = Math.floor(Math.random() * 2) + 2; 
    let validObjectives = allObjectives;
    let validLoot = allLoot;

    if (archetype && logicalData[archetype]) {
        validObjectives = logicalData[archetype].objectives;
        validLoot = logicalData[archetype].loot;
    }

    const shuffledLoot = [...validLoot].sort(() => 0.5 - Math.random());
    
    return {
      temperament: getRandom(temperaments),
      objective: getRandom(validObjectives),
      loot: shuffledLoot.slice(0, numItems)
    };
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const payload = {
        // Envia o arquétipo escolhido para o backend
        type: config.type === "Aleatório" ? "" : config.type,
        level: parseInt(config.level)
      };

      const res = await axios.post(
        "https://assrpgsite-be-production.up.railway.app/api/tools/generate-npc",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNpc(res.data);
      // Lê o arquétipo final para garantir que as informações locais batem certo
      const generatedArchetype = config.type !== "Aleatório" ? config.type : res.data.archetype;
      setRpDetails(generateLocalDetails(generatedArchetype));

    } catch (err) {
      console.error(err);
      alert("Erro ao sintetizar NPC. Verifique a conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleRerollRP = () => {
      const generatedArchetype = config.type !== "Aleatório" ? config.type : npc?.archetype;
      setRpDetails(generateLocalDetails(generatedArchetype));
  };

  const handleSave = async () => {
    if (!npc) return;
    if (!campaignId) { alert("Erro de Sistema: O gerador precisa de estar vinculado a uma campanha para guardar dados."); return; }

    try {
        setLoading(true);
        const payload = {
            campaignId: campaignId,
            npcData: {
                ...npc, 
                rpDetails: {
                    temperament: rpDetails.temperament,
                    objective: rpDetails.objective,
                    loot: rpDetails.loot
                }
            }
        };

        await axios.post(
            "https://assrpgsite-be-production.up.railway.app/api/campaigns/npc", 
            payload, 
            { headers: { Authorization: `Bearer ${token}` } }
        );

        setNpc(null);
        setRpDetails({ temperament: "", objective: "", loot: [] });
        if(onNpcSaved) onNpcSaved(); 

    } catch (err) {
        console.error("Erro ao salvar NPC:", err);
        alert("Falha na gravação. Verifique a comunicação com a base de dados.");
    } finally {
        setLoading(false);
    }
  };

  const handleShare = () => {
    if (!npc || !onShareToChat) return;
    const payloadStr = JSON.stringify({ type: 'npc_card', npc, rpDetails });
    onShareToChat(payloadStr);
  };

  const getTemperamentColor = (temp) => {
      if(['Hostil', 'Agressivo', 'Egoísta'].includes(temp)) return 'red';
      if(['Cooperativo', 'Altruísta', 'Líder Nato'].includes(temp)) return 'green';
      if(['Em Choque', 'Instável', 'Covarde'].includes(temp)) return 'yellow';
      return 'grey';
  };

  return (
    <div className="npc-gen-container" style={{ margin: 0, padding: '25px', minHeight: 'auto' }}>
      <div className="npc-sidebar">
        <div className="control-group">
            <label>Arquétipo Base</label>
            <select value={config.type} onChange={(e) => setConfig({...config, type: e.target.value})}>
                {archetypes.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
        </div>
        <div className="control-group">
            <label>Nível de Ameaça</label>
            <div className="level-selector">
                {[1, 2, 3].map(lvl => (
                    <button key={lvl} className={config.level === lvl ? 'active' : ''} onClick={() => setConfig({...config, level: lvl})}>
                        NÍVEL {lvl}
                    </button>
                ))}
            </div>
        </div>
        <button className="btn-generate" onClick={handleGenerate} disabled={loading}>
            {loading ? "PROCESSANDO DADOS..." : <><FaDiceD20 size={16} /> SINTETIZAR NPC</>}
        </button>
      </div>

      <div className="npc-preview">
        {!npc ? (
            <div className="empty-state">
                <FaUserSecret size={50} color="#333" />
                <p>Nenhum perfil carregado. Configure os parâmetros à esquerda e sintetize um novo agente.</p>
            </div>
        ) : (
            <div className="npc-card fade-in">
                <div className="npc-header">
                    <h3>{npc.name}</h3>
                    <span className="npc-role">{npc.occupation}</span>
                </div>
                
                <div className="npc-rp-section">
                    <div className="rp-header">
                        <h4><FaBrain size={14} color="#8b5cf6" /> PERFIL PSICOLÓGICO</h4>
                        <button className="btn-icon-small" onClick={handleRerollRP} title="Recalcular Roleplay">
                            <FaSyncAlt size={12} />
                        </button>
                    </div>
                    <div className="rp-row">
                        <span className={`npc-badge badge-${getTemperamentColor(rpDetails.temperament)}`}>{rpDetails.temperament}</span>
                        <span className="rp-objective"><strong>Objetivo:</strong> {rpDetails.objective}</span>
                    </div>
                    <div className="npc-quirk">"{npc.event}"</div>
                    <div className="inventory-box">
                        <h5><FaSuitcase size={14} color="#3cdce7" /> INVENTÁRIO RÁPIDO</h5>
                        <div className="loot-list">
                            {rpDetails.loot.map((item, idx) => <span key={idx} className="loot-item">{item}</span>)}
                        </div>
                    </div>
                </div>

                <div className="npc-stats-grid">
                    <div className="stat-block">
                        <h4>INSTINTOS</h4>
                        <ul>
                            {Object.entries(npc.instincts).map(([k, v]) => (
                                <li key={k}><span>{translateKey(k)}</span><strong>{v}</strong></li>
                            ))}
                        </ul>
                    </div>
                    <div className="stat-block">
                        <h4>PERÍCIAS</h4>
                        <ul>
                            {Object.entries({...npc.knowledge, ...npc.practices})
                                .filter(([_, v]) => v > 0)
                                .map(([k, v]) => (
                                <li key={k}><span>{translateKey(k)}</span><strong>+{v}</strong></li>
                            ))}
                            {Object.values({...npc.knowledge, ...npc.practices}).every(v => v === 0) && <li>Nenhuma</li>}
                        </ul>
                    </div>
                </div>

                <div className="npc-footer">
                    <div className="pack-info"><FaCubes size={14} color="#888" />PACOTE SUGERIDO: <span>{npc.initialPack}</span></div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {onShareToChat && (
                           <button className="btn-save" onClick={handleShare} style={{ background: '#1f2e42' }}><FaShareSquare size={16} /> CHAT</button>
                        )}
                        <button className="btn-save" onClick={handleSave} disabled={loading}><FaSave size={16} /> GUARDAR</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default NPCGenerator;