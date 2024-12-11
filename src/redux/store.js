import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import skillsReducer from './skillsSlice';  // Importando o reducer de skills

const store = configureStore({
  reducer: {
    auth: authReducer,
    skills: skillsReducer,  // Adicionando o reducer de skills
  },
});

console.log('Store configurada com sucesso:', store.getState());

export default store;