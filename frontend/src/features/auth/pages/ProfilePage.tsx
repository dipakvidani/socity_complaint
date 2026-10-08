import { useState } from "react";
import toast from "react-hot-toast";
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
      <div>
        <h1 className="text-page font-semibold tracking-tight text-ink">My profile</h1>
        <p className="text-small text-mute">Your details as the society office sees them.</p>
      </div>

      <Card className="flex flex-col gap-4">
        <AvatarPicker file={photo} currentUrl={user.avatarUrl} onChange={setPhoto} />
        {photo && (
          <Button onClick={savePhoto} loading={busy} className="self-start">
            Save photo
          </Button>
        )}
      </Card>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-title font-semibold text-ink">Your details</h2>
          {!editing && (
            <Button variant="secondary" onClick={() => setEditing(true)}>
              Edit details
            </Button>
          )}
        </div>
        {editing ? (
          <ProfileForm user={user} onDone={() => setEditing(false)} />
        ) : (
          <dl className="grid gap-4 sm:grid-cols-2">
            {details.map((d) => (
              <div key={d.label} className="min-w-0">
                <dt className="text-caption font-semibold text-mute">{d.label}</dt>
                <dd className="text-body text-ink">
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
