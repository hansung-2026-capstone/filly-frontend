import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { IdCard } from "../../types/share";
import type { User } from "../../types/user";
import { queryKeys } from "../queries/keys";
import { invalidateIdCardQuery } from "../queries/share";
import {
  invalidateUserQuery,
  useUpdateNicknameMutation,
} from "../queries/user";

export function useUpdateNickname() {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const mutation = useUpdateNicknameMutation();

  const updateNickname = useCallback(
    async (nickname: string) => {
      setError(null);
      try {
        await mutation.mutateAsync(nickname);
        queryClient.setQueryData<User>(queryKeys.user, (user) =>
          user ? { ...user, nickname } : user,
        );
        queryClient.setQueryData<IdCard>(queryKeys.idCard, (idCard) =>
          idCard ? { ...idCard, nickname } : idCard,
        );
        await Promise.all([
          invalidateUserQuery(queryClient),
          invalidateIdCardQuery(queryClient),
        ]);
      } catch (mutationError) {
        setError("닉네임을 저장하지 못했습니다.");
        throw mutationError;
      }
    },
    [mutation, queryClient],
  );

  return {
    updateNickname,
    saving: mutation.isPending,
    error,
    clearError: () => setError(null),
  };
}
