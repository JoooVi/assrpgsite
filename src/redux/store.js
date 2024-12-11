// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import skillsReducer from './skillsSlice'; // Importe seu skillsReducer

const store = configureStore({
  reducer: {
    auth: authReducer,
    skills: skillsReducer, // Adicione o skillsReducer aqui
  },
});

console.log('Store configurada com sucesso:', store.getState());

export default store;