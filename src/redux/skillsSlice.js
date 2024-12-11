// src/redux/skillsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const skillsSlice = createSlice({
  name: 'skills',
  initialState: {
    skills: {},
    loading: false,
  },
  reducers: {
    updateSkills: (state, action) => {
      state.skills = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { updateSkills, setLoading } = skillsSlice.actions;
export default skillsSlice.reducer;