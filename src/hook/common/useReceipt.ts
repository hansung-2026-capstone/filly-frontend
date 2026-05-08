import { useReceiptQuery } from "../queries/share";

export function useReceipt(year: number, month: number) {
  const query = useReceiptQuery(year, month);

  return { receipt: query.data ?? null, loading: query.isLoading };
}
