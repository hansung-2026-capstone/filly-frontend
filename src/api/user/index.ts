import { api } from "../instance";

export interface UserData {
  id: number;
  nickname: string;
  currentAvatarUrl: string | null;
  currentBgUrl: string | null;
  backgroundTheme: string | null;
  createdAt: string;
}

export const getMe = async (): Promise<UserMe> => {
  const { data } = await api.get<{ data: UserMe }>("/api/v1/users/me");
export interface UserResponse {
  success: boolean;
  data: UserData;
  message: string | null;
}
  return data.data;
};
