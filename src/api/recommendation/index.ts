import type {
  RecommendationDetail,
  RecommendationDraw,
} from "../../types/recommendation";
import { api } from "../instance";

export const startRecommendationDraw = async () => {
  const { data } = await api.post<{ data: RecommendationDraw }>(
    "/api/v1/recommendations/draws",
  );
  return data.data;
};

export const revealRecommendationCard = async (
  drawId: number,
  cardId: number,
) => {
  const { data } = await api.post<{ data: RecommendationDetail }>(
    `/api/v1/recommendations/draws/${drawId}/cards/${cardId}/reveal`,
  );
  return data.data;
};

export const shuffleRecommendationDraw = async (drawId: number) => {
  const { data } = await api.post<{ data: RecommendationDraw }>(
    `/api/v1/recommendations/draws/${drawId}/shuffle`,
  );
  return data.data;
};

export const getRecommendationHistory = async () => {
  const { data } = await api.get<{ data: RecommendationDetail[] }>(
    "/api/v1/recommendations/history",
  );
  return data.data;
};
