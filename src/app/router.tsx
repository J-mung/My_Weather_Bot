import BookmarkPage from "@/pages/bookmark";
import ErrorPage from "@/pages/error";
import MainPage from "@/pages/main";
import MapPage from "@/pages/map";
import SearchPage from "@/pages/search/ui/SearchPage";
import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <MainLayout />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <MainPage /> },
        { path: "search", element: <SearchPage /> },
        { path: "bookmark", element: <BookmarkPage /> },
        { path: "map", element: <MapPage /> },
        { path: "error", element: <ErrorPage /> },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  },
);
