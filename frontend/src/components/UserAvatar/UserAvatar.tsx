import { useState } from "react";
import type { User } from "../../types";

interface UserAvatarProps {
  user: Pick<User, "fullName" | "avatarUrl"> | null;
  size?: number;
}

export default function UserAvatar({ user, size = 36 }: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const initial = user?.fullName?.[0]?.toUpperCase() ?? "?";

  return user?.avatarUrl && !imgError ? (
    <img
      src={user.avatarUrl}
      alt={user.fullName}
      style={{ width: size, height: size }}
      className="rounded-full object-cover shrink-0"
      onError={() => setImgError(true)}
    />
  ) : (
    <span style={{ width: size, height: size }} className="flex shrink-0 items-center justify-center rounded-full bg-secondary text-small font-bold text-ink">
      {initial}
    </span>
  );
}

