/* src/components/AssimilationsModal.js */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllAssimilations } from "../redux/slices/assimilationsSlice";
import { FaSearch, FaTimes, FaPlus, FaChevronDown, FaChevronUp, FaFilter } from "react-icons/fa";
import "../pages/Homebrews.css";

const AssimilationsModal = ({
  open,
  handleClose,
  onItemSelect
}) => {
  const dispatch = useDispatch();
  const { allAssimilations, userAssimilations, loading } = useSelector((state) => state.assimilations);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (open) {
      dispatch(fetchAllAssimilations());
    }
  }, [dispatch, open]);

  // Combinar e Remover Duplicatas
  const combined = [...allAssimilations, ...userAssimilations].reduce((acc, current) => {
      const x = acc.find(item => item._id === current._id);
      if (!x) { return acc.concat([current]); }
      return acc;
  }, []);

  // Categorias únicas para o filtro
  const categories = [...new Set(combined.map(item => item.category))].filter(Boolean);

  // Filtragem
  const filtered = combined
      .filter(item => !selectedCategory || item.category === selectedCategory)
      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // --- CORES DAS CARTAS ---
  const getEvolutionStyle = (type) => {
      const t = type ? type.toLowerCase() : "";
      
      if (t === 'copas') {
          return { color: '#ff5252' }; // Vermelho
      }
      if (t === 'espadas' || t === 'inoportuna') {
          return { color: '#4c86ff' }; // Azul
      }
      if (t === 'paus' || t === 'singular') {
          return { color: '#d05ce3' }; // Roxo (Paus/Singular)
      }
      if (t === 'ouros' || t === 'adaptativa') {
          // Mescla (Gradiente)
          return { 
            background: "linear-gradient(to right, #ff5252, #4c86ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            display: "inline-block",
            fontWeight: "bold"
          };
      }
      return { color: '#eee' }; // Padrão
  };

  if (!open) return null;

  return (
    <div className="nero-modal-overlay" onClick={(e) => e.target.className === 'nero-modal-overlay' && handleClose()}>
      <div className="nero-modal">
          <div className="nero-modal-header">
             <span>SELECIONAR ASSIMILAÇÃO</span>
             <button onClick={handleClose} style={{background:'transparent', border:'none', color:'#666', cursor:'pointer'}}><FaTimes size={18}/></button>
          </div>

          <div className="nero-modal-body">
              <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                   <div style={{position:'relative', flex:1}}>
                        <FaSearch style={{position:'absolute', left:'10px', top:'12px', color:'#666'}}/>
                        <input 
                            className="nero-input" 
                            placeholder="Buscar..." 
                            value={searchTerm} 
                            onChange={(e)=>setSearchTerm(e.target.value)} 
                            style={{paddingLeft:'35px'}}
                        />
                   </div>
                   <div style={{position:'relative', width:'150px'}}>
                       <FaFilter style={{position:'absolute', left:'10px', top:'12px', color:'#666'}}/>
                       <select 
                            className="nero-select" 
                            value={selectedCategory} 
                            onChange={(e)=>setSelectedCategory(e.target.value)}
                            style={{paddingLeft:'30px'}}
                        >
                            <option value="">TODAS</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                   </div>
              </div>

              {loading ? <div style={{textAlign:'center', color:'#fff'}}>Carregando dados...</div> : (
                 <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                     {filtered.map((item) => (
                         <div key={item._id} className={`hb-card ${expandedId === item._id ? 'expanded' : ''}`} style={{background:'#121212'}}>
                             
                             {/* HEADER */}
                             <div className="hb-card-header" onClick={() => setExpandedId(expandedId===item._id?null:item._id)} style={{padding:'12px'}}>
                                 <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                     
                                     {/* NOME + COR */}
                                     <span className="hb-card-title" style={getEvolutionStyle(item.evolutionType)}>
                                        {item.name}
                                     </span>
                                     
                                     {/* BADGE HOMEBREW */}
                                     {item.isCustom && (
                                        <span style={{
                                            fontSize:'0.6rem',
                                            background:'#222',
                                            border:'1px solid #444',
                                            color:'#aaa',
                                            padding:'2px 6px',
                                            borderRadius:'3px',
                                            fontFamily: 'Orbitron',
                                            letterSpacing: '1px'
                                        }}>
                                            HB
                                        </span>
                                     )}
                                 </div>

                                 <span style={{fontSize:'0.8rem', color:'#666', textTransform:'uppercase'}}>
                                    {item.evolutionType}
                                 </span>
                             </div>

                             {/* DETALHES */}
                             {expandedId === item._id && (
                                 <div className="hb-card-body">
                                     <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', textAlign:'center', background:'rgba(255,255,255,0.03)', padding:'10px'}}>
                                          <div><span className="hb-label" style={{display:'block', fontSize:'0.7rem'}}>SUCESSO</span><span style={{fontFamily:'Orbitron', fontSize:'1.2rem', color:'#4caf50'}}>{item.successCost}</span></div>
                                          <div><span className="hb-label" style={{display:'block', fontSize:'0.7rem'}}>ADAPT</span><span style={{fontFamily:'Orbitron', fontSize:'1.2rem', color:'#2196f3'}}>{item.adaptationCost}</span></div>
                                          <div><span className="hb-label" style={{display:'block', fontSize:'0.7rem'}}>PRESSÃO</span><span style={{fontFamily:'Orbitron', fontSize:'1.2rem', color:'#ff9800'}}>{item.pressureCost}</span></div>
                                     </div>
                                     <div className="hb-desc-box">{item.description}</div>
                                     <button className="btn-nero btn-primary" onClick={() => onItemSelect(item)} style={{marginTop:'10px', width:'100%', justifyContent:'center'}}>
                                        <FaPlus/> SELECIONAR
                                     </button>
                                 </div>
                             )}
                         </div>
                     ))}
                 </div>
              )}
          </div>
          <div className="nero-modal-footer"><button className="btn-nero" onClick={handleClose}>FECHAR</button></div>
      </div>
    </div>
  );
};

export default AssimilationsModal;