import { useIdCardQuery } from "../queries/share";

export function useIdCard() {
  const query = useIdCardQuery();

  return { idCard: query.data ?? null, loading: query.isLoading };
}
