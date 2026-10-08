import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { clearUser, setUser } from "../../../store/authSlice";
import { setSessionEndHandler } from "../../../config/api";
import { authService } from "../services/authService";

export function useAuthUser() {
  return useAppSelector((s) => s.auth);
}

export function useSessionLoader() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    setSessionEndHandler(() => dispatch(clearUser()));
    authService
      .me()
      .then((res) => dispatch(setUser(res.data)))
      .catch(() => dispatch(clearUser()));
  }, [dispatch]);
}
