import { api } from "../instance";

export const logout = async () => {
  await api.post("/logout");
};
