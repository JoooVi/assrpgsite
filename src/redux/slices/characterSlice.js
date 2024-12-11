// src/redux/slices/characterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null,
  loading: false,
  error: null,
  notes: "",
  inventory: [],
};

const characterSlice = createSlice({
  name: 'character',
  initialState,
  reducers: {
    fetchCharacterStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCharacterSuccess: (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchCharacterFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setNotes: (state, action) => {
      state.notes = action.payload;
    },
    setInventory: (state, action) => {
      state.inventory = action.payload;
    },
  },
});

export const {
  fetchCharacterStart,
  fetchCharacterSuccess,
  fetchCharacterFailure,
  setNotes,
  setInventory,
} = characterSlice.actions;

export default characterSlice.reducer;