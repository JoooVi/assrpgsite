/* InventoryGrid.js - Com suporte a Sobrepeso */
import React, { useState } from 'react';

// Ícones
import ShareIcon from '@mui/icons-material/Share';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StarIcon from '@mui/icons-material/Star';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber'; // Ícone de alerta

const InventoryGrid = ({
  title,
  items,
  totalSlots, // Capacidade MÁXIMA (ex: 6)
  onMove,
  onEdit,
  onDelete,
  onUse,
  onQualityChange,
  location, 
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

  // --- NOVA LÓGICA DE RENDERIZAÇÃO ---
  
  const renderedSlots = [];
  let currentUsedSlots = 0; // Contador de slots usados para detectar sobrepeso

  // 1. Renderiza TODOS os itens (mesmo que ultrapassem o limite)
  items.forEach((invItem, index) => {
    const itemDetails = invItem?.itemData || invItem?.item;

    if (!invItem || !itemDetails) return; // Pula itens inválidos

    // Cálculo de Slots do Item
    let slotsNeeded = itemDetails.slots ?? 1;
    if (itemDetails.modifiers?.includes("Pequeno")) slotsNeeded = 0;
    else if (itemDetails.modifiers?.includes("Pesado")) slotsNeeded += 1;

    // Verifica se esse item vai estourar o limite OU se já estamos estourados
    // O item é considerado "Sobrepeso" se o slot inicial dele já está além do total
    // Ou se ao adicionar ele, ultrapassamos o total.
    const isOverweight = (currentUsedSlots + slotsNeeded) > totalSlots && slotsNeeded > 0;
    // Nota: Se slotsNeeded for 0 (Pequeno), ele nunca causa sobrepeso tecnicamente, 
    // mas se o inventário já estiver cheio antes dele, podemos marcar ou não. 
    // Vou deixar itens pequenos livres de sobrepeso por enquanto, ou você pode mudar a lógica.

    // Atualiza o contador
    currentUsedSlots += slotsNeeded;

    const isSmall = slotsNeeded === 0;

    // Estilo base dos botões
    const actionBtnStyle = {
      background: 'transparent', border: 'none', cursor: 'pointer',
      color: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: '4px'
    };

    renderedSlots.push(
      <div 
        // APLICA CLASSE DE SOBREPESO SE NECESSÁRIO
        className={`${styles.inventorySlot} ${styles.filledSlot} ${isOverweight ? styles.overweightSlot : ''}`} 
        key={`item-${invItem._id || index}`}
        title={isOverweight ? "SOBRECARGA: Este item excede sua capacidade!" : itemDetails.name}
        draggable={true}
        onDragStart={() => onDragStartItem && onDragStartItem(invItem)}
        tabIndex={0}
        style={{ 
          gridColumn: isSmall ? 'span 1' : `span ${slotsNeeded > 0 ? slotsNeeded : 1}`,
          border: isSmall ? '1px dashed #b71c1c' : undefined,
          // Se for sobrepeso, forçamos um estilo visual inline caso o CSS class falhe ou para garantir
          borderColor: isOverweight ? '#b71c1c' : undefined
        }}
      >
        <img 
          src={itemDetails.icon || '/icons/default.svg'} 
          alt={itemDetails.name} 
          className={styles.inventoryItemIcon}
          style={{ 
            opacity: itemDetails.isArtefato ? 0.9 : 1,
            // Se estiver com sobrepeso, deixa um pouco vermelho a imagem
            filter: isOverweight ? 'grayscale(0.5) sepia(1) hue-rotate(-50deg) saturate(3)' : 'none'
          }}
        />

        {/* Ícone de Estrela para Artefato */}
        {itemDetails.isArtefato && (
          <StarIcon style={{ position: 'absolute', top: 3, left: 3, color: '#ffd700', fontSize:'14px', filter: 'drop-shadow(0 0 2px black)', pointerEvents:'none' }} />
        )}

        {/* Ícone de Alerta para Sobrepeso */}
        {isOverweight && (
           <WarningAmberIcon style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#ffeb3b', fontSize:'40px', opacity: 0.8, pointerEvents:'none', zIndex: 1 }} />
        )}
        
        {/* Badge Quantidade */}
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
  });

  // 2. Preenche com slots vazios APENAS se houver espaço sobrando
  // Se currentUsedSlots for 4 e total for 6, desenha 2 vazios.
  // Se currentUsedSlots for 7 e total for 6, não desenha nenhum vazio.
  if (currentUsedSlots < totalSlots) {
    const slotsRemaining = totalSlots - currentUsedSlots;
    
    // Precisamos saber o índice inicial para as chaves (keys) do react não conflitarem
    const startIndex = items.length; 

    for (let i = 0; i < slotsRemaining; i++) {
      const placeholderInfo = placeholders[startIndex + i]; 
      renderedSlots.push(
        <div className={`${styles.inventorySlot} ${styles.emptySlot}`} key={`empty-${startIndex + i}`}>
           {placeholderInfo && placeholderInfo.icon && (
               <img src={placeholderInfo.icon} alt="" style={{ width:'50%', height:'50%', objectFit:'contain', opacity: 0.15, filter: 'grayscale(100%)' }} />
           )}
        </div>
      );
    }
  }

  return (
    <div>
      {/* Exibe o contador de peso no título se passar do limite */}
      {title && (
         <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h4 className={styles.gridTitle}>{title}</h4>
            {currentUsedSlots > totalSlots && (
               <span style={{color: '#b71c1c', fontWeight:'bold', fontSize:'0.8rem', marginRight:'10px', animation: 'pulse 1s infinite'}}>
                  ⚠ SOBRECARGA ({currentUsedSlots}/{totalSlots})
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