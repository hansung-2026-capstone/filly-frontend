import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { User, UserPreferencesUpdateRequest } from "../../types/user";
import { queryKeys } from "../queries/keys";
import {
  invalidateUserQuery,
  useUpdatePreferencesMutation,
} from "../queries/user";

export function useUpdatePreferences() {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const mutation = useUpdatePreferencesMutation();

  const updatePreferences = useCallback(
    async (preferences: UserPreferencesUpdateRequest) => {
      setError(null);
      try {
        await mutation.mutateAsync(preferences);
        queryClient.setQueryData<User>(queryKeys.user, (user) =>
          user ? { ...user, ...preferences } : user,
        );
        await invalidateUserQuery(queryClient);
      } catch (mutationError) {
        setError("개인화 설정을 저장하지 못했습니다.");
        throw mutationError;
      }
    },
    [mutation, queryClient],
  );

  return {
    updatePreferences,
    saving: mutation.isPending,
    error,
    clearError: () => setError(null),
  };
}
