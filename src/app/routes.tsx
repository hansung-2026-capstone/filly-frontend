import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { HomePage } from "../pages/HomePage";
import { StatsPage } from "../pages/StatsPage";
import { RecommendPage } from "../pages/RecommendPage";
import { ArchivePage } from "../pages/ArchivePage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: "stats", Component: StatsPage },
      { path: "recommend", Component: RecommendPage },
      { path: "archive", Component: ArchivePage },
    ],
  },
]);
