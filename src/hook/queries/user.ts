import {
  queryOptions,
  useMutation,
  useQuery,
  type QueryClient,
} from "@tanstack/react-query";
import { getMe, updateBackgroundTheme, updateNickname, updatePreferences } from "../../api/user";
import { queryKeys } from "./keys";

export const currentUserQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.user,
    queryFn: getMe,
  });

export function useCurrentUserQuery() {
  return useQuery(currentUserQueryOptions());
}

export function useUpdateNicknameMutation() {
  return useMutation({ mutationFn: updateNickname });
}

export function useUpdatePreferencesMutation() {
  return useMutation({ mutationFn: updatePreferences });
}

export function useUpdateBackgroundThemeMutation() {
  return useMutation({ mutationFn: updateBackgroundTheme });
}

export function invalidateUserQuery(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.user });
}
