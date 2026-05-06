import { queryOptions, useQuery } from "@tanstack/react-query";
import { getMonthlyStat } from "../../api/stat";
import { queryKeys } from "./keys";

export const monthlyStatQueryOptions = (year: number, month: number) =>
  queryOptions({
    queryKey: queryKeys.monthlyStat(year, month),
    queryFn: () => getMonthlyStat(year, month),
  });

export function useMonthlyStatQuery(year: number, month: number) {
  return useQuery(monthlyStatQueryOptions(year, month));
}
