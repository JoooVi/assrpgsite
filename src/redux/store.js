import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import skillsReducer from './skillsSlice';
import instinctsReducer from './instinctsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    skills: skillsReducer,
    instincts: instinctsReducer,
  },
});

export default store;