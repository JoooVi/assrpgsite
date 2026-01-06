/* ConflictTracker.js */
import React, { useState } from 'react';
import { FaPlus, FaTrash, FaTimes, FaSkull, FaBullseye } from 'react-icons/fa';
import styles from '../pages/CampaignSheet.module.css'; 

// Templates
const newObjectiveTemplate = { name: '', type: 'principal', cost: 10, progress: 0 };
const newThreatTemplate = { name: '', diceFormula: '3d10', activations: [{ name: '', type: 'C', cost: 3, progress: 0 }] };
const newActivationTemplate = { name: '', type: 'C', cost: 3, progress: 0 };

const ConflictTracker = ({ open, onClose, onStartConflict }) => {
  const [objectives, setObjectives] = useState([{ ...newObjectiveTemplate, name: 'Objetivo Principal' }]);
  const [threats, setThreats] = useState([{ ...newThreatTemplate, name: 'Ameaça Padrão' }]);
  const [conditions, setConditions] = useState('');

  // Handlers (iguais ao anterior)
  const handleObjectiveChange = (i, f, v) => { const u = [...objectives]; u[i][f] = v; setObjectives(u); };
  const addObjective = () => setObjectives([...objectives, { ...newObjectiveTemplate }]);
  const removeObjective = (i) => setObjectives(objectives.filter((_, idx) => idx !== i));

  const handleThreatChange = (i, f, v) => { const u = [...threats]; u[i][f] = v; setThreats(u); };
  const addThreat = () => setThreats([...threats, { ...newThreatTemplate }]);
  const removeThreat = (i) => setThreats(threats.filter((_, idx) => idx !== i));

  const handleActivationChange = (ti, ai, f, v) => { const u = [...threats]; u[ti].activations[ai][f] = v; setThreats(u); };
  const addActivation = (ti) => { const u = [...threats]; u[ti].activations.push({ ...newActivationTemplate }); setThreats(u); };
  const removeActivation = (ti, ai) => { const u = [...threats]; u[ti].activations = u[ti].activations.filter((_, idx) => idx !== ai); setThreats(u); };
  
  const handleStart = () => { onStartConflict({ objectives, threats, conditions }); onClose(); };

  if (!open) return null;

  return (
    <div className="nero-modal-overlay" style={{
        position:'fixed', top:0, left:0, right:0, bottom:0,
        background:'rgba(0,0,0,0.95)', zIndex:2000, display:'flex', justifyContent:'center', alignItems:'center',
        backdropFilter: 'blur(8px)'
    }}>
      <div className={styles.shieldColumn} style={{
          width:'95%', maxWidth:'900px', height:'90vh', 
          background:'#0a0a0a', border:'1px solid #333', borderTop:'3px solid #8a1c18',
          display:'flex', flexDirection:'column', boxShadow: '0 0 50px rgba(0,0,0,0.8)'
      }}>
        
        {/* HEADER */}
        <div className={styles.columnHeader} style={{display:'flex', justifyContent:'space-between', padding:'20px', background:'#111'}}>
          <span style={{fontFamily:'Orbitron', fontSize:'1.2rem', color:'#fff'}}>CONFIGURAR CENA DE CONFLITO</span>
          <button onClick={onClose} style={{background:'transparent', border:'none', color:'#888', cursor:'pointer'}}><FaTimes size={20}/></button>
        </div>
        
        {/* BODY */}
        <div className={styles.scrollableContent} style={{padding:'30px', overflowY:'auto'}}>
            
            {/* OBJETIVOS */}
            <div style={{marginBottom:'40px'}}>
                <h4 style={{color:'#ddd', borderBottom:'1px solid #333', paddingBottom:'10px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px'}}>
                    <FaBullseye style={{color:'#3cdce7'}}/> OBJETIVOS (JOGADORES)
                </h4>
                
                {objectives.map((obj, index) => (
                    <div key={index} style={{
                        display:'grid', gridTemplateColumns:'3fr 1.5fr 1fr auto', gap:'15px', marginBottom:'15px', alignItems:'end',
                        background:'#111', padding:'15px', border:'1px solid #222', borderRadius:'4px'
                    }}>
                        <div>
                            <label className={styles.commandLabel}>DESCRIÇÃO</label>
                            <input type="text" className={styles.diceInput} value={obj.name} onChange={e => handleObjectiveChange(index, 'name', e.target.value)} placeholder="Ex: Hackear o Terminal" />
                        </div>
                        <div>
                            <label className={styles.commandLabel}>TIPO</label>
                            <select className={styles.neroSelect} value={obj.type} onChange={e => handleObjectiveChange(index, 'type', e.target.value)} style={{height:'42px'}}>
                                <option value="principal">Principal</option>
                                <option value="secundario">Secundário</option>
                            </select>
                        </div>
                        <div>
                            <label className={styles.commandLabel}>CUSTO</label>
                            <input type="number" className={styles.diceInput} value={obj.cost} onChange={e => handleObjectiveChange(index, 'cost', Number(e.target.value))} style={{textAlign:'center'}} />
                        </div>
                        <button onClick={() => removeObjective(index)} className={styles.btnTrash} title="Remover"><FaTrash size={18}/></button>
                    </div>
                ))}
                
                <button className={styles.btnAdd} onClick={addObjective}><FaPlus/> ADICIONAR OBJETIVO</button>
            </div>

            {/* AMEAÇAS */}
            <div style={{marginBottom:'40px'}}>
                <h4 style={{color:'#ff3333', borderBottom:'1px solid #333', paddingBottom:'10px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px'}}>
                    <FaSkull/> AMEAÇAS (MESTRE)
                </h4>
                
                {threats.map((threat, tIndex) => (
                    <div key={tIndex} style={{background:'#111', padding:'20px', border:'1px solid #333', marginBottom:'20px', borderLeft:'3px solid #8a1c18'}}>
                        <div style={{display:'flex', gap:'15px', marginBottom:'20px', alignItems:'end'}}>
                            <div style={{flex:3}}>
                                <label className={styles.commandLabel}>NOME DA AMEAÇA</label>
                                <input type="text" className={styles.diceInput} value={threat.name} onChange={e => handleThreatChange(tIndex, 'name', e.target.value)} placeholder="Ex: Guarda de Elite" />
                            </div>
                            <div style={{flex:1}}>
                                <label className={styles.commandLabel}>DADOS</label>
                                <input type="text" className={styles.diceInput} value={threat.diceFormula} onChange={e => handleThreatChange(tIndex, 'diceFormula', e.target.value)} placeholder="3d10" style={{textAlign:'center'}} />
                            </div>
                            <button onClick={() => removeThreat(tIndex)} className={styles.btnTrash} title="Remover"><FaTrash size={20}/></button>
                        </div>

                        {/* ATIVAÇÕES */}
                        <div style={{paddingLeft:'20px', borderLeft:'1px dashed #444', marginLeft:'5px'}}>
                            <label className={styles.commandLabel} style={{marginBottom:'15px', color:'#888'}}>ATIVAÇÕES ESPECIAIS:</label>
                            
                            {threat.activations.map((act, aIndex) => (
                                <div key={aIndex} style={{display:'grid', gridTemplateColumns:'3fr 1.5fr 1fr auto', gap:'10px', marginBottom:'10px', alignItems:'center'}}>
                                    <input type="text" className={styles.diceInput} value={act.name} onChange={e => handleActivationChange(tIndex, aIndex, 'name', e.target.value)} placeholder="Nome da Habilidade" style={{fontSize:'0.9rem', padding:'8px', marginBottom:0}}/>
                                    <select className={styles.neroSelect} value={act.type} onChange={e => handleActivationChange(tIndex, aIndex, 'type', e.target.value)} style={{fontSize:'0.9rem', padding:'8px', height:'35px'}}>
                                        <option value="C"> Pressão (Desfavorável)</option>
                                        <option value="A"> Sucesso (Favorável)</option>
                                    </select>
                                    <input type="number" className={styles.diceInput} value={act.cost} onChange={e => handleActivationChange(tIndex, aIndex, 'cost', Number(e.target.value))} style={{fontSize:'0.9rem', padding:'8px', textAlign:'center', marginBottom:0}}/>
                                    <button onClick={() => removeActivation(tIndex, aIndex)} className={styles.btnTrash} style={{padding:'5px'}}><FaTimes size={16}/></button>
                                </div>
                            ))}
                            
                            <button className={styles.btnAdd} onClick={() => addActivation(tIndex)} style={{fontSize:'0.8rem', padding:'5px', marginTop:'10px', width:'auto', display:'inline-flex'}}>
                                <FaPlus style={{marginRight:'5px'}}/> NOVA ATIVAÇÃO
                            </button>
                        </div>
                    </div>
                ))}
                
                <button className={styles.btnAdd} onClick={addThreat}><FaPlus/> NOVA AMEAÇA</button>
            </div>

            {/* CONDICIONANTES */}
            <div>
                <h4 style={{color:'#fff', borderBottom:'1px dashed #333', paddingBottom:'5px', marginBottom:'15px'}}>CONDICIONANTES / REGRAS DE CENA</h4>
                <textarea 
                    className={styles.notesArea} 
                    rows="3" 
                    value={conditions} 
                    onChange={e => setConditions(e.target.value)} 
                    placeholder="Regras especiais da cena..."
                    style={{background:'#111', border:'1px solid #333'}}
                />
            </div>

        </div>

        {/* FOOTER */}
        <div style={{padding:'20px', borderTop:'1px solid #222', display:'flex', justifyContent:'flex-end', gap:'15px', background:'#151515'}}>
            <button onClick={onClose} className={styles.btnCancel}>CANCELAR</button>
            <button onClick={handleStart} className={styles.btnCommand}>INICIAR CONFLITO</button>
        </div>

      </div>
    </div>
  );
};

export default ConflictTracker;