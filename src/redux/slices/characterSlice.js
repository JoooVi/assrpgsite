// src/redux/slices/characterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null,
  loading: false,
  error: null,
  notes: "",
  inventory: [],
  selectedInstinct: {},
  rollResult: null,
  customRollResult: null,
  snackbarOpen: false,
  selectedTab: 0,
  openItemsModal: false,
  openAssimilationsModal: false,
  openCharacteristicsModal: false,
  selectedItem: null,
  characteristics: [],
  assimilations: [],
  maxWeight: 8,
  editItem: null,
  customDiceFormula: "",
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
    updateCharacter: (state, action) => {
      state.data = action.payload;
    },
    updateCharacterFailure: (state, action) => {
      state.error = action.payload;
    },
    setNotes: (state, action) => {
      state.notes = action.payload;
    },
    setInventory: (state, action) => {
      state.inventory = action.payload;
    },
    setSelectedInstinct: (state, action) => {
      state.selectedInstinct = action.payload;
    },
    setRollResult: (state, action) => {
      state.rollResult = action.payload;
    },
    setCustomRollResult: (state, action) => {
      state.customRollResult = action.payload;
    },
    setSnackbarOpen: (state, action) => {
      state.snackbarOpen = action.payload;
    },
    setSelectedTab: (state, action) => {
      state.selectedTab = action.payload;
    },
    setOpenItemsModal: (state, action) => {
      state.openItemsModal = action.payload;
    },
    setOpenAssimilationsModal: (state, action) => {
      state.openAssimilationsModal = action.payload;
    },
    setOpenCharacteristicsModal: (state, action) => {
      state.openCharacteristicsModal = action.payload;
    },
    setSelectedItem: (state, action) => {
      state.selectedItem = action.payload;
    },
    setCharacteristics: (state, action) => {
      state.characteristics = action.payload;
    },
    setAssimilations: (state, action) => {
      state.assimilations = action.payload;
    },
    setMaxWeight: (state, action) => {
      state.maxWeight = action.payload;
    },
    setEditItem: (state, action) => {
      state.editItem = action.payload;
    },
    setCustomDiceFormula: (state, action) => {
      state.customDiceFormula = action.payload;
    },
    updateCharacterInventory: (state, action) => {
      state.inventory = action.payload.inventory;
    },
  },
});

export const {
  fetchCharacterStart,
  fetchCharacterSuccess,
  fetchCharacterFailure,
  updateCharacter,
  updateCharacterFailure,
  setNotes,
  setInventory,
  setSelectedInstinct,
  setRollResult,
  setCustomRollResult,
  setSnackbarOpen,
  setSelectedTab,
  setOpenItemsModal,
  setOpenAssimilationsModal,
  setOpenCharacteristicsModal,
  setSelectedItem,
  setCharacteristics,
  setAssimilations,
  setMaxWeight,
  setEditItem,
  setCustomDiceFormula,
  updateCharacterInventory, // Certifique-se de que está sendo exportado aqui
} = characterSlice.actions;

export default characterSlice.reducer;