// src/redux/skillsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  knowledge: {},
  practices: {},
  instincts: {},
};

const skillsSlice = createSlice({
  name: 'skills',
  initialState,
  reducers: {
    setSkills: (state, action) => {
      // Atualiza as skills (knowledge e practices) no estado global
      state.knowledge = action.payload.knowledge;
      state.practices = action.payload.practices;
    },
    setInstincts: (state, action) => {
      // Atualiza os instincts
      state.instincts = action.payload;
    },
  },
});

export const { setSkills, setInstincts } = skillsSlice.actions;

export default skillsSlice.reducer;