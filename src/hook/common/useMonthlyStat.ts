import { useMonthlyStatQuery } from "../queries/stat";

export function useMonthlyStat(year: number, month: number) {
  const query = useMonthlyStatQuery(year, month);

  return { stat: query.data ?? null, loading: query.isLoading };
}
