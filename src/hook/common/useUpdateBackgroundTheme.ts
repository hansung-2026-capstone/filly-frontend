import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "../../types/user";
import {
  type BackgroundThemeId,
  setStoredBackgroundThemeId,
} from "../../lib/backgroundTheme";
import { queryKeys } from "../queries/keys";
import {
  invalidateUserQuery,
  useUpdateBackgroundThemeMutation,
} from "../queries/user";

export function useUpdateBackgroundTheme() {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const mutation = useUpdateBackgroundThemeMutation();

  const updateBackgroundTheme = useCallback(
    async (backgroundTheme: BackgroundThemeId) => {
      setError(null);
      try {
        await mutation.mutateAsync(backgroundTheme);
        setStoredBackgroundThemeId(backgroundTheme);
        queryClient.setQueryData<User>(queryKeys.user, (user) =>
          user ? { ...user, backgroundTheme } : user,
        );
        await invalidateUserQuery(queryClient);
      } catch (mutationError) {
        setError("테마를 저장하지 못했습니다.");
        throw mutationError;
      }
    },
    [mutation, queryClient],
  );

  return {
    updateBackgroundTheme,
    saving: mutation.isPending,
    error,
    clearError: () => setError(null),
  };
}
