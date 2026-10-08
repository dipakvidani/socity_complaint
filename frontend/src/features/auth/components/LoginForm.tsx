import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../../components/Button/Button";
import { PasswordField, TextField } from "../../../components/Field/Field";
import { getErrorMessage } from "../../../config/api";
import { setUser } from "../../../store/authSlice";
import { useAppDispatch } from "../../../store/hooks";
import { filters, LIMITS, loginSchema, LoginValues } from "../../../utils/validation";
import { authService } from "../services/authService";

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const submit = async (values: LoginValues) => {
    setBusy(true);
    try {
      const res = await authService.login(values);
      dispatch(setUser(res.data));
      toast.success(res.message);
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "We could not log you in. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <TextField label="Email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={LIMITS.email} filter={filters.email} error={errors.email?.message} {...register("email")} />
      <PasswordField label="Password" autoComplete="current-password" placeholder="Your password" error={errors.password?.message} {...register("password")} />
      <Button type="submit" loading={busy} className="mt-2 !h-11">
        Log in
      </Button>
      <p className="text-center text-small text-mute">
        New to the society app?{" "}
        <Link to="/register" className="font-semibold text-ink underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
