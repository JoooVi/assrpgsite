import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import skillsReducer from './skillsSlice';
import characterReducer from './slices/characterSlice';  // Importando o characterSlice

const store = configureStore({
  reducer: {
    auth: authReducer,
    skills: skillsReducer,
    character: characterReducer,  // Adicionando o characterReducer
  },
});

export default store;