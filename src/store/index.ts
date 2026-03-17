// src/store/index.ts

import { configureStore } from '@reduxjs/toolkit';
import documentReducer from './slices/documentSlice';
import commentsReducer from './slices/commentsSlice';
import offlineReducer from './slices/offlineSlice';
import presenceReducer from './slices/presenceSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    document: documentReducer,
    comments: commentsReducer,
    offline: offlineReducer,
    presence: presenceReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Allow non-serializable values in state if needed
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
