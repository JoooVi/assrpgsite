import React from "react";
// --- ALTERAÇÃO: Removemos Chip e Avatar ---
import { Box, Typography, List, ListItemText, CircularProgress } from "@mui/material"; 
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNowStrict } from 'date-fns'; // For better timestamps
import { ptBR } from 'date-fns/locale';        // For Portuguese timestamps

// --- Dice Assets (Permanece igual) ---
const dados = {
  d6: {
    1: [], 2: [],
    3: [require("../assets/Coruja_1.png")],
    4: [require("../assets/Coruja_1.png"), require("../assets/Cervo_1.png")],
    5: [require("../assets/Coruja_1.png"), require("../assets/Cervo_1.png")],
    6: [require("../assets/Joaninha_1.png")],
  },
  d10: {
    1: [], 2: [],
    3: [require("../assets/Coruja_1.png")],
    4: [require("../assets/Coruja_1.png"), require("../assets/Cervo_1.png")],
    5: [require("../assets/Coruja_1.png"), require("../assets/Cervo_1.png")],
    6: [require("../assets/Joaninha_1.png")],
    7: [require("../assets/Joaninha_1.png"), require("../assets/Joaninha_1.png")],
    8: [require("../assets/Joaninha_1.png"), require("../assets/Cervo_1.png")],
    9: [require("../assets/Joaninha_1.png"), require("../assets/Cervo_1.png"), require("../assets/Coruja_1.png")],
    10: [require("../assets/Joaninha_1.png"), require("../assets/Joaninha_1.png"), require("../assets/Coruja_1.png")],
  },
  d12: {
    1: [], 2: [],
    3: [require("../assets/Coruja_1.png")],
    4: [require("../assets/Coruja_1.png"), require("../assets/Cervo_1.png")],
    5: [require("../assets/Coruja_1.png"), require("../assets/Cervo_1.png")],
    6: [require("../assets/Joaninha_1.png")],
    7: [require("../assets/Joaninha_1.png"), require("../assets/Joaninha_1.png")],
    8: [require("../assets/Joaninha_1.png"), require("../assets/Cervo_1.png")],
    9: [require("../assets/Joaninha_1.png"), require("../assets/Cervo_1.png"), require("../assets/Coruja_1.png")],
    10: [require("../assets/Joaninha_1.png"), require("../assets/Joaninha_1.png"), require("../assets/Coruja_1.png")],
    11: [require("../assets/Joaninha_1.png"), require("../assets/Cervo_1.png"), require("../assets/Cervo_1.png"), require("../assets/Coruja_1.png")],
    12: [require("../assets/Coruja_1.png"), require("../assets/Coruja_1.png")],
  },
};
// --- END Dice Assets ---

// --- Translation Function (Permanece igual) ---
const translateKey = (key) => {
  const translations = {
    // Coloque TODAS as suas traduções aqui...
    health: "Saúde", Agility: "Agilidade", agility: "Agilidade", Perception: "Percepção",
    perception: "Percepção", Strength: "Força", strength: "Força", Current: "Atual",
    current: "Atual", collapse: "Colapso", preCollapse: "pré-Colapso", postCollapse: "Pós-Colapso",
    Intelligence: "Inteligência", Potency: "Potência", potency: "Potência", Influence: "Influência",
    influence: "Influência", Resolution: "Resolução", resolution: "Resolução", Knowledge: "Conhecimento",
    knowledge: "Conhecimento", Practices: "Práticas", practices: "Práticas", Instincts: "Instintos",
    instincts: "Instintos", Sagacity: "Sagacidade", sagacity: "Sagacidade", infiltration: "Infiltração",
    Reaction: "Reação", reaction: "Reação", Agrarian: "Agrario", agrarian: "Agrario",
    Biological: "Biologico", biological: "Biologico", Exact: "Exato", exact: "Exato",
    Medicine: "Medicina", medicine: "Medicina", Social: "Social", social: "Social",
    Artistic: "Artistico", artistic: "Artistico", Sports: "Esportivas", sports: "Esportivas",
    Tools: "Ferramentas", tools: "Ferramentas", Crafts: "Oficios", crafts: "Oficios",
    Weapons: "Armas", weapons: "Armas", Vehicles: "Veiculos", vehicles: "Veiculos",
    Infiltration: "Infiltração", geography: "Geografia", Geography: "Geografia",
    security: "Segurança", Security: "Segurança", biology: "Biologia", Biology: "Biologia",
    erudition: "Erudição", Erudition: "Erudição", engineering: "Engenharia", Engineering: "Engenharia",
    athletics: "Atletismo", Athletics: "Atletismo", expression: "Expressão", Expression: "Expressão",
    stealth: "Furtividade", Stealth: "Furtividade", crafting: "Manufaturas", Crafting: "Manufaturas",
    survival: "Sobrevivência", Survival: "Sobrevivência",
  };
  return translations[key] || key;
};
// --- END Translation Function ---

// --- ALTERAÇÃO: Removemos o componente DieResultDisplay daqui ---

// --- Main RecentRollsFeed Component ---
const RecentRollsFeed = ({ rolls }) => {
  if (!rolls || rolls.length === 0) {
    return <Typography variant="body2" sx={{ color: '#aaa', fontStyle: 'italic', p: 2 }}>Nenhuma rolagem recente.</Typography>;
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: (i) => ({
        // --- ALTERAÇÃO: Opacidade padronizada para melhor leitura ---
        opacity: i === 0 ? 1 : 0.7, // Mais recente = 100%, antigos = 70%
        y: 0,
        scale: 1,
        transition: { duration: 0.4, delay: i * 0.05, ease: "easeOut" }
    }),
    exit: { opacity: 0, x: -30, transition: { duration: 0.2 } },
  };

  return (
    <List sx={{ maxHeight: 400, overflow: 'auto', p: 1, bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 1 }}>
      <AnimatePresence initial={false}>
        {rolls.map((roll, index) => {
           // --- ALTERAÇÃO: Removemos a função getDieType ---

           const timeAgo = roll.timestamp ? formatDistanceToNowStrict(new Date(roll.timestamp), { addSuffix: true, locale: ptBR }) : '';

          return (
            <motion.div
              key={roll._id || roll.timestamp || index}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              custom={index}
              layout
              style={{
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  paddingBottom: 12,
                  marginBottom: 12,
                  // --- ALTERAÇÃO: Cor de fundo da rolagem mais recente ---
                  backgroundColor: index === 0 ? '#21364bff' : 'transparent', // Destaque #517daaff
                  borderRadius: '4px',
                  padding: '8px'
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                     <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                        <strong>{roll.rollerName || 'Mestre'}</strong> rolou: {translateKey(roll.formula) || translateKey(roll.skill) || 'Dados'}
                     </Typography>
                     <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic' }}>
                        {timeAgo}
                     </Typography>
                  </Box>
                }
                secondary={
                  // --- ALTERAÇÃO: Substituímos DieResultDisplay pelo novo layout ---
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {(roll.roll || []).map((dieResult, i) => (
                      <Box
                        key={i}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          p: 1,
                          bgcolor: 'rgba(0, 0, 0, 0.3)', // Fundo escuro para o dado
                          borderRadius: 1,
                          minWidth: '55px' // Largura mínima
                        }}
                      >
                        <Typography variant="caption" sx={{ color: '#ccc', fontWeight: 'bold' }}>
                          {/* Agora usamos dieResult.sides, que é mais preciso */}
                          (d{dieResult.sides || '?'}) 
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', minHeight: '30px', alignItems: 'center' }}>
                          {dieResult.result.length > 0 ? (
                            dieResult.result.map((imgSrc, j) => (
                              <img
                                key={j}
                                src={imgSrc}
                                alt="symbol"
                                style={{ width: "25px", height: "25px", margin: "2px" }} // Tamanho padronizado
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/path/to/default-image.png";
                                }}
                              />
                            ))
                          ) : (
                            // Padronizado para H6, igual ao Snackbar
                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                              {dieResult.face}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                  // --- FIM DA ALTERAÇÃO ---
                }
                sx={{ m: 0 }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </List>
  );
};
// --- END Main Component ---

export default RecentRollsFeed;