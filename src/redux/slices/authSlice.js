import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null
};

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }) => {
    const response = await fetch("https://hystoriarpg-production.up.railway.app/api/login", { // URL do Railway com /api
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    console.log("Resposta do servidor:", data);
    if (response.ok) {
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      return data;
    } else {
      throw new Error(data.message);
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
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      console.log("Logout realizado com sucesso");
    },
    initializeAuth(state) {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "null");
      state.token = token;
      state.user = user;
      state.isAuthenticated = !!(token && user);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        console.log("Login pendente");
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        console.log("Login bem-sucedido, estado atualizado:", {
          user: state.user,
          isAuthenticated: state.isAuthenticated
        });
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        console.error("Erro no login:", action.error.message);
      });
  },
});

export const { logout, initializeAuth } = authSlice.actions;

export const selectIsAuthenticated = (state) => {
  return !!state.auth.token && !!state.auth.user;
};

export default authSlice.reducer;