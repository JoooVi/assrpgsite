import React, { useState, useEffect } from "react";
import CharacteristicsMenu from "./CharacteristicsMenu";
import { getItemImageUrl, normalizeItemImageFields } from "../utils/itemImages";
import Dialog from "./ui/Dialog";

// --- DADOS ESTÁTICOS ---
const scarcityLevels = { 
  0: 'Abundante', 1: 'Pedra', 2: 'Comum', 
  3: 'Incomum', 4: 'Atípico', 5: 'Raro', 6: 'Quase Extinto' 
};

const qualityLevels = {
  0: "Quebrado", 1: "Defeituoso", 2: "Comprometido", 
  3: "Padrão", 4: "Reforçado", 5: "Superior", 6: "Obra-Prima",
};

const resourceTypes = ['agua', 'comida', 'combustivel', 'pecas'];

// --- ESTILOS CSS INLINE ---
const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'radial-gradient(circle at 50% 20%, rgba(138, 28, 24, 0.22), rgba(0, 0, 0, 0.84) 48%, rgba(0, 0, 0, 0.92))',
    zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(8px)',
    padding: 20,
    boxSizing: 'border-box'
  },
  modal: {
    background: 'linear-gradient(180deg, rgba(18,18,18,0.98), rgba(7,7,7,0.99))',
    border: '1px solid rgba(255,255,255,0.12)',
    borderTop: '4px solid #8a1c18',
    width: '90%', maxWidth: '800px', maxHeight: '90vh',
    overflowY: 'auto', borderRadius: '0',
    boxShadow: '0 24px 70px rgba(0,0,0,0.9)', color: '#e0e0e0',
    fontFamily: '"Roboto Condensed", sans-serif',
    animation: 'fadeIn 0.2s ease-out'
  },
  header: {
    padding: '16px 24px', borderBottom: '1px solid #333',
    fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'linear-gradient(90deg, rgba(138,28,24,0.18), #151515 44%)'
  },
  body: {
    padding: '24px', display: 'flex', flexWrap: 'wrap', gap: '20px'
  },
  column: {
    flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '15px'
  },
  footer: {
    padding: '16px 24px', borderTop: '1px solid #333',
    display: 'flex', justifyContent: 'flex-end', gap: '10px',
    backgroundColor: '#111'
  },
  label: {
    display: 'block', fontSize: '0.8rem', color: '#9ca3af', 
    fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px'
  },
  input: {
    width: '100%', padding: '10px', backgroundColor: '#1f1f1f',
    border: '1px solid #333', borderRadius: '0', color: '#fff',
    fontSize: '0.95rem', fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%', padding: '10px', backgroundColor: '#1f1f1f',
    border: '1px solid #333', borderRadius: '0', color: '#fff',
    fontSize: '0.95rem', cursor: 'pointer'
  },
  checkboxContainer: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px', border: '1px solid #333', borderRadius: '0',
    backgroundColor: '#1a1a1a'
  },
  btn: {
    padding: '10px 20px', border: 'none', borderRadius: '0',
    cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase',
    fontSize: '0.9rem', transition: '0.2s'
  },
  btnPrimary: {
    backgroundColor: '#b71c1c', color: '#fff',
  },
  btnSecondary: {
    backgroundColor: 'transparent', color: '#bbb', border: '1px solid #444'
  },
  flagsBox: {
    padding: '15px', border: '1px solid #444', borderRadius: '0',
    backgroundColor: 'rgba(255,255,255,0.02)'
  },
  charList: {
    maxHeight: '150px', overflowY: 'auto', 
    backgroundColor: '#111', border: '1px solid #333', padding: '10px',
    listStyle: 'none', marginTop: '5px'
  }
};

const EditItemDialog = ({ editItem, onClose, onSave }) => {
  const [editedData, setEditedData] = useState(null);
  const [showCharacteristicsMenu, setShowCharacteristicsMenu] = useState(false);

  useEffect(() => {
    setShowCharacteristicsMenu(false);

    if (editItem && editItem.invItemData) {
      const sourceItemData = editItem.invItemData.itemData || editItem.invItemData.item;
      
      if (sourceItemData) {
        setEditedData({
            originalItemId: sourceItemData.originalItemId || editItem.invItemData.item?._id || null,
            name: sourceItemData.name || 'Nome Desconhecido',
            type: sourceItemData.type || 'Desconhecido',
            ...normalizeItemImageFields(sourceItemData),
            category: sourceItemData.category ?? 3,
            slots: sourceItemData.slots ?? 1,
            quality: editItem.invItemData.quality ?? 3,
            modifiers: sourceItemData.modifiers || [],
            isArtefato: sourceItemData.isArtefato || false,
            resourceType: sourceItemData.resourceType || null,
            isConsumable: sourceItemData.isConsumable || false,
            description: sourceItemData.description || "",
            characteristics: sourceItemData.characteristics ? JSON.parse(JSON.stringify(sourceItemData.characteristics)) : { points: 0, details: [] },
        });
      } else {
         console.error("Dados inválidos no item");
         onClose();
      }
    } else {
      setEditedData(null);
    }
  }, [editItem, onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setEditedData((prev) => {
      let newValue = value;

      if (type === 'checkbox') newValue = checked;
      else if (name === 'modifiers') newValue = value.split(',').map(m => m.trim());
      else if (['slots', 'quality', 'category'].includes(name)) newValue = parseInt(value) || 0;

      if (name === 'type' && !['Recurso', 'Consumivel', 'Consumível'].includes(newValue)) {
          return { ...prev, type: newValue, resourceType: null, isConsumable: false };
      }
      if (name === 'resourceType' && value === 'nenhum') {
          return { ...prev, resourceType: null };
      }

      return { ...prev, [name]: newValue };
    });
  };

  const handleCharacteristicsChange = (returnedItem) => {
     const newChars = returnedItem.characteristics; 

     // Verificação de segurança para evitar o erro de .map undefined
     if (!newChars || !newChars.details) return;

     setEditedData(prev => {
        const newCharNames = newChars.details.map(c => c.name);
        
        let currentModifiers = [...(prev.modifiers || [])];

        newCharNames.forEach(name => {
           if (!currentModifiers.includes(name)) {
              currentModifiers.push(name);
           }
        });

        return { 
           ...prev, 
           characteristics: newChars, // Salva a estrutura completa (points + details)
           modifiers: currentModifiers 
        };
     });
     
     setShowCharacteristicsMenu(false);
  };

  const handleSave = () => {
    if (editedData) {
      onSave(editItem.invItemData, editedData);
      onClose();
    }
  };

  if (!editItem || !editedData) return null;

  return (
    <>
      <Dialog
        open={!!editItem && !!editedData}
        onClose={onClose}
        title="Editar item"
        description="Inventário do personagem"
        size="large"
        className="edit-item-dialog"
        closeOnEscape={!showCharacteristicsMenu}
        closeOnOverlay={!showCharacteristicsMenu}
        actions={<><button type="button" style={{...styles.btn, ...styles.btnSecondary}} onClick={onClose}>Cancelar</button><button type="button" style={{...styles.btn, ...styles.btnPrimary}} onClick={handleSave}>Salvar alterações</button></>}
      >
          {/* Corpo do Formulário */}
          <div style={styles.body}>
            <div style={{
              width:'100%',
              display:'flex',
              gap:16,
              alignItems:'center',
              padding:'14px 16px',
              border:'1px solid #333',
              background:'linear-gradient(90deg, rgba(138,28,24,0.1), rgba(255,255,255,0.02))'
            }}>
              <div style={{
                width:58,
                height:58,
                display:'grid',
                placeItems:'center',
                background:'#0b0b0b',
                border:'1px solid #333',
                color:'#555',
                fontWeight:800
              }}>
                {getItemImageUrl(editedData) ? (
                  <img src={getItemImageUrl(editedData)} alt="" style={{maxWidth:'100%', maxHeight:'100%', objectFit:'contain'}} />
                ) : (
                  editedData.name?.charAt(0)?.toUpperCase() || "I"
                )}
              </div>
              <div>
                <div style={{color:'#fff', fontWeight:800, textTransform:'uppercase', letterSpacing:1}}>{editedData.name}</div>
                <div style={{color:'#888', fontSize:'0.82rem', textTransform:'uppercase'}}>{editedData.type} · {editedData.slots} slot(s)</div>
              </div>
            </div>
            
            {/* Coluna Esquerda: Dados Básicos */}
            <div style={styles.column}>
              <div>
                  <label style={styles.label}>NOME</label>
                  <input style={styles.input} name="name" value={editedData.name} onChange={handleChange} />
              </div>

              <div style={{display: 'flex', gap: '10px'}}>
                  <div style={{flex: 1}}>
                      <label style={styles.label}>QUALIDADE</label>
                      <select style={styles.select} name="quality" value={editedData.quality} onChange={handleChange}>
                          {Object.entries(qualityLevels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                  </div>
                  <div style={{flex: 1}}>
                      <label style={styles.label}>ESCASSEZ</label>
                      <select style={styles.select} name="category" value={editedData.category} onChange={handleChange}>
                          {Object.entries(scarcityLevels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                  </div>
              </div>

              <div>
                  <label style={styles.label}>TIPO</label>
                  <input style={styles.input} name="type" value={editedData.type} onChange={handleChange} placeholder="Ex: Arma, Recurso..." />
              </div>

              <div style={{display: 'flex', gap: '10px'}}>
                  <div style={{flex:1}}>
                      <label style={styles.label}>SLOTS</label>
                      <input style={styles.input} type="number" name="slots" value={editedData.slots} onChange={handleChange} />
                  </div>
                  <div style={{flex:2}}>
                      <label style={styles.label}>MODIFICADORES (Sep. Vírgula)</label>
                      <input style={styles.input} name="modifiers" value={editedData.modifiers?.join(', ') || ''} onChange={handleChange} placeholder="Ex: Pesado, Pequeno" />
                  </div>
              </div>
            </div>

            {/* Coluna Direita: Flags e Descrição */}
            <div style={styles.column}>
               
               {/* FLAGS BOX */}
               <div style={styles.flagsBox}>
                  <label style={styles.label}>CONFIGURAÇÕES</label>
                  <div style={{display:'flex', gap:'15px', flexWrap:'wrap', marginTop:'10px'}}>
                      <label style={{color:'#ccc', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px'}}>
                          <input type="checkbox" name="isArtefato" checked={editedData.isArtefato} onChange={handleChange} /> 
                          Artefato
                      </label>
                      <label style={{color:'#ccc', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px'}}>
                          <input type="checkbox" name="isConsumable" checked={editedData.isConsumable} onChange={handleChange} /> 
                          Consumível
                      </label>
                  </div>
                  
                  <div style={{marginTop:'10px'}}>
                      <label style={styles.label}>RECURSO</label>
                      <select style={{...styles.select, padding:'5px'}} name="resourceType" value={editedData.resourceType || 'nenhum'} onChange={handleChange}>
                          <option value="nenhum">Nenhum</option>
                          {resourceTypes.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                      </select>
                  </div>
               </div>

               <div>
                  <label style={styles.label}>DESCRIÇÃO</label>
                  <textarea 
                      style={{...styles.input, resize: 'vertical', minHeight: '80px'}} 
                      name="description" 
                      value={editedData.description} 
                      onChange={handleChange} 
                  />
               </div>

               {/* Características */}
               <div style={{background:'linear-gradient(180deg, #151515, #0d0d0d)', padding:'14px', borderRadius:'0', border:'1px solid #333', borderLeft:'3px solid #8a1c18'}}>
                  {/* ALTERADO: Header flexível com input de pontos */}
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:'8px', marginBottom:'8px', flexWrap:'wrap'}}>
                      <label style={{...styles.label, marginBottom:0}}>CARACTERÍSTICAS</label>
                      
                      {/* Novo Input de Pontos */}
                      <div style={{display:'flex', alignItems:'center', gap:'5px', height:'28px', padding:'0 7px', background:'#101010', border:'1px solid #333', marginLeft:'auto'}}>
                        <span style={{fontSize:'0.66rem', color:'#888', fontWeight:'900', letterSpacing:'0.08em'}}>PTS</span>
                        <input 
                            type="number"
                            value={editedData.characteristics?.points || 0}
                            onChange={(e) => setEditedData(prev => ({
                                ...prev,
                                characteristics: {
                                    ...prev.characteristics,
                                    points: parseInt(e.target.value) || 0
                                }
                            }))}
                            style={{
                                width: '40px', 
                                padding: '2px 4px', 
                                background: '#1d1d1d', 
                                border: '1px solid #3a3a3a', 
                                color: '#fff', 
                                textAlign: 'center',
                                borderRadius: '0',
                                fontSize: '0.78rem',
                                fontWeight: 800
                            }}
                        />
                      </div>

                      <button 
                        type="button"
                        title="Editar"
                        style={{width:'66px', height:'28px', overflow:'hidden', background:'rgba(138,28,24,0.2)', border:'1px solid #631713', color:'#fff', fontSize:'0.64rem', letterSpacing:'0.08em', cursor:'pointer', borderRadius:'0', padding:'0 9px', textTransform:'uppercase', fontWeight:900, whiteSpace:'nowrap'}} 
                        onClick={() => setShowCharacteristicsMenu(true)}
                      >Editar</button>
                  </div>
                  
                  <div style={{display:'flex', flexWrap:'wrap', gap:'6px', marginTop:'12px', maxHeight:'110px', overflowY:'auto'}}>
                      {(editedData.characteristics?.details?.length > 0) ? 
                          editedData.characteristics.details.map((c, i) => (
                              <span key={i} style={{display:'inline-flex', alignItems:'center', gap:'5px', padding:'5px 8px', border:'1px solid #333', background:'#191919', color:'#ddd', fontSize:'0.82rem', fontWeight:700}}>
                                {c.name}
                                <span style={{color:'#ff5555', fontSize:'0.78em'}}>({c.cost})</span>
                              </span>
                          )) 
                      : <span style={{color:'#666'}}>Nenhuma característica aplicada.</span>}
                  </div>
               </div>

            </div>
          </div>

      </Dialog>

      {showCharacteristicsMenu && (
        <CharacteristicsMenu
          open={showCharacteristicsMenu}
          item={{ characteristics: editedData.characteristics }}
          onClose={() => setShowCharacteristicsMenu(false)}
          onChange={handleCharacteristicsChange}
        />
      )}
    </>
  );
};

export default EditItemDialog;
