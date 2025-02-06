// skillsSlice.js
import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  skills: {},
  selectedInstinct: {}
};

export const skillsSlice = createSlice({
  name: 'skills',
  initialState,
  reducers: {
    updateSkills: (state, action) => {

      state.skills = action.payload;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    updateSkillValue: (state, action) => {
      const { category, skillKey, value } = action.payload;
      state.skills[category] = {
        ...state.skills[category],
        [skillKey]: value
      };
    },

    setSelectedInstinct: (state, action) => {
      state.selectedInstinct = { ...state.selectedInstinct, ...action.payload };
    }
  }
});

export const { updateSkills, updateSkillValue, setSelectedInstinct, setLoading } = skillsSlice.actions;
export default skillsSlice.reducer;