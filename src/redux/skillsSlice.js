// src/redux/skillsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  skills: {},
};

const skillsSlice = createSlice({
  name: 'skills',
  initialState,
  reducers: {
    setSkills: (state, action) => {
      state.skills = action.payload;
    },
    updateSkills: (state, action) => {
      state.skills = { ...state.skills, ...action.payload };
    },
  },
});

// Exportando as ações para atualizar os skills
export const { setSkills, updateSkills } = skillsSlice.actions;

// Exportando o reducer para ser usado na configuração do Redux
export default skillsSlice.reducer;