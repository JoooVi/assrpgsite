import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import skillsReducer from './skillsSlice';
import instinctsReducer from './instinctsSlice';
import characterReducer from '../reducers/reducer';

const store = configureStore({
  reducer: {
    auth: authReducer,
    skills: skillsReducer,
    instincts: instinctsReducer,
    character: characterReducer,
  },
});

export default store;