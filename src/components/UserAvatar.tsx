import { useState } from "react";
import { UserRound } from "lucide-react";

interface UserAvatarProps {
  avatarUrl: string | null;
  className?: string;
  imageClassName?: string;
  captureSafe?: boolean;
}

export function UserAvatar({
  avatarUrl,
  className = "w-16 h-16",
  imageClassName = "scale-110",
  captureSafe = false,
}: UserAvatarProps) {
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const profileImageUrl =
    avatarUrl && avatarUrl !== failedAvatarUrl ? avatarUrl : null;

  return (
    <div
      className={`${className} rounded-full border-2 border-[var(--border-avatar)] bg-bg-hover flex items-center justify-center flex-shrink-0 ${
        captureSafe ? "shadow-none" : "overflow-hidden shadow-sm"
      }`}
    >
      {profileImageUrl ? (
        <img
          src={profileImageUrl}
          alt="프로필 이미지"
          loading="eager"
          decoding="sync"
          className={`h-full w-full rounded-full object-cover object-center ${imageClassName}`}
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
