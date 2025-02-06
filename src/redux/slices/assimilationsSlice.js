import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Definir a URL base
const API_URL = 'https://assrpgsite-be-production.up.railway.app/api';

// Thunk para criar Assimilation
export const createAssimilation = createAsyncThunk(
  'assimilations/createAssimilation',
  async (assimilationData, { getState, rejectWithValue }) => {
    try {
      const { token, user } = getState().auth;
      if (!token || !user) {
        return rejectWithValue({ message: 'Usuário não autenticado.' });
      }

      const response = await axios.post(
        `${API_URL}/assimilations`,
        {
          ...assimilationData,
          isCustom: true,
          createdBy: user._id,
          userId: user._id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Assimilação criada:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar assimilação:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// assimilationsSlice.js (nova thunk)
export const fetchAllAssimilations = createAsyncThunk(
  'assimilations/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_URL}/assimilations/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data; // Retorna { allAssimilations, userAssimilations }
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
)

// Thunk para atualizar Assimilation
export const updateAssimilation = createAsyncThunk(
  'assimilations/updateAssimilation',
  async ({ id, data }, { getState, rejectWithValue }) => { // Receber apenas id e data
    const token = getState().auth.token;
    try {
      const response = await axios.put(`${API_URL}/assimilations/${id}`, data, { // Alterado para usar API_URL
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
      console.error('Erro ao atualizar assimilação:', error.response?.data || error.message); // Log de erro
      return rejectWithValue(error.response.data);
    }
  }
);

// Thunk para excluir uma Assimilação
export const deleteAssimilation = createAsyncThunk(
  'assimilations/deleteAssimilation',
  async (id, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    try {
      const response = await axios.delete(`${API_URL}/assimilations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id; // Retorna o ID da assimilação excluída
    } catch (error) {
      console.error('Erro ao excluir assimilação:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data);
    }
  }
);

// Thunk para buscar apenas as assimilações do usuário
export const fetchUserAssimilations = createAsyncThunk(
  'assimilations/fetchUserAssimilations',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_URL}/assimilations/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

const initialState = {
  allAssimilations: [], // Todas as assimilações
  userAssimilations: [], // Assimilações do usuário
  loading: false,
  error: null,
};

const assimilationsSlice = createSlice({
  name: 'assimilations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create Assimilation
      .addCase(createAssimilation.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.userAssimilations.push(action.payload); // Adicionar apenas ao userAssimilations
      })
      // Update Assimilation
      .addCase(updateAssimilation.fulfilled, (state, action) => {
        const index = state.userAssimilations.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.userAssimilations[index] = action.payload;
        }
      })
      .addCase(fetchAllAssimilations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAssimilations.fulfilled, (state, action) => {
        state.loading = false;
        state.allAssimilations = action.payload.allAssimilations;
        state.userAssimilations = action.payload.userAssimilations;
      })
      .addCase(fetchAllAssimilations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })  
      // Delete Assimilation
      .addCase(deleteAssimilation.fulfilled, (state, action) => {
        state.loading = false;
        state.userAssimilations = state.userAssimilations.filter(item => item._id !== action.payload);
      })
      // Fetch User Assimilations
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
        state.error = action.payload;
      });
  },
});

export default assimilationsSlice.reducer;