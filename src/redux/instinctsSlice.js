// src/redux/instinctsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  instincts: {},
};

const instinctsSlice = createSlice({
  name: 'instincts',
  initialState,
  reducers: {
    setInstincts: (state, action) => {
      state.instincts = action.payload;
    },
    updateInstincts: (state, action) => {
      state.instincts = { ...state.instincts, ...action.payload };
    },
  },
});

export const { setInstincts, updateInstincts } = instinctsSlice.actions;

export default instinctsSlice.reducer;