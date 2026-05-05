import { api } from "../instance";
import { unwrapData } from "../response";

export interface UserData {
  id: number;
  nickname: string;
  currentAvatarUrl: string | null;
  currentBgUrl: string | null;
  backgroundTheme: string | null;
  createdAt: string;
}

interface UserResponse {
  success: boolean;
  data: UserData;
  message: string | null;
}

export const getMe = async (): Promise<UserData> => {
  const { data } = await api.get<UserResponse>("/api/v1/users/me");
  return unwrapData(data);
};

export const updateNickname = async (nickname: string): Promise<void> => {
  await api.patch("/api/v1/users/me/nickname", { nickname });
};
