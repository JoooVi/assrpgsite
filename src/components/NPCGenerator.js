/* src/components/NPCGenerator.js */

import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FaDiceD20, FaSave, FaUserSecret, FaSyncAlt, FaSuitcase, FaBrain } from 'react-icons/fa';
import './NPCGenerator.css'; 

const archetypes = [
  "Aleatório", "Combatente", "Curandeiro", "Desbravador", 
  "Estudioso", "Negociador", "Furtivo", "Sobrevivente"
];

/* --- DADOS LOCAIS PARA GERAÇÃO RÁPIDA (CLIENT-SIDE) --- */
const temperaments = [
  "Hostil", "Desconfiado", "Cooperativo", "Em Choque", "Pragmático", 
  "Agressivo", "Covarde", "Líder Nato", "Egoísta", "Altruísta", "Instável"
];

const objectives = [
  "Procurando água potável", "Fugindo de uma dívida", "Escondendo uma mordida", 
  "Rastreando um grupo rival", "Buscando abrigo para a noite", "Procurando um parente desaparecido",
  "Tentando consertar um rádio", "Sofrendo de abstinência", "Planejando uma emboscada", 
  "Apenas vagando sem rumo", "Carregando uma mensagem importante"
];

const lootList = [
  "Faca de cozinha enferrujada", "3 munições de revólver", "Foto de família desgastada", 
  "Relógio de pulso quebrado", "Meia garrafa de água", "Isqueiro (sem gás)", 
  "Maço de cigarros amassado", "Mapa local rabiscado", "Barra de cereal vencida", 
  "Bandagens sujas", "Um par de meias secas", "Canivete suíço", "Apito de emergência"
];

// --- FUNÇÃO DE TRADUÇÃO ---
const translateKey = (key) => {
    const map = {
        // Instintos
        reaction: "Reação", perception: "Percepção", sagacity: "Sagacidade",
        potency: "Potência", influence: "Influência", resolution: "Resolução",
        // Perícias
        geography: "Geografia", medicine: "Medicina", security: "Segurança",
        biology: "Biologia", erudition: "Erudição", engineering: "Engenharia",
        weapons: "Armas", athletics: "Atletismo", expression: "Expressão",
        stealth: "Furtividade", crafting: "Manufaturas", survival: "Sobrevivência"
    };
    return map[key.toLowerCase()] || key.toUpperCase();
};

const NPCGenerator = ({ campaignId, onNpcSaved }) => {
  const token = useSelector((state) => state.auth.token);

  const [loading, setLoading] = useState(false);
  const [npc, setNpc] = useState(null);
  
  const [rpDetails, setRpDetails] = useState({
    temperament: "",
    objective: "",
    loot: []
  });
  
  const [config, setConfig] = useState({
    type: "", 
    level: 1  
  });

  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const generateLocalDetails = () => {
    const numItems = Math.floor(Math.random() * 2) + 2; 
    const shuffledLoot = [...lootList].sort(() => 0.5 - Math.random());
    
    return {
      temperament: getRandom(temperaments),
      objective: getRandom(objectives),
      loot: shuffledLoot.slice(0, numItems)
    };
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const payload = {
        type: config.type === "Aleatório" ? "" : config.type,
        level: parseInt(config.level)
      };

      const res = await axios.post(
        "https://assrpgsite-be-production.up.railway.app/api/tools/generate-npc",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNpc(res.data);
      setRpDetails(generateLocalDetails());

    } catch (err) {
      console.error(err);
      alert("Erro ao gerar NPC.");
    } finally {
      setLoading(false);
    }
  };

  const handleRerollRP = () => {
    setRpDetails(generateLocalDetails());
  };

  const handleSave = async () => {
    if (!npc) return;
    
    if (!campaignId) {
        alert("Erro: Este gerador precisa estar dentro de uma campanha para salvar.");
        return;
    }

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

        alert("NPC Adicionado à Campanha!");
        
        setNpc(null);
        setRpDetails({ temperament: "", objective: "", loot: [] });
        
        if(onNpcSaved) onNpcSaved(); 

    } catch (err) {
        console.error("Erro ao salvar NPC:", err);
        alert("Erro ao salvar. Verifique se o servidor está online.");
    } finally {
        setLoading(false);
    }
  };

  const getTemperamentColor = (temp) => {
      if(['Hostil', 'Agressivo', 'Egoísta'].includes(temp)) return 'red';
      if(['Cooperativo', 'Altruísta', 'Líder Nato'].includes(temp)) return 'green';
      if(['Em Choque', 'Instável', 'Covarde'].includes(temp)) return 'yellow';
      return 'grey';
  };

  return (
    <div className="npc-gen-container" style={{ margin: 0, padding: '20px', minHeight: 'auto' }}>
      <div className="npc-sidebar">
        <div className="control-group">
            <label>Arquétipo</label>
            <select value={config.type} onChange={(e) => setConfig({...config, type: e.target.value})}>
                {archetypes.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
        </div>

        <div className="control-group">
            <label>Nível de Ameaça</label>
            <div className="level-selector">
                {[1, 2, 3].map(lvl => (
                    <button 
                        key={lvl}
                        className={config.level === lvl ? 'active' : ''}
                        onClick={() => setConfig({...config, level: lvl})}
                    >
                        Nível {lvl}
                    </button>
                ))}
            </div>
        </div>

        <button className="btn-generate" onClick={handleGenerate} disabled={loading}>
            {loading ? "Gerando..." : <><FaDiceD20 /> GERAR AGORA</>}
        </button>
      </div>

      <div className="npc-preview">
        {!npc ? (
            <div className="empty-state" style={{ paddingTop: '20px' }}>
                <FaUserSecret size={40} />
                <p>Configure e clique em Gerar.</p>
            </div>
        ) : (
            <div className="npc-card fade-in">
                <div className="npc-header">
                    <h3>{npc.name}</h3>
                    <span className="npc-role">{npc.occupation}</span>
                </div>
                
                <div className="npc-rp-section">
                    <div className="rp-header">
                        <h4><FaBrain /> PERFIL PSICOLÓGICO</h4>
                        <button className="btn-icon-small" onClick={handleRerollRP} title="Rolar novamente Roleplay">
                            <FaSyncAlt />
                        </button>
                    </div>
                    
                    <div className="rp-row">
                        <span className={`npc-badge badge-${getTemperamentColor(rpDetails.temperament)}`}>
                            {rpDetails.temperament}
                        </span>
                        <span className="rp-objective">
                            <strong>Objetivo:</strong> {rpDetails.objective}
                        </span>
                    </div>

                    <div className="npc-quirk">
                        <strong>Característica:</strong> "{npc.event}"
                    </div>

                    <div className="inventory-box">
                        <h5><FaSuitcase size={12}/> INVENTÁRIO RÁPIDO</h5>
                        <div className="loot-list">
                            {rpDetails.loot.map((item, idx) => (
                                <span key={idx} className="loot-item">{item}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="npc-stats-grid">
                    <div className="stat-block">
                        <h4>INSTINTOS</h4>
                        <ul>
                            {Object.entries(npc.instincts).map(([k, v]) => (
                                <li key={k}>
                                    <span>{translateKey(k)}</span>
                                    <strong>{v}</strong>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="stat-block">
                        <h4>PERÍCIAS</h4>
                        <ul>
                            {Object.entries({...npc.knowledge, ...npc.practices})
                                .filter(([_, v]) => v > 0)
                                .map(([k, v]) => (
                                <li key={k}>
                                    <span>{translateKey(k)}</span>
                                    <strong>+{v}</strong>
                                </li>
                            ))}
                            {Object.values({...npc.knowledge, ...npc.practices}).every(v => v === 0) && <li>Nenhuma</li>}
                        </ul>
                    </div>
                </div>

                <div className="npc-footer">
                    <div className="pack-info">Pacote Sugerido: {npc.initialPack}</div>
                    <button className="btn-save" onClick={handleSave}>
                        <FaSave /> SALVAR NA CAMPANHA
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default NPCGenerator;