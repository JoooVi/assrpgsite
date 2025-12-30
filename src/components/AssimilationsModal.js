import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllAssimilations } from "../redux/slices/assimilationsSlice";
import { FaSearch, FaTimes, FaPlus, FaFilter } from "react-icons/fa";
import "../pages/Homebrews.css";

const AssimilationsModal = ({ open, handleClose, onItemSelect }) => {
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

  const combined = [...allAssimilations, ...userAssimilations].reduce((acc, current) => {
      const x = acc.find(item => item._id === current._id);
      if (!x) { return acc.concat([current]); }
      return acc;
  }, []);

  const categories = [...new Set(combined.map(item => item.category))].filter(Boolean);

  const filtered = combined
      .filter(item => !selectedCategory || item.category === selectedCategory)
      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getEvolutionStyle = (type) => {
      const t = type ? type.toLowerCase() : "";
      if (t === 'copas') return { color: '#ff5252' };
      if (t === 'espadas' || t === 'inoportuna') return { color: '#4c86ff' };
      if (t === 'paus' || t === 'singular') return { color: '#d05ce3' };
      if (t === 'ouros' || t === 'adaptativa') {
          return { background: "linear-gradient(to right, #ff5252, #4c86ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: "bold" };
      }
      return { color: '#eee' };
  };

  if (!open) return null;

  // ESTILOS FIXOS
  const overlayStyle = {
    position: 'fixed',
    top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 99999,
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    backdropFilter: 'blur(3px)',
    padding: '10px'
  };

  const modalStyle = {
      width: '100%', maxWidth: '600px',
      backgroundColor: '#121212', border: '1px solid #444', borderRadius: '4px',
      display: 'flex', flexDirection: 'column',
      maxHeight: '85vh', boxShadow: '0 0 50px rgba(0,0,0,0.9)'
  };

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div style={modalStyle}>
          {/* Header */}
          <div style={{flexShrink:0, padding:'15px', borderBottom:'1px solid #333', background:'#1a1a1a', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
             <span style={{fontWeight:'bold', color:'#fff'}}>SELECIONAR ASSIMILAÇÃO</span>
             <button onClick={handleClose} style={{background:'transparent', border:'none', color:'#666', cursor:'pointer'}}><FaTimes size={18}/></button>
          </div>

          {/* Body */}
          <div style={{padding:'20px', overflowY:'auto', flex: 1}}>
              <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                   <div style={{position:'relative', flex:1}}>
                        <FaSearch style={{position:'absolute', left:'10px', top:'12px', color:'#666'}}/>
                        <input className="nero-input" placeholder="Buscar..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} style={{paddingLeft:'35px', width:'100%', boxSizing:'border-box'}}/>
                   </div>
                   <div style={{position:'relative', width:'130px'}}>
                       <FaFilter style={{position:'absolute', left:'10px', top:'12px', color:'#666'}}/>
                       <select className="nero-select" value={selectedCategory} onChange={(e)=>setSelectedCategory(e.target.value)} style={{paddingLeft:'30px', width:'100%', boxSizing:'border-box'}}>
                            <option value="">TODAS</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                   </div>
              </div>

              {loading ? <div style={{textAlign:'center', color:'#fff'}}>Carregando...</div> : (
                 <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                     {filtered.map((item) => (
                         <div key={item._id} className={`hb-card ${expandedId === item._id ? 'expanded' : ''}`} style={{background:'#1a1a1a'}}>
                             <div className="hb-card-header" onClick={() => setExpandedId(expandedId===item._id?null:item._id)} style={{padding:'12px'}}>
                                 <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                     <span className="hb-card-title" style={getEvolutionStyle(item.evolutionType)}>{item.name}</span>
                                     {item.isCustom && <span style={{fontSize:'0.6rem', background:'#333', border:'1px solid #444', color:'#aaa', padding:'2px 5px', borderRadius:'2px'}}>HB</span>}
                                 </div>
                                 <span style={{fontSize:'0.8rem', color:'#666', textTransform:'uppercase'}}>{item.evolutionType}</span>
                             </div>

                             {expandedId === item._id && (
                                 <div className="hb-card-body" style={{padding:'10px', background:'#222'}}>
                                     <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'5px', textAlign:'center', marginBottom:'10px'}}>
                                          <div style={{background:'#333', padding:'5px', borderRadius:'3px'}}><div style={{fontSize:'0.6rem', color:'#aaa'}}>SUCESSO</div><div style={{color:'#4caf50', fontWeight:'bold'}}>{item.successCost}</div></div>
                                          <div style={{background:'#333', padding:'5px', borderRadius:'3px'}}><div style={{fontSize:'0.6rem', color:'#aaa'}}>ADAPT</div><div style={{color:'#2196f3', fontWeight:'bold'}}>{item.adaptationCost}</div></div>
                                          <div style={{background:'#333', padding:'5px', borderRadius:'3px'}}><div style={{fontSize:'0.6rem', color:'#aaa'}}>PRESSÃO</div><div style={{color:'#ff9800', fontWeight:'bold'}}>{item.pressureCost}</div></div>
                                     </div>
                                     <div className="hb-desc-box" style={{fontSize:'0.9rem', color:'#ccc', lineHeight:'1.5'}}>{item.description}</div>
                                     <button className="btn-nero btn-primary" onClick={() => onItemSelect(item)} style={{marginTop:'15px', width:'100%', justifyContent:'center', padding:'10px'}}><FaPlus/> SELECIONAR</button>
                                 </div>
                             )}
                         </div>
                     ))}
                 </div>
              )}
          </div>
          
          <div style={{flexShrink:0, padding:'15px', borderTop:'1px solid #333', display:'flex', justifyContent:'flex-end', background:'#1a1a1a'}}>
              <button className="btn-nero" onClick={handleClose} style={{padding:'8px 20px', background:'transparent', border:'1px solid #444', color:'#ccc'}}>FECHAR</button>
          </div>
      </div>
    </div>
  );
};

export default AssimilationsModal;