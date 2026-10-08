import { useEffect, useMemo } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Layout from "./components/Layout/Layout";
import { NotFoundPage } from "./components/ErrorPages/ErrorPages";
import { GuestRoute, HomeRedirect, ProtectedRoute } from "./components/RouteGuards/RouteGuards";
import { Loader } from "./components/States/States";
import { LoginPage, ProfilePage, RegisterPage, useSessionLoader } from "./features/auth";
import { AdminDashboardPage, ComplaintDetailPage, ResidentPage } from "./features/complaints";
import { useAppSelector } from "./store/hooks";
import type { ThemeMode } from "./store/themeSlice";

const buildTheme = (mode: ThemeMode) =>
  createTheme({
    palette: { mode, primary: { main: "#e60023" } },
    shape: { borderRadius: 16 },
    typography: { fontFamily: '"Inter", -apple-system, system-ui, "Segoe UI", Roboto, sans-serif' },
    components: {
      MuiDialog: { styleOverrides: { paper: { borderRadius: 32, backgroundImage: "none" } } },
      MuiTooltip: { styleOverrides: { tooltip: { borderRadius: 8, fontSize: 12 } } },
    },
  });

export default function App() {
  useSessionLoader();
  const ready = useAppSelector((s) => s.auth.ready);
  const mode = useAppSelector((s) => s.theme.mode);
  const theme = useMemo(() => buildTheme(mode), [mode]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <Toaster
        position="top-center"
        toastOptions={{ duration: 4000, style: { borderRadius: 16, background: "var(--color-canvas)", color: "var(--color-ink)", border: "1px solid var(--color-hairline)" } }}
      />
      {!ready ? (
        <Loader full label="Getting things ready..." />
      ) : (
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route element={<ProtectedRoute role="resident" />}>
                <Route path="/my-complaints" element={<ResidentPage />} />
              </Route>
              <Route element={<ProtectedRoute role="admin" />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </ThemeProvider>
  );
}
