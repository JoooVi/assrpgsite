// skillsSlice.js - Versão Limpa

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  skills: {},
  selectedInstinct: {}
};

export const skillsSlice = createSlice({
  name: 'skills',
  initialState,
  reducers: {
    // Esta função está correta e é a que está sendo usada para
    // preencher as perícias na sua ficha.
    updateSkills: (state, action) => {
      state.skills = action.payload;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    // ### REMOVIDO ###
    // A função updateSkillValue foi removida por ser obsoleta e
    // incompatível com a estrutura de dados atual (plana).
    // updateSkillValue: (state, action) => { ... },

    setSelectedInstinct: (state, action) => {
      state.selectedInstinct = { ...state.selectedInstinct, ...action.payload };
    }
  }
});

// Removemos a exportação da função que não existe mais
export const { updateSkills, setSelectedInstinct, setLoading } = skillsSlice.actions;
export default skillsSlice.reducer;