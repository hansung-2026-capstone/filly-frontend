import { api } from "../instance";

export const logout = async () => {
  const accessToken = localStorage.getItem("accessToken");

  await api.post(
    "/logout",
    undefined,
    accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
  );
};
