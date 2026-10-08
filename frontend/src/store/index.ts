import { configureStore } from "@reduxjs/toolkit";
import auth from "./authSlice";
import theme from "./themeSlice";

export const store = configureStore({ reducer: { auth, theme } });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
