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
  const [activeTab, setActiveTab] = useState('system'); 

  useEffect(() => {
    if (open) { dispatch(fetchItems()); }
  }, [open, dispatch]);

  const itemsFiltered = allItems.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const systemItems = itemsFiltered.filter(i => !i.isCustom);
  const customItems = itemsFiltered.filter(i => i.isCustom && i.createdBy === user?._id);

  if(!open) return null;

  // --- ESTILOS FIXOS VIEWPORT ---
  const overlayStyle = {
      position: 'fixed', 
      top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      zIndex: 12000, 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(3px)',
      padding: '20px', 
      boxSizing: 'border-box'
  };

  const modalContainerStyle = {
      width: '100%', 
      maxWidth: '900px', 
      backgroundColor: '#101010', 
      border: '1px solid #444', 
      borderRadius: '4px',
      display: 'flex', 
      flexDirection: 'column', 
      height: '85vh', // Garante que caiba na tela
      boxShadow: '0 0 50px #000'
  };

  // Card do Item (Visual)
  const ItemSlot = ({ item }) => (
      <div 
         onClick={() => onItemSelect(item)}
         style={{
             background:'#1a1a1a', border:'1px solid #444', borderRadius:'4px', 
             padding:'10px', cursor:'pointer', position:'relative',
             display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
             minHeight:'110px', transition:'all 0.2s'
         }}
         onMouseEnter={e => {e.currentTarget.style.borderColor='#b71c1c'; e.currentTarget.style.transform='translateY(-2px)'}}
         onMouseLeave={e => {e.currentTarget.style.borderColor='#444'; e.currentTarget.style.transform='none'}}
      >
          {item.isArtefato && <FaStar style={{position:'absolute', top:5, left:5, color:'gold', fontSize:'12px'}}/>}
          <div style={{fontSize:'2rem', color:'#555', marginBottom:'5px'}}><FaCube /></div>
          <div style={{textAlign:'center', fontSize:'0.85rem', color:'#fff', fontWeight:'bold', lineHeight:'1.2', maxHeight:'3em', overflow:'hidden', textOverflow:'ellipsis'}}>{item.name}</div>
          <div style={{fontSize:'0.7rem', color:'#666', marginTop:'5px'}}>S:{item.slots||1} | Q:{item.quality||3}</div>
      </div>
  );

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div style={modalContainerStyle}>
          
          {/* HEADER */}
          <div style={{flexShrink:0, display:'flex', justifyContent:'space-between', padding:'15px', background:'#151515', borderBottom:'1px solid #333'}}>
              <span style={{fontWeight:'bold', color:'#eee', fontSize:'1.1rem'}}>ADICIONAR ITEM</span>
              <button onClick={handleClose} style={{background:'transparent', border:'none', color:'#888', cursor:'pointer'}}><FaTimes size={22}/></button>
          </div>

          {/* CONTROLS */}
          <div style={{background:'#1a1a1a', padding:'15px', borderBottom:'1px solid #333', flexShrink:0}}>
              <div style={{position:'relative', marginBottom:'15px'}}>
                   <FaSearch style={{position:'absolute', left:'12px', top:'12px', color:'#555'}}/>
                   <input className="nero-input" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{paddingLeft:'35px', width:'100%', boxSizing:'border-box'}} />
              </div>
              <div className="hb-tabs" style={{margin:0, display:'flex'}}>
                  <button className={`hb-tab ${activeTab==='system'?'active':''}`} onClick={()=>setActiveTab('system')} style={{flex:1, padding:'10px', background:activeTab==='system'?'#222':'transparent', border:'1px solid #444', color:activeTab==='system'?'#fff':'#666', fontWeight:'bold', cursor:'pointer'}}>SISTEMA</button>
                  <button className={`hb-tab ${activeTab==='custom'?'active':''}`} onClick={()=>setActiveTab('custom')} style={{flex:1, padding:'10px', background:activeTab==='custom'?'#222':'transparent', border:'1px solid #444', borderLeft:'none', color:activeTab==='custom'?'#fff':'#666', fontWeight:'bold', cursor:'pointer'}}><FaUser style={{marginRight:5}}/> MEUS ITENS</button>
              </div>
          </div>

          {/* GRID SCROLLAVEL */}
          <div style={{padding:'15px', overflowY:'auto', background:'#080808', flex:1}}>
              {loading ? <div style={{color:'#fff', textAlign:'center', marginTop:'40px'}}>Carregando arsenal...</div> : (
                  <div style={{
                      display:'grid', 
                      gridTemplateColumns:'repeat(auto-fill, minmax(110px, 1fr))', // Grid inteligente
                      gap:'10px'
                  }}>
                      {activeTab === 'system' ? (
                          systemItems.length > 0 ? systemItems.map(i => <ItemSlot key={i._id} item={i} />) : <div style={{color:'#555', gridColumn:'1/-1', textAlign:'center'}}>Nenhum item encontrado.</div>
                      ) : (
                          customItems.length > 0 ? customItems.map(i => <ItemSlot key={i._id} item={i} />) : <div style={{color:'#555', gridColumn:'1/-1', textAlign:'center'}}>Você ainda não criou itens.</div>
                      )}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default ItemsModal;