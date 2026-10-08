import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "../../../utils/toast";
import Button from "../../../components/Button/Button";
import { PasswordField, TextField } from "../../../components/Field/Field";
import { getErrorMessage, getFieldErrors } from "../../../config/api";
import { filters, LIMITS, registerSchema, RegisterValues } from "../../../utils/validation";
import { authService } from "../services/authService";
import AvatarPicker from "./AvatarPicker";

export default function RegisterForm() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", mobile: "", flatNumber: "", password: "" },
  });

  const submit = async (values: RegisterValues) => {
    setBusy(true);
    try {
      const body = new FormData();
      Object.entries(values).forEach(([k, v]) => body.append(k, v));
      if (avatar) body.append("avatar", avatar);
      const res = await authService.register(body);
      toast.success(res.message);
      navigate("/login", { replace: true });
    } catch (error) {
      const fields = getFieldErrors(error);
      if (fields) Object.entries(fields).forEach(([name, message]) => setError(name as keyof RegisterValues, { message }));
      toast.error(getErrorMessage(error, "We could not create your account. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <AvatarPicker file={avatar} onChange={setAvatar} />
      <TextField label="Full name" autoComplete="name" placeholder="Asha Verma" maxLength={LIMITS.name} filter={filters.name} error={errors.fullName?.message} {...register("fullName")} />
      <TextField label="Email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={LIMITS.email} filter={filters.email} error={errors.email?.message} {...register("email")} />
      <TextField label="Mobile number" inputMode="numeric" autoComplete="tel" placeholder="9876543210" maxLength={LIMITS.mobile} filter={filters.digits} error={errors.mobile?.message} {...register("mobile")} />
      <TextField label="Flat / house number" placeholder="A-101" maxLength={LIMITS.flat} filter={filters.flat} error={errors.flatNumber?.message} {...register("flatNumber")} />
      <PasswordField
        label="Password"
        autoComplete="new-password"
        placeholder="Create a password"
        hint="At least 8 characters with uppercase, lowercase, a number and a special character."
        error={errors.password?.message}
        {...register("password")}
      />
      <Button type="submit" loading={busy} className="mt-2 !h-11">
        Create account
      </Button>
      <p className="text-center text-small text-mute">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-ink underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
