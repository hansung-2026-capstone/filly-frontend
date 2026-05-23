import axios from "axios";
import { API_BASE_URL } from "../config";

const AUTH_REFRESH_PATH = "/api/v1/auth/refresh";
const LOGOUT_PATH = "/logout";

type RefreshTokenResponse = {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
  };
  message: string | null;
};

export const refreshAccessToken = async () => {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (!accessToken || !refreshToken) {
    throw new Error("토큰 정보가 없습니다.");
  }

  const { data } = await axios.post<RefreshTokenResponse>(
    `${API_BASE_URL}${AUTH_REFRESH_PATH}`,
    { refreshToken },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  localStorage.setItem("accessToken", data.data.accessToken);
  localStorage.setItem("refreshToken", data.data.refreshToken);

  return data.data;
};

export const logout = async () => {
  await axios.post(`${API_BASE_URL}${LOGOUT_PATH}`, null, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });
};
