import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL, authHeaders, jsonAuthHeaders } from "../../config/apiConfig";

const requireAuth = (getState, rejectWithValue) => {
  const { token, user } = getState().auth;

  if (!token) {
    return rejectWithValue({ message: "Usuário não autenticado." });
  }

  return { token, user };
};

export const createAssimilation = createAsyncThunk(
  "assimilations/createAssimilation",
  async (assimilationData, { getState, rejectWithValue }) => {
    const auth = requireAuth(getState, rejectWithValue);
    if (auth.payload) return auth;

    if (!auth.user) {
      return rejectWithValue({ message: "Usuário não autenticado." });
    }

    try {
      const response = await axios.post(
        `${API_URL}/assimilations`,
        {
          ...assimilationData,
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

export const fetchAllAssimilations = createAsyncThunk(
  "assimilations/fetchAll",
  async (_, { getState, rejectWithValue }) => {
    const auth = requireAuth(getState, rejectWithValue);
    if (auth.payload) return auth;

    try {
      const response = await axios.get(`${API_URL}/assimilations/all`, {
        headers: authHeaders(auth.token),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateAssimilation = createAsyncThunk(
  "assimilations/updateAssimilation",
  async ({ id, data }, { getState, rejectWithValue }) => {
    const auth = requireAuth(getState, rejectWithValue);
    if (auth.payload) return auth;

    try {
      const response = await axios.patch(`${API_URL}/assimilations/${id}`, data, {
        headers: authHeaders(auth.token),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteAssimilation = createAsyncThunk(
  "assimilations/deleteAssimilation",
  async (id, { getState, rejectWithValue }) => {
    const auth = requireAuth(getState, rejectWithValue);
    if (auth.payload) return auth;

    try {
      await axios.delete(`${API_URL}/assimilations/${id}`, {
        headers: authHeaders(auth.token),
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchUserAssimilations = createAsyncThunk(
  "assimilations/fetchUserAssimilations",
  async (_, { getState, rejectWithValue }) => {
    const auth = requireAuth(getState, rejectWithValue);
    if (auth.payload) return auth;

    try {
      const response = await axios.get(`${API_URL}/assimilations/user`, {
        headers: authHeaders(auth.token),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const initialState = {
  allAssimilations: [],
  userAssimilations: [],
  loading: false,
  error: null,
};

const assimilationsSlice = createSlice({
  name: "assimilations",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createAssimilation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAssimilation.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.userAssimilations.push(action.payload);
      })
      .addCase(createAssimilation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })
      .addCase(updateAssimilation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAssimilation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.userAssimilations.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) state.userAssimilations[index] = action.payload;
      })
      .addCase(updateAssimilation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })
      .addCase(fetchAllAssimilations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAssimilations.fulfilled, (state, action) => {
        state.loading = false;
        state.allAssimilations = action.payload?.allAssimilations || [];
        state.userAssimilations = action.payload?.userAssimilations || [];
      })
      .addCase(fetchAllAssimilations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })
      .addCase(deleteAssimilation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAssimilation.fulfilled, (state, action) => {
        state.loading = false;
        state.userAssimilations = state.userAssimilations.filter((item) => item._id !== action.payload);
      })
      .addCase(deleteAssimilation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })
      .addCase(fetchUserAssimilations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAssimilations.fulfilled, (state, action) => {
        state.loading = false;
        state.userAssimilations = action.payload;
      })
      .addCase(fetchUserAssimilations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      });
  },
});

export default assimilationsSlice.reducer;
