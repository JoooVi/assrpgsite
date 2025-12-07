/* src/components/ItemsModal.js */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchItems } from "../redux/slices/itemsSlice";
import { FaSearch, FaTimes, FaCube, FaStar, FaUser } from "react-icons/fa";
import "../pages/Homebrews.css";

const ItemsModal = ({ open, handleClose, onItemSelect }) => {
  const dispatch = useDispatch();
  const { items: allItems, loading } = useSelector((state) => state.items);
  const user = useSelector((state) => state.auth.user);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState('system'); // 'system' or 'custom'

  useEffect(() => {
    if (open) { dispatch(fetchItems()); }
  }, [open, dispatch]);

  const itemsFiltered = allItems.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const systemItems = itemsFiltered.filter(i => !i.isCustom);
  const customItems = itemsFiltered.filter(i => i.isCustom && i.createdBy === user?._id);

  if(!open) return null;

  // Renderizador de Slot Simples (Visual Card)
  const ItemSlot = ({ item }) => (
      <div 
         onClick={() => onItemSelect(item)}
         style={{
             background:'#1a1a1a', border:'1px solid #444', borderRadius:'4px', 
             padding:'10px', cursor:'pointer', position:'relative',
             display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
             minHeight:'100px', transition:'all 0.2s'
         }}
         onMouseEnter={e => {e.currentTarget.style.borderColor='#8a1c18'; e.currentTarget.style.transform='translateY(-3px)'}}
         onMouseLeave={e => {e.currentTarget.style.borderColor='#444'; e.currentTarget.style.transform='none'}}
         title={item.description}
      >
          {item.isArtefato && <FaStar style={{position:'absolute', top:5, left:5, color:'gold', fontSize:'10px'}}/>}
          <div style={{fontSize:'2rem', color:'#888', marginBottom:'5px'}}>
               {/* Aqui poderia ter um <img src={item.icon} /> se tivesse */}
               <FaCube />
          </div>
          <div style={{textAlign:'center', fontSize:'0.8rem', color:'#fff', fontWeight:'bold', lineHeight:'1.2'}}>
             {item.name}
          </div>
          <div style={{fontSize:'0.7rem', color:'#666', marginTop:'5px'}}>
             Slots: {item.slots ?? 1} | Q: {item.quality || 3}
          </div>
      </div>
  );

  return (
    <div className="nero-modal-overlay" onClick={(e) => e.target.className === 'nero-modal-overlay' && handleClose()}>
      <div className="nero-modal" style={{maxWidth:'900px', height:'80vh'}}>
          
          {/* HEADER */}
          <div className="nero-modal-header" style={{display:'flex', justifyContent:'space-between'}}>
              <span>ARSENAL E SUPRIMENTOS</span>
              <button onClick={handleClose} style={{background:'transparent', border:'none', color:'#666', cursor:'pointer'}}><FaTimes size={20}/></button>
          </div>

          {/* SEARCH & TABS */}
          <div style={{background:'#111', padding:'15px', borderBottom:'1px solid #333'}}>
              <div style={{position:'relative', marginBottom:'15px'}}>
                   <FaSearch style={{position:'absolute', left:'12px', top:'12px', color:'#555'}}/>
                   <input 
                       className="nero-input" 
                       placeholder="Buscar item..." 
                       value={searchTerm}
                       onChange={e => setSearchTerm(e.target.value)}
                       style={{paddingLeft:'35px'}}
                   />
              </div>
              <div className="hb-tabs" style={{margin:0}}>
                  <button className={`hb-tab ${activeTab==='system'?'active':''}`} onClick={()=>setActiveTab('system')} style={{padding:'10px', flex:1}}>SISTEMA</button>
                  <button className={`hb-tab ${activeTab==='custom'?'active':''}`} onClick={()=>setActiveTab('custom')} style={{padding:'10px', flex:1}}><FaUser style={{marginRight:5}}/> MEUS ITENS</button>
              </div>
          </div>

          {/* BODY */}
          <div className="nero-modal-body" style={{padding:'20px', overflowY:'auto', background:'#0a0a0a'}}>
              {loading ? <div style={{color:'#fff', textAlign:'center'}}>Carregando arsenal...</div> : (
                  <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(110px, 1fr))', gap:'15px'}}>
                      {activeTab === 'system' ? (
                          systemItems.length > 0 ? systemItems.map(i => <ItemSlot key={i._id} item={i} />) : <div style={{color:'#555'}}>Nada encontrado.</div>
                      ) : (
                          customItems.length > 0 ? customItems.map(i => <ItemSlot key={i._id} item={i} />) : <div style={{color:'#555'}}>Você não tem itens criados.</div>
                      )}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default ItemsModal;