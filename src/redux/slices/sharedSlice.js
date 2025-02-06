// src/redux/skillsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  skills: {
    knowledge: {},
    practices: {}
  },
  instincts: {},
  selectedInstinct: {},
  rollResults: null,
  isRolling: false
};

const sharedSlice = createSlice({
  name: 'shared',
  initialState,
  reducers: {
    updateSkills: (state, action) => {
      if (action.payload.knowledge) {
        state.skills.knowledge = action.payload.knowledge;
      }
      if (action.payload.practices) {
        state.skills.practices = action.payload.practices;
      }
    },
    updateInstincts: (state, action) => {
      state.instincts = action.payload;
    },
    setSelectedInstinct: (state, action) => {
      state.selectedInstinct = { ...state.selectedInstinct, ...action.payload };
    },
    setRollResults: (state, action) => {
      state.rollResults = action.payload;
    },
    setIsRolling: (state, action) => {
      state.isRolling = action.payload;
    }
  }
});

export const { 
  updateSkills, 
  updateInstincts, 
  setSelectedInstinct,
  setRollResults,
  setError,
  setIsRolling 
} = sharedSlice.actions;

export default sharedSlice.reducer;