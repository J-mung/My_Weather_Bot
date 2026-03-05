import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBaseUrl = env.API_BASE_URL || env.VITE_API_BASE_URL;
  const apiKey = env.API_KEY || env.VITE_API_KEY;

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
              "/api": {
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
