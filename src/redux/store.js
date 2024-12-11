// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import skillsReducer from './skillsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    skills: skillsReducer,  // Adicionando skills aqui
  },
});

console.log('Store configurada com sucesso:', store.getState());

export default store;
