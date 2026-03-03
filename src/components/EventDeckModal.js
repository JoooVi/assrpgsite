/* src/components/EventDeckModal.js */
import React, { useState } from 'react';
import { FaLayerGroup, FaCheck, FaSkull, FaChevronDown, FaExclamationTriangle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { drawCards } from '../utils/eventDeckData';
import styles from '../pages/CampaignSheet.module.css';

// --- SUBCOMPONENTE: Carta Interativa (Diagramação Padrão do Site) ---
const InteractiveCard = ({ card, isRevealed, onSelect, onReveal }) => {

  // 1. Estilo para Textos e Ícones (Com o degradê)
  const getEvolutionStyle = (type) => {
    const t = type ? type.toLowerCase() : "";
    if (t === 'copas') return { color: '#ff5252' };
    if (t === 'espadas' || t === 'inoportuna') return { color: '#4c86ff' };
    if (t === 'paus' || t === 'singular') return { color: '#d05ce3' };
    if (t === 'ouros' || t === 'adaptativa') {
        return { 
          background: "linear-gradient(to right, #ff5252, #4c86ff)", 
          WebkitBackgroundClip: "text", 
          WebkitTextFillColor: "transparent", 
          fontWeight: "bold" 
        };
    }
    return { color: '#eee' };
  };

  // 2. NOVO: Estilo para os traços e linhas da carta (Aceita o degradê no background!)
  const getLineTheme = (suit) => {
    const t = suit ? suit.toLowerCase() : "";
    if (t === 'copas') return { background: '#ff5252' };
    if (t === 'ouros' || t === 'adaptativa') return { background: 'linear-gradient(to right, #ff5252, #4c86ff)' }; // O teu degradê nas linhas!
    if (t === 'paus' || t === 'singular') return { background: '#d05ce3' };  
    if (t === 'espadas' || t === 'inoportuna') return { background: '#4c86ff' }; 
    return { background: '#555' };
  };

  // 3. Fallback de cor sólida APENAS para a borda tracejada do botão e efeitos de Rato (Hover)
  const getSolidTheme = (suit) => {
    const t = suit ? suit.toLowerCase() : "";
    if (t === 'copas') return '#ff5252'; 
    if (t === 'ouros' || t === 'adaptativa') return '#ff5252'; // Usa a ponta vermelha do degradê para não quebrar a borda
    if (t === 'paus' || t === 'singular') return '#d05ce3';  
    if (t === 'espadas' || t === 'inoportuna') return '#4c86ff'; 
    return '#555';
  };

  const solidColor = getSolidTheme(card.suit);

  return (
    <motion.div 
      style={{ 
        width: '280px', height: '440px', position: 'relative', 
        perspective: '1200px',
        cursor: isRevealed ? 'default' : 'pointer'
      }}
      whileHover={{ y: -5, scale: 1.02 }} 
      onClick={() => { if (!isRevealed) onReveal(); }} 
    >
      <motion.div 
        initial={{ rotateY: 180 }} 
        animate={{ rotateY: isRevealed ? 0 : 180 }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }} 
        style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d' }}
      >
        
        {/* ===== FRENTE DA CARTA (REVELADA) ===== */}
        <div style={{ 
            position: 'absolute', width: '100%', height: '100%', 
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            background: '#050505', borderRadius: '4px', border: '1px solid #333', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', 
            overflow: 'hidden'
        }}>
            {/* Detalhe de cor no topo COM DEGRADÊ */}
            <div style={{ height: '3px', width: '100%', ...getLineTheme(card.suit) }}></div>

            {/* CABEÇALHO DA CARTA */}
            <div style={{ display: 'flex', borderBottom: `1px solid #222`, background: '#0a0a0a', height: '50px' }}>
                <div style={{ 
                    background: '#000', width: '50px', fontFamily: 'Orbitron', 
                    fontWeight: '900', fontSize: '1.3rem', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', borderRight: '1px solid #222'
                }}>
                    <span style={getEvolutionStyle(card.suit)}>{card.value}</span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 12px' }}>
                    <span style={{ color: '#666', fontSize: '0.6rem', textTransform: 'uppercase', fontFamily: 'Roboto Condensed', fontWeight: '700', letterSpacing: '1px' }}>
                        CATEGORIA DE EVENTO
                    </span>
                    <span style={{ color: '#fff', fontSize: '0.8rem', fontFamily: 'Rajdhani', fontWeight: 'bold', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {card.type}
                    </span>
                </div>
                <div style={{ width: '50px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid #222' }}>
                    <span style={getEvolutionStyle(card.suit)}>{card.icon}</span>
                </div>
            </div>

            {/* CORPO DA CARTA */}
            <div className="card-scroll" style={{ padding: '20px 15px 20px 20px', flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                
                {/* Marca D'água */}
                <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '10rem', opacity: 0.03, pointerEvents: 'none' }}>
                    <span style={getEvolutionStyle(card.suit)}>{card.icon}</span>
                </div>

                <h4 style={{ ...getEvolutionStyle(card.suit), fontFamily: 'Orbitron', fontSize: '1.15rem', margin: '0 0 10px 0', textAlign: 'center', zIndex: 1, textTransform: 'uppercase' }}>
                    {card.title}
                </h4>
                
                {/* Linha separadora central COM DEGRADÊ */}
                <div style={{ width: '30px', height: '2px', ...getLineTheme(card.suit), margin: '0 auto 15px auto', zIndex: 1, opacity: 0.8 }}></div>

                <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.6', fontFamily: 'Rajdhani', textAlign: 'left', marginBottom: '20px', zIndex: 1 }}>
                    {card.desc}
                </p>

                {/* Bloco de Rolagens (Estilo Terminal) */}
                {card.rolls && (
                    <div style={{ background: '#0a0a0a', border: '1px solid #222', borderLeft: `3px solid ${solidColor}`, padding: '12px', borderRadius: '2px', marginTop: 'auto', zIndex: 1 }}>
                        <span style={{ display: 'block', color: '#555', fontSize: '0.65rem', fontFamily: 'Orbitron', marginBottom: '8px', textTransform: 'uppercase' }}>Condicionantes</span>
                        {card.rolls.map((roll, rIdx) => (
                            <div key={rIdx} style={{ fontSize: '0.8rem', marginBottom: rIdx !== card.rolls.length - 1 ? '10px' : '0', color: '#999', lineHeight: '1.4' }}>
                                <strong style={{ ...getEvolutionStyle(card.suit), fontFamily: 'Roboto Condensed' }}>[{roll.condition}]</strong> {roll.text}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* RODAPÉ E BOTÃO DE AÇÃO */}
            <div style={{ padding: '12px', background: '#0a0a0a', borderTop: `1px solid #222` }}>
                <button 
                    onClick={(e) => { e.stopPropagation(); onSelect(card); }}
                    style={{ 
                        width: '100%', background: 'transparent', border: `1px dashed ${solidColor}`, 
                        color: solidColor, padding: '10px', fontFamily: 'Orbitron', fontSize: '0.8rem', 
                        fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '2px'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `${solidColor}22`; e.currentTarget.style.borderStyle = 'solid'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderStyle = 'dashed'; }}
                >
                    <FaCheck /> INJETAR EVENTO
                </button>
            </div>
        </div>

        {/* ===== VERSO DA CARTA (ARQUIVO CONFIDENCIAL) ===== */}
        <div style={{ 
            position: 'absolute', width: '100%', height: '100%', 
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: '#050505', borderRadius: '4px', border: '1px solid #333', 
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 0 50px #000'
        }}>
            <div style={{ border: '1px dashed #222', width: '88%', height: '92%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: '20px', textAlign: 'center' }}>
                <FaSkull size={45} color="#222" style={{ marginBottom: '25px' }} />
                <span style={{ color: '#444', fontFamily: 'Orbitron', fontSize: '1.1rem', letterSpacing: '4px', fontWeight: 'bold' }}>ASSIMILAÇÃO</span>
                <div style={{ width: '40px', height: '1px', background: '#333', margin: '10px 0' }}></div>
                <span style={{ color: '#333', fontFamily: 'Rajdhani', fontSize: '0.85rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Arquivo Confidencial</span>
                
                <div style={{ marginTop: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#444', animation: 'pulse 2s infinite' }}>
                    <FaChevronDown size={14} />
                    <span style={{ fontFamily: 'Roboto Condensed', fontSize: '0.7rem', marginTop: '5px', letterSpacing: '1px' }}>CLIQUE PARA REVELAR</span>
                </div>
            </div>
        </div>

      </motion.div>
    </motion.div>
  );
};

// --- COMPONENTE PRINCIPAL DO MODAL ---
// NOTA: Restaurei o prop "open" como estava no teu código original!
const EventDeckModal = ({ open, onClose, onSelectEvent }) => {
  const [drawnCards, setDrawnCards] = useState([]);
  const [revealedStates, setRevealedStates] = useState([false, false, false]);
  const [isDealing, setIsDealing] = useState(false);

  // Se o "open" for false, ele não renderiza nada (era isto que estava a quebrar!)
  if (!open) return null;

  const handleDraw = () => {
    if (isDealing) return;
    setIsDealing(true);
    setDrawnCards([]);
    setRevealedStates([false, false, false]);

    setTimeout(() => {
      setDrawnCards(drawCards(3)); 
      setIsDealing(false);
    }, 400);
  };

  const flipCard = (index) => {
    setRevealedStates(prev => {
        const newStates = [...prev];
        newStates[index] = true;
        return newStates;
    });
  };

  const customStyles = `
    .card-scroll::-webkit-scrollbar { width: 4px; }
    .card-scroll::-webkit-scrollbar-track { background: transparent; }
    .card-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
    .card-scroll::-webkit-scrollbar-thumb:hover { background: #8a1c18; }
    @keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 1; transform: translateY(3px); } 100% { opacity: 0.3; } }
  `;

  return (
    <div className={styles.modalBackdrop} onClick={onClose} style={{ zIndex: 12000 }}>
      <style>{customStyles}</style>
      
      {/* Utilizando padding 0 pois o header será acoplado no topo */}
      <div className={styles.modalPanel} style={{ maxWidth: '1050px', padding: '0', background: '#050505' }} onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER PADRÃO (Utiliza a classe oficial do modal) */}
        <div className={styles.modalHeader}>
          <h3 style={{ margin: 0, color: '#fff', fontFamily: 'Orbitron', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaLayerGroup color="#a73c39" /> BARALHO DE EVENTOS
          </h3>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button 
                onClick={handleDraw} 
                disabled={isDealing}
                className={styles.btnNero}
                style={{ padding: '6px 15px', fontSize: '0.8rem', height: '32px' }}
            >
                {isDealing ? "PROCESSANDO..." : "DISTRIBUIR CARTAS"}
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.5rem', cursor: 'pointer', lineHeight: '1' }}>×</button>
          </div>
        </div>

        {/* ÁREA DA MESA */}
        <div style={{ minHeight: '520px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '25px', padding: '40px 20px', background: '#0a0a0a' }}>
          
          {!drawnCards.length && !isDealing && (
            <div style={{ color: '#555', fontFamily: 'Rajdhani', fontSize: '1.1rem', textAlign: 'center', background: '#050505', padding: '50px', borderRadius: '4px', border: '1px dashed #222', width: '100%', maxWidth: '600px' }}>
              <FaExclamationTriangle size={30} style={{ marginBottom: '15px', opacity: 0.5, color: '#a73c39' }} />
              <p style={{ margin: '0 0 10px 0', color: '#888', textTransform: 'uppercase', fontFamily: 'Orbitron' }}>Nenhum evento ativo</p>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>O arquivo está vazio. Distribua as cartas no canto superior direito para alterar o cenário.</p>
            </div>
          )}

          <AnimatePresence>
            {drawnCards.map((card, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <InteractiveCard 
                  card={card} 
                  isRevealed={revealedStates[idx]} 
                  onReveal={() => flipCard(idx)}
                  onSelect={onSelectEvent} 
                />
              </motion.div>
            ))}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default EventDeckModal;