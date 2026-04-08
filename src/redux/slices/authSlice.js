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

// Função auxiliar para carregar refresh token
const getInitialRefreshToken = () => {
  try {
    return localStorage.getItem('refreshToken') || null;
  } catch (error) {
    console.error("Falha ao carregar refreshToken do localStorage:", error);
    return null;
  }
};

const initialState = {
  user: getInitialUser(),
  token: localStorage.getItem('token') || localStorage.getItem('accessToken') || null,
  refreshToken: getInitialRefreshToken(),
  isAuthenticated: !!localStorage.getItem('token') || !!localStorage.getItem('accessToken'),
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
        // Suportar tanto 'token' (antigo) quanto 'accessToken' (novo)
        const accessToken = data.accessToken || data.token;
        localStorage.setItem("token", accessToken);
        localStorage.setItem("accessToken", accessToken);
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }
        return {
          user: data.user,
          token: accessToken,
          refreshToken: data.refreshToken,
        };
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
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
    updateUser(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('accessToken', action.payload.token);
    },
    // Novo reducer para atualizar tokens após refresh
    updateTokens(state, action) {
      const { accessToken, refreshToken } = action.payload;
      state.token = accessToken;
      if (refreshToken) {
        state.refreshToken = refreshToken;
      }
      localStorage.setItem('token', accessToken);
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    },

    initializeAuth(state) {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      const user = getInitialUser();
      if (token && user) {
        state.token = token;
        state.refreshToken = refreshToken;
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
            localStorage.setItem('accessToken', token);
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
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
      });
  },
});

export const { logout, initializeAuth, setAuthFromToken, updateUser, updateTokens } = authSlice.actions;

export default authSlice.reducer;