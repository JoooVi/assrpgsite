/* src/components/CharacteristicsModal.js */
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { FaSearch, FaTimes, FaPlus, FaChevronDown, FaChevronUp } from "react-icons/fa";
import "../pages/Homebrews.css"; // Garante que os estilos .nero-* funcionem

const CharacteristicsModal = ({
  open,
  handleClose,
  title,
  items = [], // Características do sistema passadas como prop
  homebrewItems = [], // Personalizadas passadas como prop (opcional)
  onItemSelect,
  onCreateNewHomebrew,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const user = useSelector((state) => state.auth.user);
  
  // Se as props vierem vazias, tenta pegar do Redux (safety check)
  const { characterTraits = [] } = useSelector((state) => state.characteristics);

  // Lógica de Combinação de Listas
  const traitsPool = items.length > 0 ? items : characterTraits;
  
  // Junta listas se homebrewItems for passado, ou filtra do pool principal
  let displayList = [...traitsPool];
  if (homebrewItems.length > 0) {
      displayList = [...displayList, ...homebrewItems];
  }
  
  // Remover duplicatas e filtrar por busca
  const filteredList = displayList
    .filter((item, index, self) => self.findIndex(t => t._id === item._id) === index) // Unique
    .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const toggleExpand = (id) => {
      setExpandedId(expandedId === id ? null : id);
  };

  if (!open) return null;

  return (
    <div className="nero-modal-overlay" onClick={(e) => e.target.className === 'nero-modal-overlay' && handleClose()}>
      <div className="nero-modal">
        {/* HEADER */}
        <div className="nero-modal-header">
          <span style={{display:'flex', alignItems:'center', gap:'10px'}}>
            SELECIONAR CARACTERÍSTICA
          </span>
          <button onClick={handleClose} style={{background:'transparent', border:'none', color:'#888', cursor:'pointer'}}>
              <FaTimes size={18}/>
          </button>
        </div>

        {/* BODY */}
        <div className="nero-modal-body">
            {/* BARRA DE BUSCA */}
            <div style={{position:'relative', marginBottom:'20px'}}>
                <FaSearch style={{position:'absolute', left:'10px', top:'12px', color:'#666'}}/>
                <input 
                    type="text" 
                    className="nero-input" 
                    placeholder="Buscar característica..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{paddingLeft:'35px'}}
                />
            </div>

            {/* LISTA DE ITENS */}
            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                {filteredList.map((item) => (
                    <div key={item._id} className={`hb-card ${expandedId === item._id ? 'expanded' : ''}`} style={{background:'#121212'}}>
                        
                        <div className="hb-card-header" onClick={() => toggleExpand(item._id)} style={{padding:'12px'}}>
                             <span className="hb-card-title">{item.name}</span>
                             <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                 {item.isCustom && <span style={{fontSize:'0.7rem', background:'#333', padding:'2px 6px', borderRadius:'2px', color:'#aaa'}}>Homebrew</span>}
                                 {expandedId === item._id ? <FaChevronUp size={12}/> : <FaChevronDown size={12}/>}
                             </div>
                        </div>

                        {expandedId === item._id && (
                            <div className="hb-card-body">
                                <div className="hb-info-row"><span className="hb-label">CATEGORIA</span> {item.category}</div>
                                <div className="hb-info-row"><span className="hb-label">CUSTO</span> {item.pointsCost} Pts</div>
                                <div className="hb-desc-box">{item.description}</div>
                                
                                <button 
                                    className="btn-nero btn-primary" 
                                    style={{marginTop:'15px', width:'100%', justifyContent:'center'}}
                                    onClick={() => onItemSelect(item)}
                                >
                                    <FaPlus/> ADICIONAR
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                {filteredList.length === 0 && <p style={{textAlign:'center', color:'#666'}}>Nenhuma característica encontrada.</p>}
            </div>
        </div>

        {/* FOOTER */}
        <div className="nero-modal-footer">
           {/* Botão opcional para criar nova direto daqui se quiser implementar depois */}
           <div style={{flex:1}}></div> 
           <button className="btn-nero" onClick={handleClose}>FECHAR</button>
        </div>

      </div>
    </div>
  );
};

export default CharacteristicsModal;