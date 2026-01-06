/* InventoryGrid.js - Com Visual Tetris Forçado */
import React, { useState } from 'react';

// Ícones
import ShareIcon from '@mui/icons-material/Share';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StarIcon from '@mui/icons-material/Star';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const InventoryGrid = ({
  title, items, totalSlots, onMove, onEdit, onDelete, onUse, onQualityChange, 
  location, onDragStartItem, onDropItem, styles = {}, placeholders = []
}) => {
  // ... (mantenha os estados e handlers de drag/drop iguais) ...
  const [isDragOver, setIsDragOver] = useState(false);
  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => { setIsDragOver(false); };
  const handleDrop = (e) => { e.preventDefault(); setIsDragOver(false); if (onDropItem) onDropItem(location); };

  const renderedSlots = [];
  let currentUsedSlots = 0; 

  items.forEach((invItem, index) => {
    const itemDetails = invItem?.itemData || invItem?.item;
    if (!invItem || !itemDetails) return; 

    // --- CÁLCULOS DE TAMANHO ---
    const modifiers = (itemDetails.modifiers || []).map(m => m.trim().toLowerCase());
    // Pega o valor numérico dos slots
    const numericSlots = isNaN(parseInt(itemDetails.slots)) ? 1 : parseInt(itemDetails.slots);

    // Definições de Tipo
    const isHeavy = numericSlots >= 2 || modifiers.includes("pesado");
    const isSmall = numericSlots === 0 || modifiers.includes("pequeno") || modifiers.includes("discreto");
    
    // Peso Matemático Real
    let slotsNeeded = isSmall ? 0 : (isHeavy ? (numericSlots >= 2 ? numericSlots : 2) : 1);

    // --- LÓGICA VISUAL (TETRIS AVANÇADO) ---
    // Largura: Se for pesado (>=2), ocupa sempre 2 colunas (linha toda)
    const colSpan = isHeavy ? 2 : 1;
    
    // Altura: Só aumenta altura se for múltiplo de 2 (4, 6, 8) para manter o grid quadrado perfeito
    // Se for 3 ou 5, mantém altura 1 para não "comer" slot visual extra.
    let rowSpan = 1;
    if (isHeavy && numericSlots > 2 && numericSlots % 2 === 0) {
       rowSpan = numericSlots / 2; 
    }

    // Sobrepeso
    const isOverweight = (currentUsedSlots + slotsNeeded) > totalSlots && slotsNeeded > 0;
    currentUsedSlots += slotsNeeded;

    // Estilos CSS
    let slotClass = styles.filledSlot;
    if (isHeavy) slotClass += ` ${styles.heavySlot}`;
    if (isSmall) slotClass += ` ${styles.smallSlot}`;
    if (isOverweight) slotClass += ` ${styles.overweightSlot}`;

    const actionBtnStyle = {
      background: 'transparent', border: 'none', cursor: 'pointer',
      color: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: '4px'
    };

    // Função para gerar algarismo romano ou número para o peso
    const getWeightLabel = (n) => {
        if (n === 2) return "II";
        if (n === 3) return "III";
        if (n === 4) return "IV";
        if (n === 5) return "V";
        if (n === 6) return "VI";
        return n;
    };

    renderedSlots.push(
      <div 
        className={`${styles.inventorySlot} ${slotClass}`} 
        key={`item-${invItem._id || index}`}
        title={`${itemDetails.name} (Peso: ${slotsNeeded})`}
        draggable={true}
        onDragStart={() => onDragStartItem && onDragStartItem(invItem)}
        tabIndex={0}
        style={{ 
          // Aplica as dimensões calculadas
          gridColumn: `span ${colSpan}`,
          gridRow: `span ${rowSpan}`,
          
          // Se o item crescer em altura, removemos a proporção fixa para ele preencher o espaço
          aspectRatio: rowSpan > 1 ? 'auto' : (colSpan === 2 ? '2/1' : '1/1'),
          
          borderStyle: isSmall ? 'dashed' : 'solid',
          borderColor: isOverweight ? '#b71c1c' : undefined
        }}
      >
        <img 
          src={itemDetails.icon || '/icons/default.svg'} 
          alt={itemDetails.name} 
          className={styles.inventoryItemIcon}
          style={{ 
            opacity: itemDetails.isArtefato ? 0.9 : 1,
            // Se o item for alto (rowSpan > 1), a imagem pode crescer
            width: isHeavy ? 'auto' : '75%', 
            height: rowSpan > 1 ? '60%' : (isHeavy ? '85%' : '75%'),
            maxWidth: '90%',
            filter: isOverweight ? 'grayscale(1) sepia(1) hue-rotate(-50deg) saturate(3)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
          }}
        />

        {/* Indicador Numérico de Peso (Só se for Pesado) */}
        {isHeavy && (
            <span style={{
                position: 'absolute', bottom: '4px', left: '6px',
                fontSize: '11px', fontWeight: '900', color: '#666',
                letterSpacing: '1px', pointerEvents: 'none', zIndex: 1
            }}>
                {getWeightLabel(slotsNeeded)}
            </span>
        )}

        {itemDetails.isArtefato && (
          <StarIcon style={{ position: 'absolute', top: 3, left: 3, color: '#ffd700', fontSize:'14px', filter: 'drop-shadow(0 0 2px black)', pointerEvents:'none' }} />
        )}

        {isOverweight && (
           <WarningAmberIcon style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#ffeb3b', fontSize:'40px', opacity: 0.8, pointerEvents:'none', zIndex: 1 }} />
        )}
        
        {invItem.quantity > 1 && (
          <span className={styles.qtyBadge}>x{invItem.quantity}</span>
        )}

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
  });

  // --- 2. RENDERIZAÇÃO DOS SLOTS VAZIOS ---
  if (currentUsedSlots < totalSlots) {
    const slotsRemaining = totalSlots - currentUsedSlots;
    const startIndex = items.length; 

    for (let i = 0; i < slotsRemaining; i++) {
      const placeholderInfo = placeholders[startIndex + i]; 
      
      renderedSlots.push(
        <div 
          className={`${styles.inventorySlot} ${styles.emptySlot}`} 
          key={`empty-${startIndex + i}`}
          style={{ gridColumn: 'span 1', aspectRatio: '1 / 1' }} 
        >
           {placeholderInfo && placeholderInfo.icon && (
               <img src={placeholderInfo.icon} alt="" style={{ width:'50%', height:'50%', objectFit:'contain', opacity: 0.15, filter: 'grayscale(100%)' }} />
           )}
        </div>
      );
    }
  }

  return (
    <div>
      {title && (
         <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h4 className={styles.gridTitle}>{title}</h4>
            {currentUsedSlots > totalSlots && (
               <span style={{color: '#b71c1c', fontWeight:'bold', fontSize:'0.8rem', marginRight:'10px', animation: 'pulse 1s infinite', display:'flex', alignItems:'center', gap:'5px'}}>
                  <WarningAmberIcon style={{fontSize: '1rem'}}/> SOBRECARGA ({currentUsedSlots}/{totalSlots})
               </span>
            )}
         </div>
      )}
      
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