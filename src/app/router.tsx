import { MainLayout } from "./layouts/MainLayout";
import { PageFallback } from "./PageFallback";
import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";

const MainPage = lazy(() => import("@/pages/main"));
const SearchPage = lazy(() => import("@/pages/search/ui/SearchPage"));
const BookmarkPage = lazy(() => import("@/pages/bookmark"));
const MapPage = lazy(() => import("@/pages/map"));
const ErrorPage = lazy(() => import("@/pages/error"));


const withPageSuspense = (page: ReactNode) => (
  <Suspense fallback={<PageFallback />}>{page}</Suspense>
);

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <MainLayout />,
      errorElement: withPageSuspense(<ErrorPage />),
      children: [
        { index: true, element: withPageSuspense(<MainPage />) },
        { path: "search", element: withPageSuspense(<SearchPage />) },
        { path: "bookmark", element: withPageSuspense(<BookmarkPage />) },
        { path: "map", element: withPageSuspense(<MapPage />) },
        { path: "error", element: withPageSuspense(<ErrorPage />) },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  },
);
