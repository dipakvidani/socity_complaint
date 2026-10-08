import { useState } from "react";
import toast from "../../../utils/toast";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import Button from "../../../components/Button/Button";
import Card from "../../../components/Card/Card";
import TruncatedText from "../../../components/TruncatedText/TruncatedText";
import { getErrorMessage } from "../../../config/api";
import { setUser } from "../../../store/authSlice";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { formatDate } from "../../../utils/format";
import AvatarPicker from "../components/AvatarPicker";
import ProfileForm from "../components/ProfileForm";
import { authService } from "../services/authService";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [editing, setEditing] = useState(false);

  if (!user) return null;

  const savePhoto = async () => {
    if (!photo) return;
    setBusy(true);
    try {
      const body = new FormData();
      body.append("avatar", photo);
      const res = await authService.updateAvatar(body);
      dispatch(setUser(res.data));
      setPhoto(null);
      toast.success(res.message);
    } catch (error) {
      toast.error(getErrorMessage(error, "We could not update your photo. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const removePhoto = async () => {
    setRemoving(true);
    try {
      const res = await authService.deleteAvatar();
      dispatch(setUser(res.data));
      setPhoto(null);
      toast.success(res.message);
    } catch (error) {
      toast.error(getErrorMessage(error, "We could not remove your photo. Please try again."));
    } finally {
      setRemoving(false);
    }
  };

  const details = [
    { label: "Full name", value: user.fullName },
    { label: "Email", value: user.email },
    { label: "Mobile number", value: user.mobile },
    { label: "Flat / house number", value: user.flatNumber },
    { label: "Role", value: user.role === "admin" ? "Society admin" : "Resident" },
    { label: "Member since", value: formatDate(user.createdAt) },
  ];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {/* Header Title */}
      <div>
        <h1 className="text-page font-semibold tracking-tight text-ink">My Profile</h1>
        <p className="text-small text-mute">Manage your society account details and profile photo.</p>
      </div>

      {/* Avatar Card */}
      <Card className="flex flex-col gap-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <AvatarPicker
          file={photo}
          currentUrl={user.avatarUrl}
          onChange={setPhoto}
          onRemovePhoto={user.avatarUrl ? removePhoto : undefined}
          removingPhoto={removing}
        />

        {photo && (
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-caption font-medium">
              <CheckCircleOutlinedIcon className="!text-[16px]" />
              <span>New photo selected - click save to apply changes</span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setPhoto(null)} disabled={busy}>
                Cancel
              </Button>
              <Button onClick={savePhoto} loading={busy}>
                Save Photo
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Profile Details Card */}
      <Card className="flex flex-col gap-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div>
            <h2 className="text-title font-semibold text-ink">Account Details</h2>
            <p className="text-caption text-mute">Your verified contact information</p>
          </div>
          {!editing && (
            <Button variant="secondary" onClick={() => setEditing(true)}>
              Edit Details
            </Button>
          )}
        </div>

        {editing ? (
          <ProfileForm user={user} onDone={() => setEditing(false)} />
        ) : (
          <dl className="grid gap-5 sm:grid-cols-2">
            {details.map((d) => (
              <div key={d.label} className="min-w-0 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <dt className="text-caption font-semibold text-mute">{d.label}</dt>
                <dd className="text-body font-medium text-ink mt-0.5">
                  <TruncatedText text={d.value} />
                </dd>
              </div>
            ))}
          </dl>
        )}
      </Card>
    </div>
  );
}
