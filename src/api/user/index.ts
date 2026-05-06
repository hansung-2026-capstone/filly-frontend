import type { User } from "../../types/user";
import { api } from "../instance";

export const getMe = async (): Promise<User> => {
  const { data } = await api.get<{ data: User }>("/api/v1/users/me");
  return data.data;
};

export const updateNickname = async (nickname: string): Promise<void> => {
  await api.patch("/api/v1/users/me/nickname", { nickname });
};
