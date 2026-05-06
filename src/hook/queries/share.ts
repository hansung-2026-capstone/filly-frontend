import { queryOptions, useQuery } from "@tanstack/react-query";
import { getIdCard, getReceipt } from "../../api/share";
import { queryKeys } from "./keys";

export const idCardQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.idCard,
    queryFn: getIdCard,
  });

export const receiptQueryOptions = (year: number, month: number) =>
  queryOptions({
    queryKey: queryKeys.receipt(year, month),
    queryFn: () => getReceipt(year, month),
  });

export function useIdCardQuery() {
  return useQuery(idCardQueryOptions());
}

export function useReceiptQuery(year: number, month: number) {
  return useQuery(receiptQueryOptions(year, month));
}
