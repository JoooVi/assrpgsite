import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Configuração da Base URL (opcional, para facilitar)
const API_URL = 'https://assrpgsite-be-production.up.railway.app/api';

// Thunk para buscar Itens
export const fetchItems = createAsyncThunk(
  'items/fetchItems',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) {
      return rejectWithValue({ message: 'Usuário não autenticado.' });
    }
    try {
      const response = await axios.get(`${API_URL}/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// itemsSlice.js (nova thunk)
export const fetchSystemAndCustomItems = createAsyncThunk(
  'items/fetchSystemAndCustom',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token, user } = getState().auth;
      const response = await axios.get(`${API_URL}/items/system-and-custom`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Thunk para criar um novo Item
export const createItem = createAsyncThunk(
  'items/createItem',
  async (itemData, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;
      const user = state.auth.user;

      // Verificar autenticação
      if (!token || !user) {
        console.error('Token ou usuário ausente:', { hasToken: !!token, hasUser: !!user });
        return rejectWithValue({ message: 'Usuário não autenticado' });
      }

      const response = await axios.post(
        `${API_URL}/items`,
        {
          ...itemData,
          isCustom: true,
          createdBy: user._id,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Item criado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro completo:', error);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Thunk para atualizar um Item existente
export const updateItem = createAsyncThunk(
  'items/updateItem',
  async ({ id, data }, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) {
      return rejectWithValue({ message: 'Usuário não autenticado.' });
    }
    try {
      const response = await axios.patch(`${API_URL}/items/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

// Thunk para excluir um Item
export const deleteItem = createAsyncThunk(
  'items/deleteItem',
  async (id, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    if (!token) {
      return rejectWithValue({ message: 'Usuário não autenticado.' });
    }
    try {
      const response = await axios.delete(`${API_URL}/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id; // Retorna o ID do item excluído
    } catch (error) {
      console.error('Erro ao excluir item:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data);
    }
  }
);

const itemsSlice = createSlice({
  name: 'items',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Seus reducers aqui
  },
  extraReducers: (builder) => {
    builder
      // Fetch Items
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
      // Create Item
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
      // Update Item
      .addCase(updateItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })
      // Delete Item
      .addCase(deleteItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item._id !== action.payload);
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });
  },
});

export default itemsSlice.reducer;