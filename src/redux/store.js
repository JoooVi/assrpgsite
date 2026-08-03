import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import itemsReducer from './slices/itemsSlice';
import assimilationsReducer from './slices/assimilationsSlice';
import characteristicsReducer from './slices/characteristicsSlice';
import skillsReducer from './slices/skillsSlice';
import instinctsReducer from './slices/instinctsSlice';
import homebrewsReducer from './slices/homebrewsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    skills: skillsReducer,
    instincts: instinctsReducer,
    characteristics: characteristicsReducer,
    assimilations: assimilationsReducer,
    homebrews: homebrewsReducer,
    items: itemsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export default store;
