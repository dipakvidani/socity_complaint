import { createSlice } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark";

const read = (): ThemeMode => {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    /* storage not available */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const initialState: { mode: ThemeMode } = { mode: read() };

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleMode(state) {
      state.mode = state.mode === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("theme", state.mode);
      } catch {
        /* storage not available */
      }
    },
  },
});

export const { toggleMode } = themeSlice.actions;
export default themeSlice.reducer;
