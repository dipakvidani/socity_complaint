import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "../../../utils/toast";
import Button from "../../../components/Button/Button";
import { TextField } from "../../../components/Field/Field";
import { getErrorMessage, getFieldErrors } from "../../../config/api";
import { setUser } from "../../../store/authSlice";
import { useAppDispatch } from "../../../store/hooks";
import type { User } from "../../../types";
import { filters, LIMITS, profileSchema, ProfileValues } from "../../../utils/validation";
import { authService } from "../services/authService";

interface ProfileFormProps {
  user: User;
  onDone: () => void;
}

export default function ProfileForm({ user, onDone }: ProfileFormProps) {
  const dispatch = useAppDispatch();
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user.fullName, mobile: user.mobile, flatNumber: user.flatNumber },
  });

  const submit = async (values: ProfileValues) => {
    setBusy(true);
    try {
      const res = await authService.updateProfile(values);
      dispatch(setUser(res.data));
      toast.success(res.message);
      onDone();
    } catch (error) {
      const fields = getFieldErrors(error);
      if (fields) Object.entries(fields).forEach(([name, message]) => setError(name as keyof ProfileValues, { message }));
      toast.error(getErrorMessage(error, "We could not save your details. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Full name" autoComplete="name" maxLength={LIMITS.name} filter={filters.name} error={errors.fullName?.message} {...register("fullName")} />
        <TextField label="Email" value={user.email} disabled readOnly hint="Email cannot be changed." />
        <TextField label="Mobile number" inputMode="numeric" autoComplete="tel" maxLength={LIMITS.mobile} filter={filters.digits} error={errors.mobile?.message} {...register("mobile")} />
        <TextField label="Flat / house number" maxLength={LIMITS.flat} filter={filters.flat} error={errors.flatNumber?.message} {...register("flatNumber")} />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onDone} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" loading={busy}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
