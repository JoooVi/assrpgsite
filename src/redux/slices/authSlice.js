import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { jwtDecode } from 'jwt-decode';

// Função auxiliar para carregar o usuário inicial de forma segura
const getInitialUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Falha ao carregar usuário do localStorage:", error);
    return null;
  }
};

const initialState = {
  user: getInitialUser(),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch("https://assrpgsite-be-production.up.railway.app/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        return data;
      } else {
        return rejectWithValue(data.message);
      }
    } catch (error) {
        return rejectWithValue(error.message || 'Não foi possível conectar ao servidor');
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    initializeAuth(state) {
      const token = localStorage.getItem("token");
      const user = getInitialUser();
      if (token && user) {
        state.token = token;
        state.user = user;
        state.isAuthenticated = true;
        state.status = 'succeeded';
      } else {
        state.isAuthenticated = false;
      }
    },
    setAuthFromToken(state, action) {
        const token = action.payload;
        if (token) {
            const decodedUser = jwtDecode(token);
            
            // Para isso funcionar perfeitamente, seu backend deve incluir
            // name e avatar no payload do JWT ao criá-lo.
            const userPayload = {
              _id: decodedUser.userId,
              name: decodedUser.name,
              avatar: decodedUser.avatar,
            }

            state.token = token;
            state.user = userPayload;
            state.isAuthenticated = true;
            state.status = 'succeeded';
            state.error = null;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userPayload));
        }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { logout, initializeAuth, setAuthFromToken } = authSlice.actions;

export default authSlice.reducer;