import React, { useState } from "react";
import { useSelector } from "react-redux";
import { FaSearch, FaTimes, FaPlus, FaChevronDown, FaChevronUp } from "react-icons/fa";
import "../pages/Homebrews.css"; 

const CharacteristicsModal = ({
  open,
  handleClose,
  items = [], 
  homebrewItems = [], 
  onItemSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const { characterTraits = [] } = useSelector((state) => state.characteristics);
  const traitsPool = items.length > 0 ? items : characterTraits;
  let displayList = [...traitsPool];
  if (homebrewItems.length > 0) {
      displayList = [...displayList, ...homebrewItems];
  }
  
  const filteredList = displayList
    .filter((item, index, self) => self.findIndex(t => t._id === item._id) === index)
    .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const toggleExpand = (id) => {
      setExpandedId(expandedId === id ? null : id);
  };

  if (!open) return null;

  // ESTILOS INLINE PARA GARANTIR FIXAÇÃO NA TELA (E não na página)
  const overlayStyle = {
    position: 'fixed', // O segredo: Fixado na janela
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 99999, // Garante que fica em cima de tudo, até da Navbar
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(3px)'
  };

  const modalPanelStyle = {
    width: '90%',
    maxWidth: '500px',
    backgroundColor: '#121212',
    border: '1px solid #444',
    borderRadius: '4px',
    boxShadow: '0 0 50px rgba(0,0,0,1)',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '85vh', // Não deixa estourar a altura da tela no mobile
  };

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div style={modalPanelStyle} className="nero-modal">
        {/* HEADER */}
        <div className="nero-modal-header" style={{flexShrink: 0, display:'flex', justifyContent:'space-between', padding:'15px', borderBottom:'1px solid #333', background:'#1a1a1a'}}>
          <span style={{fontWeight:'bold', color:'#fff'}}>SELECIONAR CARACTERÍSTICA</span>
          <button onClick={handleClose} style={{background:'transparent', border:'none', color:'#888', cursor:'pointer'}}><FaTimes size={18}/></button>
        </div>

        {/* BODY COM SCROLL INTERNO */}
        <div className="nero-modal-body" style={{padding:'20px', overflowY:'auto', flex: 1}}>
            <div style={{position:'relative', marginBottom:'20px'}}>
                <FaSearch style={{position:'absolute', left:'10px', top:'12px', color:'#666'}}/>
                <input 
                    type="text" 
                    className="nero-input" 
                    placeholder="Buscar..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{paddingLeft:'35px', width:'100%', boxSizing:'border-box'}}
                />
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                {filteredList.map((item) => (
                    <div key={item._id} className={`hb-card ${expandedId === item._id ? 'expanded' : ''}`} style={{background:'#1a1a1a', borderRadius:'4px'}}>
                        
                        <div className="hb-card-header" onClick={() => toggleExpand(item._id)} style={{padding:'12px'}}>
                             <span className="hb-card-title">{item.name}</span>
                             <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                 {item.isCustom && <span style={{fontSize:'0.6rem', background:'#333', border:'1px solid #555', color:'#aaa', padding:'2px 5px', borderRadius:'2px'}}>HB</span>}
                                 {expandedId === item._id ? <FaChevronUp size={12}/> : <FaChevronDown size={12}/>}
                             </div>
                        </div>

                        {expandedId === item._id && (
                            <div className="hb-card-body" style={{padding:'10px', background:'#222'}}>
                                <div style={{marginBottom:'5px', color:'#ccc'}}><strong>Categoria:</strong> {item.category}</div>
                                <div style={{marginBottom:'10px', color:'#ccc'}}><strong>Custo:</strong> {item.pointsCost}</div>
                                <div style={{fontSize:'0.9rem', color:'#999', marginBottom:'15px', lineHeight:'1.4'}}>{item.description}</div>
                                
                                <button 
                                    className="btn-nero btn-primary" 
                                    style={{width:'100%', padding:'10px'}}
                                    onClick={() => onItemSelect(item)}
                                >
                                    <FaPlus style={{marginRight:'5px'}}/> ADICIONAR
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                {filteredList.length === 0 && <p style={{textAlign:'center', color:'#666'}}>Nenhuma encontrada.</p>}
            </div>
        </div>

        {/* FOOTER */}
        <div className="nero-modal-footer" style={{padding:'15px', borderTop:'1px solid #333', background:'#1a1a1a', flexShrink:0, display:'flex', justifyContent:'flex-end'}}>
           <button className="btn-nero" onClick={handleClose} style={{padding:'8px 20px', background:'transparent', border:'1px solid #444', color:'#ccc'}}>FECHAR</button>
        </div>

      </div>
    </div>
  );
};

export default CharacteristicsModal;