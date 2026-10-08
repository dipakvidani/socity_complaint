import { configureStore } from "@reduxjs/toolkit";
import auth from "./authSlice";
import theme from "./themeSlice";
import notification from "./notificationSlice";
import { apiSlice } from "./apiSlice";

export const store = configureStore({
  reducer: {
    auth,
    theme,
    notification,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
