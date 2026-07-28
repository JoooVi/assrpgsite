import { createSlice } from "@reduxjs/toolkit";
import { normalizeCharacterInstincts } from "../../utils/characterStats";

const initialState = {
  instincts: normalizeCharacterInstincts(),
  selectedInstinct: {},
  loading: false,
  error: null,
};

const instinctsSlice = createSlice({
  name: "instincts",
  initialState,
  reducers: {
    updateInstincts: (state, action) => {
      state.instincts = normalizeCharacterInstincts(action.payload, state.instincts);
      state.error = null;
    },
    setSelectedInstinct: (state, action) => {
      state.selectedInstinct = { ...state.selectedInstinct, ...action.payload };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { updateInstincts, setSelectedInstinct, setLoading, setError } =
  instinctsSlice.actions;
export default instinctsSlice.reducer;
