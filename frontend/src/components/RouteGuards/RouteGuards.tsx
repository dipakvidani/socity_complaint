import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import type { Role } from "../../types";
import { ForbiddenPage } from "../ErrorPages/ErrorPages";

export function ProtectedRoute({ role }: { role?: Role }) {
  const user = useAppSelector((s) => s.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <ForbiddenPage />;
  return <Outlet />;
}

export function GuestRoute() {
  const user = useAppSelector((s) => s.auth.user);
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function HomeRedirect() {
  const user = useAppSelector((s) => s.auth.user);
  return <Navigate to={user?.role === "admin" ? "/admin" : "/my-complaints"} replace />;
}
