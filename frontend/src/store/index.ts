import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import repositoryReducer from './repositorySlice';
import scanReducer from './scanSlice';
import trainingReducer from './trainingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    repositories: repositoryReducer,
    scans: scanReducer,
    training: trainingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
