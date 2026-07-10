import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL, authHeaders, jsonAuthHeaders } from "../../config/apiConfig";

const requireAuth = (getState, rejectWithValue) => {
  const { token, user, isAuthenticated } = getState().auth;

  if (!token || !user) {
    return rejectWithValue({ message: "Usuário não autenticado." });
  }

  return { token, user, isAuthenticated };
};

export const fetchCharacterTraits = createAsyncThunk(
  "characteristics/fetchCharacterTraits",
  async (_, { getState, rejectWithValue }) => {
    const auth = requireAuth(getState, rejectWithValue);
    if (auth.payload) return auth;

    try {
      const response = await axios.get(`${API_URL}/charactertraits`, {
        headers: jsonAuthHeaders(auth.token),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchUserCharacterTraits = createAsyncThunk(
  "characteristics/fetchUserTraits",
  async (_, { getState, rejectWithValue }) => {
    const auth = requireAuth(getState, rejectWithValue);
    if (auth.payload) return auth;

    try {
      const response = await axios.get(`${API_URL}/charactertraits/user`, {
        headers: authHeaders(auth.token),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const createCharacteristic = createAsyncThunk(
  "characteristics/createCharacteristic",
  async (traitData, { getState, rejectWithValue }) => {
    const auth = requireAuth(getState, rejectWithValue);
    if (auth.payload) return auth;

    try {
      const response = await axios.post(
        `${API_URL}/charactertraits`,
        {
          ...traitData,
          isCustom: true,
          createdBy: auth.user._id,
          userId: auth.user._id,
        },
        { headers: jsonAuthHeaders(auth.token) }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateCharacteristic = createAsyncThunk(
  "characteristics/updateCharacteristic",
  async ({ id, data }, { getState, rejectWithValue }) => {
    const auth = requireAuth(getState, rejectWithValue);
    if (auth.payload) return auth;

    try {
      const response = await axios.patch(`${API_URL}/charactertraits/${id}`, data, {
        headers: authHeaders(auth.token),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteCharacteristic = createAsyncThunk(
  "characteristics/deleteCharacteristic",
  async (id, { getState, rejectWithValue }) => {
    const auth = requireAuth(getState, rejectWithValue);
    if (auth.payload) return auth;

    if (!auth.isAuthenticated) {
      return rejectWithValue({ message: "Usuário não autenticado." });
    }

    try {
      await axios.delete(`${API_URL}/charactertraits/${id}`, {
        headers: jsonAuthHeaders(auth.token),
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const characteristicsSlice = createSlice({
  name: "characteristics",
  initialState: {
    characterTraits: [],
    loading: false,
    error: null,
  },
  reducers: {
    updateCharacteristics: (state, action) => {
      state.characterTraits = action.payload;
    },
    addCharacteristic: (state, action) => {
      state.characterTraits.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCharacterTraits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCharacterTraits.fulfilled, (state, action) => {
        state.loading = false;
        state.characterTraits = action.payload;
      })
      .addCase(fetchCharacterTraits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })
      .addCase(fetchUserCharacterTraits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserCharacterTraits.fulfilled, (state, action) => {
        state.loading = false;
        state.characterTraits = action.payload;
      })
      .addCase(fetchUserCharacterTraits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })
      .addCase(createCharacteristic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCharacteristic.fulfilled, (state, action) => {
        state.loading = false;
        state.characterTraits.push(action.payload);
      })
      .addCase(createCharacteristic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })
      .addCase(updateCharacteristic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCharacteristic.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.characterTraits.findIndex((trait) => trait._id === action.payload._id);
        if (index !== -1) state.characterTraits[index] = action.payload;
      })
      .addCase(updateCharacteristic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })
      .addCase(deleteCharacteristic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCharacteristic.fulfilled, (state, action) => {
        state.loading = false;
        state.characterTraits = state.characterTraits.filter((trait) => trait._id !== action.payload);
      })
      .addCase(deleteCharacteristic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      });
  },
});

export const { updateCharacteristics, addCharacteristic } = characteristicsSlice.actions;
export default characteristicsSlice.reducer;
