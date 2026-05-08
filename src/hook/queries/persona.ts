import { queryOptions, useQuery } from "@tanstack/react-query";
import { getPersonas } from "../../api/persona";
import { queryKeys } from "./keys";

export const personasQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.personas,
    queryFn: getPersonas,
  });

export function usePersonasQuery() {
  return useQuery(personasQueryOptions());
}
