import React, { useState } from "react";
import { useSelector } from "react-redux";
import { FaSearch, FaTimes, FaPlus, FaChevronDown, FaChevronUp, FaExclamationTriangle } from "react-icons/fa"; // Adicionei FaExclamationTriangle
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

  // FUNÇÃO PARA DESTACAR O REQUISITO
  const formatDescription = (text) => {
    // Regex: Procura por "Requisito:" no início até o primeiro ponto final
    const requirementRegex = /^(Requisito:.*?\.)(.*)/s;
    const match = text.match(requirementRegex);

    if (match) {
      return (
        <>
          <div className="trait-requirement-badge">
            <FaExclamationTriangle style={{ marginRight: '6px', fontSize: '0.7rem' }} />
            <strong>REQUISITO:</strong> {match[1].replace('Requisito:', '').trim()}
          </div>
          <div className="trait-description-text">{match[2].trim()}</div>
        </>
      );
    }

    // Se não tiver requisito, retorna o texto normal formatado
    return <div className="trait-description-text">{text}</div>;
  };

  if (!open) return null;

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 99999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(3px)'
  };

  const modalPanelStyle = {
    width: '95%',
    maxWidth: '500px',
    backgroundColor: '#121212',
    border: '1px solid #444',
    borderRadius: '4px',
    boxShadow: '0 0 50px rgba(0,0,0,1)',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '85vh',
  };

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div style={modalPanelStyle} className="nero-modal">
        <div className="nero-modal-header" style={{flexShrink: 0, display:'flex', justifyContent:'space-between', padding:'15px', borderBottom:'1px solid #333', background:'#1a1a1a'}}>
          <span style={{fontWeight:'bold', color:'#fff', letterSpacing: '1px'}}>SELECIONAR CARACTERÍSTICA</span>
          <button onClick={handleClose} style={{background:'transparent', border:'none', color:'#888', cursor:'pointer'}}><FaTimes size={18}/></button>
        </div>

        <div className="nero-modal-body" style={{padding:'20px', overflowY:'auto', flex: 1}}>
            <div style={{position:'relative', marginBottom:'20px'}}>
                <FaSearch style={{position:'absolute', left:'10px', top:'12px', color:'#666'}}/>
                <input 
                    type="text" 
                    className="nero-input" 
                    placeholder="Buscar característica..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{paddingLeft:'35px', width:'100%', boxSizing:'border-box'}}
                />
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                {filteredList.map((item) => (
                    <div key={item._id} className={`hb-card ${expandedId === item._id ? 'expanded' : ''}`} style={{background:'#1a1a1a', borderRadius:'4px', border: '1px solid #333'}}>
                        
                        <div className="hb-card-header" onClick={() => toggleExpand(item._id)} style={{padding:'12px', cursor: 'pointer'}}>
                             <span className="hb-card-title" style={{ color: expandedId === item._id ? '#750303ff' : '#eee', transition: '0.2s' }}>
                                {item.name}
                             </span>
                             <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                 <span style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'bold' }}>{item.pointsCost} PTS</span>
                                 {item.isCustom && <span style={{fontSize:'0.6rem', background:'#333', border:'1px solid #555', color:'#aaa', padding:'2px 5px', borderRadius:'2px'}}>HB</span>}
                                 {expandedId === item._id ? <FaChevronUp size={12} color="#666"/> : <FaChevronDown size={12} color="#666"/>}
                             </div>
                        </div>

                        {expandedId === item._id && (
                            <div className="hb-card-body" style={{padding:'15px', background:'#161616', borderTop: '1px solid #222'}}>
                                <div style={{marginBottom:'12px', fontSize: '0.75rem', color:'#555', textTransform: 'uppercase', letterSpacing: '1px'}}>
                                    <strong>Categoria:</strong> {item.category}
                                </div>
                                
                                {/* AQUI ENTRA A FORMATAÇÃO DO REQUISITO */}
                                <div style={{ marginBottom:'20px' }}>
                                    {formatDescription(item.description)}
                                </div>
                                
                                <button 
                                    className="btn-nero btn-primary" 
                                    style={{width:'100%', padding:'12px', fontWeight: 'bold'}}
                                    onClick={() => onItemSelect(item)}
                                >
                                    <FaPlus style={{marginRight:'8px'}}/> ADICIONAR
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                {filteredList.length === 0 && <p style={{textAlign:'center', color:'#666', marginTop: '20px'}}>Nenhuma característica encontrada.</p>}
            </div>
        </div>

        <div className="nero-modal-footer" style={{padding:'15px', borderTop:'1px solid #333', background:'#1a1a1a', flexShrink:0, display:'flex', justifyContent:'flex-end'}}>
           <button className="btn-nero" onClick={handleClose} style={{padding:'8px 20px', background:'transparent', border:'1px solid #444', color:'#ccc', fontSize: '0.8rem'}}>FECHAR</button>
        </div>
      </div>
    </div>
  );
};

export default CharacteristicsModal;