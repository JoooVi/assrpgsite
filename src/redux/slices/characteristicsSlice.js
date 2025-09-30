import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Definir a URL base
const API_URL = 'https://assrpgsite-be-production.up.railway.app/api';

// Modifique a thunk fetchCharacterTraits
export const fetchCharacterTraits = createAsyncThunk(
  'characteristics/fetchCharacterTraits',
  async (_, { getState, rejectWithValue }) => {
    const { token, user } = getState().auth;
    
    if (!token || !user) {
      return rejectWithValue({ message: 'Token de autenticação ausente' });
    }

    try {
      const response = await axios.get(`${API_URL}/charactertraits`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const fetchUserCharacterTraits = createAsyncThunk(
  'characteristics/fetchUserTraits',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    const user = getState().auth.user;
    
    try {
      const response = await axios.get(`${API_URL}/charactertraits/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// Thunk para criar uma nova Característica
export const createCharacteristic = createAsyncThunk(
  'characteristics/createCharacteristic',
  async (traitData, { getState, rejectWithValue }) => {
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
        `${API_URL}/charactertraits`,
        {
          ...traitData,
          isCustom: true,
          createdBy: user._id,
          userId: user._id
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Característica criada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro completo:', error);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Thunk para atualizar uma Característica
export const updateCharacteristic = createAsyncThunk(
  'characteristics/updateCharacteristic',
  async ({ id, data }, { getState, rejectWithValue }) => { // Receber apenas id e data
    const token = getState().auth.token;
    try {
      const response = await axios.patch(`${API_URL}/charactertraits/${id}`, data, { // Alterado para usar API_URL
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Características atualizadas:', response.data); // Log de depuração
      return response.data;
    } catch (err) {
      console.error('Erro ao atualizar característica:', err.response?.data || err.message); // Log de erro
      return rejectWithValue(err.response.data);
    }
  }
);

// Thunk para excluir uma Característica
export const deleteCharacteristic = createAsyncThunk(
  'characteristics/deleteCharacteristic',
  async (id, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.auth.token;
    const isAuthenticated = state.auth.isAuthenticated;

    console.log('Estado da autenticação:', { isAuthenticated, hasToken: !!token });

    if (!isAuthenticated || !token) {
      console.error('Usuário não está autenticado ou token ausente');
      return rejectWithValue({ message: "Not authorized, no token" });
    }

    try {
      const response = await axios.delete(`${API_URL}/charactertraits/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Resposta da exclusão:', response.data);
      return id;
    } catch (error) {
      console.error('Erro detalhado:', {
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const characteristicsSlice = createSlice({
  name: 'characteristics',
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
    // Adicione outros reducers conforme necessário
  },
  extraReducers: (builder) => {
    builder
      // Fetch Character Traits
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
        state.error = action.payload;
      })
      // Create Characteristic
      .addCase(createCharacteristic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserCharacterTraits.fulfilled, (state, action) => {
        state.loading = false;
        state.characterTraits = action.payload;
      })
      .addCase(createCharacteristic.fulfilled, (state, action) => {
        state.loading = false;
        state.characterTraits.push(action.payload);
      })
      .addCase(createCharacteristic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Update Characteristic
      .addCase(updateCharacteristic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCharacteristic.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.characterTraits.findIndex(trait => trait._id === action.payload._id);
        if (index !== -1) {
          state.characterTraits[index] = action.payload;
        }
      })
      .addCase(updateCharacteristic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Delete Characteristic
      .addCase(deleteCharacteristic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCharacteristic.fulfilled, (state, action) => {
        console.log(`Atualizando o estado para remover o ID ${action.payload}`);
        state.loading = false;
        state.characterTraits = state.characterTraits.filter(trait => trait._id !== action.payload);
      })
      .addCase(deleteCharacteristic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });
  },
});

export const { updateCharacteristics, addCharacteristic } = characteristicsSlice.actions;
export default characteristicsSlice.reducer;