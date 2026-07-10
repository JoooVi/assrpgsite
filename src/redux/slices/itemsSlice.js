import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL, authHeaders, jsonAuthHeaders } from "../../config/apiConfig";

const getAuth = (getState, rejectWithValue) => {
  const { token, user } = getState().auth;

  if (!token) {
    return rejectWithValue({ message: "Usuário não autenticado." });
  }

  return { token, user };
};

export const fetchItems = createAsyncThunk(
  "items/fetchItems",
  async (_, { getState, rejectWithValue }) => {
    const auth = getAuth(getState, rejectWithValue);
    if (auth.payload) return auth;

    try {
      const response = await axios.get(`${API_URL}/items`, {
        headers: authHeaders(auth.token),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchSystemAndCustomItems = createAsyncThunk(
  "items/fetchSystemAndCustom",
  async (_, { getState, rejectWithValue }) => {
    const auth = getAuth(getState, rejectWithValue);
    if (auth.payload) return auth;

    try {
      const response = await axios.get(`${API_URL}/items/system-and-custom`, {
        headers: authHeaders(auth.token),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const createItem = createAsyncThunk(
  "items/createItem",
  async (itemData, { getState, rejectWithValue }) => {
    const auth = getAuth(getState, rejectWithValue);
    if (auth.payload) return auth;

    if (!auth.user) {
      return rejectWithValue({ message: "Usuário não autenticado." });
    }

    try {
      const isFormData = itemData instanceof FormData;
      const response = await axios.post(
        `${API_URL}/items`,
        isFormData
          ? itemData
          : {
              ...itemData,
              isCustom: true,
              createdBy: auth.user._id,
            },
        { headers: isFormData ? authHeaders(auth.token) : jsonAuthHeaders(auth.token) }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateItem = createAsyncThunk(
  "items/updateItem",
  async ({ id, data }, { getState, rejectWithValue }) => {
    const auth = getAuth(getState, rejectWithValue);
    if (auth.payload) return auth;

    try {
      const isFormData = data instanceof FormData;
      const response = await axios.patch(`${API_URL}/items/${id}`, data, {
        headers: isFormData ? authHeaders(auth.token) : jsonAuthHeaders(auth.token),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteItem = createAsyncThunk(
  "items/deleteItem",
  async (id, { getState, rejectWithValue }) => {
    const auth = getAuth(getState, rejectWithValue);
    if (auth.payload) return auth;

    try {
      await axios.delete(`${API_URL}/items/${id}`, {
        headers: authHeaders(auth.token),
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const itemsSlice = createSlice({
  name: "items",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })
      .addCase(updateItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })
      .addCase(deleteItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      });
  },
});

export default itemsSlice.reducer;
