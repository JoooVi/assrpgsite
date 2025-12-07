/* InventoryGrid.js - Com Drag and Drop */
import React, { useState } from 'react';

// Ícones (Mantidos para visual)
import ShareIcon from '@mui/icons-material/Share';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StarIcon from '@mui/icons-material/Star';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const InventoryGrid = ({
  title,
  items,
  totalSlots,
  onMove,
  onEdit,
  onDelete,
  onUse,
  onQualityChange,
  location, // 'corpo' ou 'mochila'
  // Novos Props para Drag and Drop
  onDragStartItem, 
  onDropItem, 
  
  styles = {}, 
  qualityLevels = {}, 
  placeholders = [],
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  // --- Funções de Drag & Drop da Grade ---
  const handleDragOver = (e) => {
    e.preventDefault(); // Necessário para permitir o Drop
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    // Chama a função do pai dizendo "Soltaram algo AQUI (nesta location)"
    if (onDropItem) onDropItem(location); 
  };

  // --- Renderização dos Slots ---
  const renderedSlots = [];
  let itemIndex = 0;

  // Estilo Inline Botões
  const actionBtnStyle = {
    background: 'transparent', border: 'none', cursor: 'pointer',
    color: '#ccc', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center'
  };

  for (let slotIndex = 0; slotIndex < totalSlots; slotIndex++) {
    // 1. TENTA RENDERIZAR UM ITEM
    if (itemIndex < items.length) {
      const invItem = items[itemIndex];
      const itemDetails = invItem?.itemData || invItem?.item;

      if (!invItem || !itemDetails) {
        renderedSlots.push(<div className={`${styles.inventorySlot} ${styles.emptySlot}`} key={`corrupt-${slotIndex}`} />);
        itemIndex++;
        continue;
      }

      let slotsNeeded = itemDetails.slots ?? 1;
      if (itemDetails.modifiers?.includes("Pequeno")) slotsNeeded = 0;
      else if (itemDetails.modifiers?.includes("Pesado")) slotsNeeded += 1;

      if (slotIndex + slotsNeeded > totalSlots) {
        for (let k = slotIndex; k < totalSlots; k++) {
          renderedSlots.push(<div className={`${styles.inventorySlot} ${styles.emptySlot}`} key={`fill-${k}`} />);
        }
        break;
      }

      // ITEM CONTEÚDO (Pequeno ou Normal)
      const isSmall = slotsNeeded === 0;
      
      renderedSlots.push(
        <div 
          className={`${styles.inventorySlot} ${styles.filledSlot}`} 
          key={`item-${invItem._id || itemIndex}`}
          title={`${itemDetails.name} ${isSmall ? '(Pequeno)' : ''}`}
          // PROPRIEDADES DE ARRASTAR
          draggable={true}
          onDragStart={() => onDragStartItem && onDragStartItem(invItem)}
          // Estilo de Grid
          style={{ 
            gridColumn: isSmall ? 'span 1' : `span ${slotsNeeded}`,
            border: isSmall ? '1px dashed #b71c1c' : undefined
          }}
        >
          <img 
            src={itemDetails.icon || '/icons/default.svg'} 
            alt={itemDetails.name} 
            className={styles.inventoryItemIcon}
            style={{ opacity: itemDetails.isArtefato ? 0.9 : 1 }}
          />

          {itemDetails.isArtefato && <StarIcon style={{ position: 'absolute', top: 3, left: 3, color: '#ffd700', fontSize:'14px', filter: 'drop-shadow(0 0 2px black)' }} />}
          
          {/* Badge Quantidade */}
          {invItem.quantity > 1 && (
            <span style={{ position:'absolute', bottom:2, right:4, fontSize:'0.75rem', fontWeight:'bold', color: '#fff', textShadow: '0 0 3px black' }}>
                x{invItem.quantity}
            </span>
          )}

          {/* Painel Ações */}
          <div className={styles.slotActions}>
             <button style={actionBtnStyle} onClick={() => onMove(invItem, location === 'corpo' ? 'mochila' : 'corpo')} title="Mover">
                <ShareIcon fontSize="small" style={{transform: location === 'corpo' ? 'rotate(90deg)' : 'rotate(-90deg)'}} />
             </button>
             
             <button style={actionBtnStyle} onClick={() => onEdit(invItem)} title="Editar"><EditIcon fontSize="small"/></button>
             
             {onQualityChange && (
                 <div style={{display:'flex', flexDirection:'column'}}>
                     <button style={{...actionBtnStyle, padding:0}} disabled={invItem.quality<=0} onClick={()=>onQualityChange(invItem, invItem.quality-1)}><RemoveCircleOutlineIcon style={{fontSize: 16}}/></button>
                     <button style={{...actionBtnStyle, padding:0}} disabled={invItem.quality>=6} onClick={()=>onQualityChange(invItem, invItem.quality+1)}><AddCircleOutlineIcon style={{fontSize: 16}}/></button>
                 </div>
             )}

             <button style={{...actionBtnStyle, color: '#d32f2f'}} onClick={() => onDelete(invItem)} title="Descartar"><DeleteIcon fontSize="small"/></button>

             {(itemDetails.isConsumable || itemDetails.resourceType) && (
                 <button style={{...actionBtnStyle, color: '#4caf50'}} onClick={()=>onUse(invItem)} title="Usar"><PlayArrowIcon fontSize="small"/></button>
             )}
          </div>
        </div>
      );

      if(!isSmall) slotIndex += slotsNeeded - 1;
      itemIndex++;

    } else {
      // 2. SLOT VAZIO (Placeholder)
      const placeholderInfo = placeholders[slotIndex]; 
      renderedSlots.push(
        <div className={`${styles.inventorySlot} ${styles.emptySlot}`} key={`empty-${slotIndex}`}>
           {placeholderInfo && placeholderInfo.icon && (
               <img src={placeholderInfo.icon} alt="" style={{ width:'50%', height:'50%', objectFit:'contain', opacity: 0.15, filter: 'grayscale(100%)' }} />
           )}
        </div>
      );
    }
  }

  // --- RENDER FINAL ---
  return (
    <div>
      {title && <h4 className={styles.gridTitle} style={{marginTop:20, marginBottom:8, color:'#eee', borderLeft:'3px solid #b71c1c', paddingLeft:8, textTransform:'uppercase'}}>{title}</h4>}
      
      {/* O Container principal recebe os eventos de Drop */}
      <div 
        className={`${styles.inventoryGridContainer} ${isDragOver ? styles.dragOver : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {renderedSlots}
      </div>
    </div>
  );
};

export default InventoryGrid;