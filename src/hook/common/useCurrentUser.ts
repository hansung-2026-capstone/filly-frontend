import { useCurrentUserQuery } from "../queries/user";

export function useCurrentUser() {
  return useCurrentUserQuery();
}
