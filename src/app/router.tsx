import BookmarkPage from "@/pages/bookmark";
import MainPage from "@/pages/main";
import SearchPage from "@/pages/search/ui/SearchPage";
import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <MainLayout />,
      children: [
        { index: true, element: <MainPage /> },
        { path: "search", element: <SearchPage /> },
        { path: "bookmark", element: <BookmarkPage /> },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  },
);
