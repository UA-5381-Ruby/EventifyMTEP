import { configureStore } from '@reduxjs/toolkit';
import componentStateReducer from '@/component-state-slice';
import sidebarReducer from '@/sidebar-slice';

export const store = configureStore({
  reducer: {
    componentState: componentStateReducer,
    sidebar: sidebarReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
