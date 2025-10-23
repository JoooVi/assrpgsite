import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { thunk } from 'redux-thunk';
import authReducer from './slices/authSlice';
import itemsReducer from './slices/itemsSlice';
import assimilationsReducer from './slices/assimilationsSlice';
import characteristicsReducer from './slices/characteristicsSlice';
import skillsReducer from './slices/skillsSlice';
import instinctsReducer from './slices/instinctsSlice';
import homebrewsReducer from './slices/homebrewsSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'] // Apenas persistir o estado de autenticação
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    skills: skillsReducer,
    instincts: instinctsReducer,
    characteristics: characteristicsReducer,
    assimilations: assimilationsReducer,
    homebrews: homebrewsReducer,
    items: itemsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});

store.subscribe(() => {
  const state = store.getState();
  const { token, user } = state.auth;
  
  if (token) {
    localStorage.setItem('token', token);
  }
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
});

export const persistor = persistStore(store);

export default store;