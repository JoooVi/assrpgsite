import React, { useState, useEffect } from "react";
// O componente de CharacteristicsMenu precisa ser compatível ou removido se usar MUI
// Assumindo que ele ainda use MUI, podemos deixá-lo encapsulado ou refatorar depois.
import CharacteristicsMenu from "./CharacteristicsMenu";

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
    backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(3px)'
  },
  modal: {
    backgroundColor: '#161616', border: '1px solid #444',
    width: '90%', maxWidth: '800px', maxHeight: '90vh',
    overflowY: 'auto', borderRadius: '4px',
    boxShadow: '0 10px 40px rgba(0,0,0,1)', color: '#e0e0e0',
    fontFamily: '"Roboto Condensed", sans-serif',
    animation: 'fadeIn 0.2s ease-out'
  },
  header: {
    padding: '16px 24px', borderBottom: '1px solid #333',
    fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#111'
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
    border: '1px solid #333', borderRadius: '3px', color: '#fff',
    fontSize: '0.95rem', fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%', padding: '10px', backgroundColor: '#1f1f1f',
    border: '1px solid #333', borderRadius: '3px', color: '#fff',
    fontSize: '0.95rem', cursor: 'pointer'
  },
  checkboxContainer: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px', border: '1px solid #333', borderRadius: '4px',
    backgroundColor: '#1a1a1a'
  },
  btn: {
    padding: '10px 20px', border: 'none', borderRadius: '3px',
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
    padding: '15px', border: '1px solid #444', borderRadius: '4px',
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

      if (name === 'type' && !['Recurso', 'Consumivel'].includes(newValue)) {
          return { ...prev, type: newValue, resourceType: null, isConsumable: false };
      }
      if (name === 'resourceType' && value === 'nenhum') {
          return { ...prev, resourceType: null };
      }

      return { ...prev, [name]: newValue };
    });
  };

  // EditItemDialog.js

  const handleCharacteristicsChange = (returnedItem) => {
     // O CharacteristicsMenu retorna um objeto { characteristics: { details: [], points: X } }
     // Precisamos extrair o objeto 'characteristics' de dentro dele.
     const newChars = returnedItem.characteristics; 

     // Verificação de segurança para evitar o erro de .map undefined
     if (!newChars || !newChars.details) return;

     setEditedData(prev => {
        // Agora sim acessamos .details corretamente
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
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          
          {/* Cabeçalho */}
          <div style={styles.header}>
            <span>EDITAR ITEM</span>
            <button onClick={onClose} style={{background:'none', border:'none', color:'#888', cursor:'pointer', fontSize:'1.5rem'}}>×</button>
          </div>

          {/* Corpo do Formulário */}
          <div style={styles.body}>
            
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
               <div style={{background:'#111', padding:'10px', borderRadius:'4px', border:'1px solid #333'}}>
                  {/* ALTERADO: Header flexível com input de pontos */}
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}}>
                      <label style={{...styles.label, marginBottom:0}}>CARACTERÍSTICAS</label>
                      
                      {/* Novo Input de Pontos */}
                      <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                        <span style={{fontSize:'0.75rem', color:'#888', fontWeight:'bold'}}>PTS:</span>
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
                                width: '50px', 
                                padding: '4px', 
                                background: '#222', 
                                border: '1px solid #444', 
                                color: '#fff', 
                                textAlign: 'center',
                                borderRadius: '3px'
                            }}
                        />
                      </div>

                      <button 
                        style={{background:'none', border:'1px solid #555', color:'#aaa', fontSize:'0.7rem', cursor:'pointer', borderRadius:'2px', padding:'2px 6px'}} 
                        onClick={() => setShowCharacteristicsMenu(true)}
                      >
                          GERENCIAR
                      </button>
                  </div>
                  
                  <ul style={{paddingLeft: '20px', margin: 0, color:'#ccc', fontSize:'0.9rem', maxHeight:'100px', overflowY:'auto'}}>
                      {(editedData.characteristics?.details?.length > 0) ? 
                          editedData.characteristics.details.map((c, i) => (
                              <li key={i}>{c.name} <span style={{color:'#666', fontSize:'0.8em'}}>({c.cost})</span></li>
                          )) 
                      : <li style={{color:'#666', listStyle:'none'}}>Nenhuma</li>}
                  </ul>
               </div>

            </div>
          </div>

          {/* Rodapé com Ações */}
          <div style={styles.footer}>
            <button style={{...styles.btn, ...styles.btnSecondary}} onClick={onClose}>Cancelar</button>
            <button style={{...styles.btn, ...styles.btnPrimary}} onClick={handleSave}>Salvar</button>
          </div>

        </div>
      </div>

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