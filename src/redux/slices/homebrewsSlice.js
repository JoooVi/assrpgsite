import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL, authHeaders } from "../../config/apiConfig";

const requireToken = (getState, rejectWithValue) => {
  const { token } = getState().auth;

  if (!token) {
    return rejectWithValue({ message: "Usuário não autenticado." });
  }

  return token;
};

export const fetchHomebrews = createAsyncThunk(
  "homebrews/fetchHomebrews",
  async (_, { getState, rejectWithValue }) => {
    const token = requireToken(getState, rejectWithValue);
    if (token.payload) return token;

    try {
      const response = await axios.get(`${API_URL}/homebrews`, {
        headers: authHeaders(token),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const createHomebrew = createAsyncThunk(
  "homebrews/createHomebrew",
  async (homebrewData, { getState, rejectWithValue }) => {
    const token = requireToken(getState, rejectWithValue);
    if (token.payload) return token;

    try {
      const response = await axios.post(`${API_URL}/homebrews`, homebrewData, {
        headers: authHeaders(token),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const homebrewsSlice = createSlice({
  name: "homebrews",
  initialState: {
    homebrews: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomebrews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHomebrews.fulfilled, (state, action) => {
        state.loading = false;
        state.homebrews = action.payload;
      })
      .addCase(fetchHomebrews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })
      .addCase(createHomebrew.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHomebrew.fulfilled, (state, action) => {
        state.loading = false;
        state.homebrews.push(action.payload);
      })
      .addCase(createHomebrew.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      });
  },
});

export default homebrewsSlice.reducer;
