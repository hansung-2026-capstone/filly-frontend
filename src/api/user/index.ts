import { api } from "../instance";

export interface UserData {
  id: number;
  nickname: string;
  currentAvatarUrl: string | null;
  currentBgUrl: string | null;
  backgroundTheme: string | null;
  createdAt: string;
}

export interface UserResponse {
  success: boolean;
  data: UserData;
  message: string | null;
}

export const getMe = async (): Promise<UserData> => {
  const { data } = await api.get<UserResponse>("/api/v1/users/me");
  return data.data;
};

export const updateNickname = async (nickname: string): Promise<UserData> => {
  const body = { nickname };
  const { data } = await api.patch<UserResponse>("/api/v1/users/me", body);
  return data.data;
};
