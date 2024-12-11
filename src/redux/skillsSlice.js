import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  skills: {
    agrarian: 0,
    biological: 0,
    exact: 0,
    medicine: 0,
    social: 0,
    artistic: 0,
    sports: 0,
    tools: 0,
    crafts: 0,
    weapons: 0,
    vehicles: 0,
    infiltration: 0,
  },
  instincts: {
    agrarian: '',
    biological: '',
    exact: '',
    medicine: '',
    social: '',
    artistic: '',
    sports: '',
    tools: '',
    crafts: '',
    weapons: '',
    vehicles: '',
    infiltration: '',
  },
};

const skillsSlice = createSlice({
  name: 'skills',
  initialState,
  reducers: {
    setSkills: (state, action) => {
      state.skills = action.payload;
    },
    setInstincts: (state, action) => {
      state.instincts = action.payload;
    },
    updateSkill: (state, action) => {
      const { key, value } = action.payload;
      state.skills[key] = value;
    },
    updateInstinct: (state, action) => {
      const { key, value } = action.payload;
      state.instincts[key] = value;
    },
  },
});

export const { setSkills, setInstincts, updateSkill, updateInstinct } = skillsSlice.actions;

export default skillsSlice.reducer;