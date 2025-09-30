import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, List, ListItem, ListItemText, CircularProgress } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

// --- Dice Assets (Completo, certifique-se de que está igual ao CharacterSheet.js) ---
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

// NOVA FUNÇÃO DE TRADUÇÃO (COPIADA DO CharacterSheet.js)
const translateKey = (key) => {
  const translations = {
    health: "Saúde",
    Agility: "Agilidade",
    agility: "Agilidade",
    Perception: "Percepção",
    perception: "Percepção",
    Strength: "Força",
    strength: "Força",
    Current: "Atual",
    current: "Atual",
    collapse: "Colapso",
    preCollapse: "pré-Colapso",
    postCollapse: "Pós-Colapso",
    Intelligence: "Inteligência",
    Potency: "Potencia",
    potency: "Potencia",
    Influence: "Influência",
    influence: "Influência",
    Resolution: "Resolução",
    resolution: "Resolução",
    Knowledge: "Conhecimento",
    knowledge: "Conhecimento",
    Practices: "Práticas",
    practices: "Práticas",
    Instincts: "Instintos",
    instincts: "Instintos",
    Sagacity: "Sagacidade",
    sagacity: "Sagacidade",
    infiltration: "Infiltração",
    Reaction: "Reação",
    reaction: "Reação",
    Agrarian: "Agrario", // Tradução para Agrarian
    agrarian: "Agrario",
    Biological: "Biologico", // Tradução para Biological
    biological: "Biologico",
    Exact: "Exato", // Tradução para Exact
    exact: "Exato",
    Medicine: "Medicina", // Tradução para Medicine
    medicine: "Medicina",
    Social: "Social", // Tradução para Social
    social: "Social",
    Artistic: "Artistico", // Tradução para Artistic
    artistic: "Artistico",
    Sports: "Esportivas", // Tradução para Sports
    sports: "Esportivas",
    Tools: "Ferramentas", // Tradução para Tools
    tools: "Ferramentas",
    Crafts: "Oficios", // Tradução para Crafts
    crafts: "Oficios",
    Weapons: "Armas", // Tradução para Weapons
    weapons: "Armas",
    Vehicles: "Veiculos", // Tradução para Vehicles
    vehicles: "Veiculos",
    Infiltration: "Infiltração", // Tradução para Infiltration
  };

  return translations[key] || key;
};


const RecentRollsFeed = ({ rolls }) => {

  if (!rolls || rolls.length === 0) {
    return <Typography variant="body2" sx={{ color: '#ccc' }}>Nenhuma rolagem recente.</Typography>;
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } },
    highlighted: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
    subtle: { opacity: 0.6, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <List sx={{ maxHeight: 300, overflow: 'auto', p: 0 }}>
      <AnimatePresence initial={false}>
        {rolls.map((roll, index) => (
          <motion.div
            key={roll._id || roll.timestamp || index}
            variants={itemVariants}
            initial="hidden"
            animate={index === 0 ? "highlighted" : "subtle"}
            exit="exit"
            layout
            style={{
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                paddingBottom: 8,
                marginBottom: 8
            }}
          >
            <ListItemText
              primary={
                <Typography variant="subtitle2" sx={{ color: '#eee', fontWeight: 'bold' }}>
                  <strong>{roll.rollerName || 'Mestre'}</strong> rolou: {translateKey(roll.formula) || translateKey(roll.skill) || 'Dados'} {/* APLICA TRADUÇÃO AQUI */}
                </Typography>
              }
              secondary={
                <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 0.5 }}>
                  {(roll.roll || []).map((dieResult, i) => (
                    <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 1, mb: 1 }}>
                      <Typography variant="caption" sx={{ color: '#bbb' }}>
                          D{dieResult.face === 6 ? 6 : (dieResult.face === 10 ? 10 : 12)}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {(dieResult.result || []).length > 0 ? (
                          dieResult.result.map((imgSrc, j) => (
                            <img
                              key={j}
                              src={imgSrc}
                              alt="symbol"
                              style={{ width: '20px', height: '20px', margin: '1px' }}
                              onError={(e) => { e.target.onerror = null; e.target.src = "/path/to/default-image.png"; }}
                            />
                          ))
                        ) : (
                          <Typography variant="body2" sx={{ color: '#f00' }}>{dieResult.face}</Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              }
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </List>
  );
};

export default RecentRollsFeed;