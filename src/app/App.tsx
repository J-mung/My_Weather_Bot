import { router as defaultRouter } from "@/app/router";
import {
  WEATHER_QUERY_PERSIST_MAX_AGE_MS,
  WEATHER_QUERY_ROOT_KEY,
} from "@/entities/weather/model/weather-cache-policy";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { RouterProvider } from "react-router-dom";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      gcTime: WEATHER_QUERY_PERSIST_MAX_AGE_MS,
    },
  },
});

const localStorageAsync = {
  getItem: async (key: string) => {
    return window.localStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    window.localStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    window.localStorage.removeItem(key);
  },
};

const queryPersister = createAsyncStoragePersister({
  storage: localStorageAsync,
});

function App({ router = defaultRouter }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: WEATHER_QUERY_PERSIST_MAX_AGE_MS,
        dehydrateOptions: {
          // 저장할 쿼리 지정 - key가 weather로 시작하는 쿼리
          shouldDehydrateQuery: (query) => {
            return query.queryKey[0] === WEATHER_QUERY_ROOT_KEY && query.state.status === "success";
          },
        },
      }}
    >
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}

export default App;
