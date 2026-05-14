import { useState } from "react";
import { UserRound } from "lucide-react";

interface UserAvatarProps {
  avatarUrl: string | null;
  className?: string;
}

export function UserAvatar({
  avatarUrl,
  className = "w-16 h-16",
}: UserAvatarProps) {
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const profileImageUrl =
    avatarUrl && avatarUrl !== failedAvatarUrl ? avatarUrl : null;

  return (
    <div
      className={`${className} rounded-full overflow-hidden border-2 border-[var(--border-avatar)] shadow-sm bg-bg-hover flex items-center justify-center flex-shrink-0`}
    >
      {profileImageUrl ? (
        <img
          src={profileImageUrl}
          alt="프로필 이미지"
          className="w-full h-full object-cover"
          onError={() => setFailedAvatarUrl(profileImageUrl)}
        />
      ) : (
        <UserRound
          className="w-1/2 h-1/2 text-[var(--text-muted-light)]"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
