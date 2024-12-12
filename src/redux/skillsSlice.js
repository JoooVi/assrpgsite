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

export const { setSkills, updateSkills } = skillsSlice.actions;

export default skillsSlice.reducer;