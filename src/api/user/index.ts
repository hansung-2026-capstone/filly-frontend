import { api } from "../instance";

export interface UserMe {
  nickname: string;
  profileImageUrl?: string;
}

export const getMe = async (): Promise<UserMe> => {
  const { data } = await api.get<{ data: UserMe }>("/api/v1/users/me");
  return data.data;
};
