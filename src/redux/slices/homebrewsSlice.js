import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Thunk para buscar Homebrews
export const fetchHomebrews = createAsyncThunk(
  'homebrews/fetchHomebrews',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const response = await axios.get('https://hystoriarpg-production.up.railway.app/api/homebrews', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Thunk para criar um novo Homebrew
export const createHomebrew = createAsyncThunk(
  'homebrews/createHomebrew',
  async (homebrewData, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const response = await axios.post('https://hystoriarpg-production.up.railway.app/api/homebrews', homebrewData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const homebrewsSlice = createSlice({
  name: 'homebrews',
  initialState: {
    homebrews: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Reducers síncronos, se necessário
  },
  extraReducers: (builder) => {
    builder
      // Fetch Homebrews
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
        state.error = action.payload.message;
      })
      // Create Homebrew
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
        state.error = action.payload.message;
      });
  },
});

export default homebrewsSlice.reducer;