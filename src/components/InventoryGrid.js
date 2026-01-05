/* InventoryGrid.js - Otimizado para Responsividade */
import React, { useState } from 'react';

// Ícones
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
  onDragStartItem, 
  onDropItem, 
  styles = {}, 
  placeholders = [],
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (onDropItem) onDropItem(location); 
  };

  const renderedSlots = [];
  let itemIndex = 0;

  // Estilo base dos botões de ação (sem padding fixo para o CSS controlar no mobile)
  const actionBtnStyle = {
    background: 'transparent', border: 'none', cursor: 'pointer',
    color: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '4px'
  };

  for (let slotIndex = 0; slotIndex < totalSlots; slotIndex++) {
    if (itemIndex < items.length) {
      const invItem = items[itemIndex];
      const itemDetails = invItem?.itemData || invItem?.item;

      if (!invItem || !itemDetails) {
        // Slot corrompido/erro
        renderedSlots.push(<div className={`${styles.inventorySlot} ${styles.emptySlot}`} key={`corrupt-${slotIndex}`} />);
        itemIndex++;
        continue;
      }

      let slotsNeeded = itemDetails.slots ?? 1;
      if (itemDetails.modifiers?.includes("Pequeno")) slotsNeeded = 0;
      else if (itemDetails.modifiers?.includes("Pesado")) slotsNeeded += 1;

      // Se o item excede os slots totais restantes, enche de vazios e para
      if (slotIndex + slotsNeeded > totalSlots) {
        for (let k = slotIndex; k < totalSlots; k++) {
          renderedSlots.push(<div className={`${styles.inventorySlot} ${styles.emptySlot}`} key={`fill-${k}`} />);
        }
        break;
      }

      const isSmall = slotsNeeded === 0;
      
      renderedSlots.push(
        <div 
          className={`${styles.inventorySlot} ${styles.filledSlot}`} 
          key={`item-${invItem._id || itemIndex}`}
          title={`${itemDetails.name}`}
          draggable={true}
          onDragStart={() => onDragStartItem && onDragStartItem(invItem)}
          // Use tabIndex para permitir foco no mobile (para abrir o menu de ações ao tocar)
          tabIndex={0} 
          style={{ 
            // Span de colunas controlado aqui, mas responsivo graças ao CSS grid container
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

          {itemDetails.isArtefato && (
            <StarIcon style={{ position: 'absolute', top: 3, left: 3, color: '#ffd700', fontSize:'14px', filter: 'drop-shadow(0 0 2px black)', pointerEvents:'none' }} />
          )}
          
          {invItem.quantity > 1 && (
            <span className={styles.qtyBadge}>
                x{invItem.quantity}
            </span>
          )}

          {/* Painel Ações */}
          <div className={styles.slotActions}>
             <button style={actionBtnStyle} onClick={(e) => { e.stopPropagation(); onMove(invItem, location === 'corpo' ? 'mochila' : 'corpo'); }} title="Mover">
                <ShareIcon fontSize="small" style={{transform: location === 'corpo' ? 'rotate(90deg)' : 'rotate(-90deg)'}} />
             </button>
             
             <button style={actionBtnStyle} onClick={(e) => { e.stopPropagation(); onEdit(invItem); }} title="Editar"><EditIcon fontSize="small"/></button>
             
             {onQualityChange && (
                 <div style={{display:'flex', flexDirection:'column', gap:'2px'}}>
                     <button style={{...actionBtnStyle, padding:0}} disabled={invItem.quality<=0} onClick={(e)=>{e.stopPropagation(); onQualityChange(invItem, invItem.quality-1)}}><RemoveCircleOutlineIcon style={{fontSize: 16}}/></button>
                     <button style={{...actionBtnStyle, padding:0}} disabled={invItem.quality>=6} onClick={(e)=>{e.stopPropagation(); onQualityChange(invItem, invItem.quality+1)}}><AddCircleOutlineIcon style={{fontSize: 16}}/></button>
                 </div>
             )}

             <button style={{...actionBtnStyle, color: '#d32f2f'}} onClick={(e) => { e.stopPropagation(); onDelete(invItem); }} title="Descartar"><DeleteIcon fontSize="small"/></button>

             {(itemDetails.isConsumable || itemDetails.resourceType) && (
                 <button style={{...actionBtnStyle, color: '#4caf50'}} onClick={(e) => { e.stopPropagation(); onUse(invItem); }} title="Usar"><PlayArrowIcon fontSize="small"/></button>
             )}
          </div>
        </div>
      );

      if(!isSmall) slotIndex += slotsNeeded - 1;
      itemIndex++;

    } else {
      // SLOT VAZIO
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

  return (
    <div>
      {title && <h4 className={styles.gridTitle}>{title}</h4>}
      
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