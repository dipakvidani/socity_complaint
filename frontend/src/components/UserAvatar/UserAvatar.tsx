import type { User } from "../../types";

interface UserAvatarProps {
  user: Pick<User, "fullName" | "avatarUrl"> | null;
  size?: number;
}

export default function UserAvatar({ user, size = 36 }: UserAvatarProps) {
  const initial = user?.fullName?.[0]?.toUpperCase() ?? "?";
  return user?.avatarUrl ? (
    <img src={user.avatarUrl} alt={user.fullName} style={{ width: size, height: size }} className="rounded-full object-cover" />
  ) : (
    <span style={{ width: size, height: size }} className="flex items-center justify-center rounded-full bg-secondary text-small font-bold text-ink">
      {initial}
    </span>
  );
}
