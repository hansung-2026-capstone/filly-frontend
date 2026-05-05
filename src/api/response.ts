export interface ApiData<T> {
  data: T;
}

export interface ApiListData<T> {
  data?: T[] | null;
}

export function unwrapData<T>(response: ApiData<T>) {
  return response.data;
}

export function unwrapListData<T>(response: ApiListData<T>) {
  return response.data ?? [];
}
