import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBaseUrl = env.API_BASE_URL || env.VITE_API_BASE_URL;
  const apiKey = env.API_KEY || env.VITE_API_KEY;
  const kakaoApiKey = env.KAKAO_REST_API_KEY || env.VITE_KAKAO_REST_API_KEY;
  const kakaoApiBaseUrl = env.KAKAO_LOCAL_API_BASE_URL || env.VITE_KAKAO_REST_API_BASE_URL;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    server:
      apiBaseUrl && apiKey
        ? {
            proxy: {
              ...(kakaoApiKey
                ? {
                    // 카카오 api 요청 proxy
                    "/api/kakao": {
                      target: kakaoApiBaseUrl,
                      changeOrigin: true,
                      rewrite: (path) => {
                        const url = new URL(path, "http://localhost");
                        const x = url.searchParams.get("x");
                        const y = url.searchParams.get("y");

                        if (!x || !y) {
                          return "/v2/local/geo/coord2regioncode.json";
                        }

                        const upstreamUrl = new URL(
                          "/v2/local/geo/coord2regioncode.json",
                          "http://localhost",
                        );
                        upstreamUrl.searchParams.set("x", x);
                        upstreamUrl.searchParams.set("y", y);
                        upstreamUrl.searchParams.set(
                          "input_coord",
                          url.searchParams.get("input_coord") ?? "WGS84",
                        );

                        const query = upstreamUrl.searchParams.toString();
                        return query ? `${upstreamUrl.pathname}?${query}` : upstreamUrl.pathname;
                      },
                      headers: {
                        Authorization: `KakaoAK ${kakaoApiKey}`,
                      },
                    },
                  }
                : {}),
              // 기상청 api 요청 proxy
              "^/api/(?!kakao)": {
                target: apiBaseUrl,
                changeOrigin: true,
                rewrite: (path) => {
                  const url = new URL(path, "http://localhost");
                  const upstreamPath = url.pathname.replace(/^\/api/, "");

                  if (!url.searchParams.has("serviceKey")) {
                    url.searchParams.set("serviceKey", apiKey);
                  }
                  if (!url.searchParams.has("dataType")) {
                    url.searchParams.set("dataType", "JSON");
                  }

                  const query = url.searchParams.toString();
                  return query ? `${upstreamPath}?${query}` : upstreamPath;
                },
              },
            },
          }
        : undefined,
  };
});
