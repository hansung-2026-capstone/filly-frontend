export type RecommendationCard = {
  cardId: number;
  position: number;
  revealed: boolean;
};

export type RecommendationDraw = {
  drawId: number;
  round: number;
  cards: RecommendationCard[];
};

export type RecommendationContentType =
  | "MOVIE"
  | "BOOK"
  | "MUSIC"
  | "FOOD"
  | "PLACE"
  | "ADVICE";

export type RecommendationDetail = {
  drawId: number;
  cardId: number;
  category: string;
  subCategory: string;
  contentType: RecommendationContentType;
  title: string;
  description: string;
  searchKeyword: string;
  reason: string;
};
