import { useEffect, useReducer } from "react";

type AsyncState<T> = {
  data: T;
  loading: boolean;
  error: unknown;
};

type AsyncAction<T> =
  | { type: "start" }
  | { type: "success"; data: T }
  | { type: "error"; error: unknown; fallbackData: T };

function asyncResourceReducer<T>(
  state: AsyncState<T>,
  action: AsyncAction<T>,
): AsyncState<T> {
  switch (action.type) {
    case "start":
      return { ...state, loading: true, error: null };
    case "success":
      return { data: action.data, loading: false, error: null };
    case "error":
      return { data: action.fallbackData, loading: false, error: action.error };
    default:
      return state;
  }
}

export function useAsyncResource<T>(
  load: () => Promise<T>,
  fallbackData: T,
  debugLabel?: string,
) {
  const [state, dispatch] = useReducer(asyncResourceReducer<T>, {
    data: fallbackData,
    loading: false,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    dispatch({ type: "start" });

    load()
      .then((data) => {
        if (!cancelled) dispatch({ type: "success", data });
      })
      .catch((error: unknown) => {
        if (debugLabel) console.error(`${debugLabel} error`, error);
        if (!cancelled) dispatch({ type: "error", error, fallbackData });
      });

    return () => {
      cancelled = true;
    };
  }, [debugLabel, fallbackData, load]);

  return state;
}
