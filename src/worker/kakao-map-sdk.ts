import { KAKAO_MAP_SDK_API_PATH } from "./constants";
import { withCors } from "./cors";
import type { Env } from "./types";

const KAKAO_MAP_SDK_URL = "https://dapi.kakao.com/v2/maps/sdk.js";

const resolveKakaoMapKey = (env: Env): string => (env.KAKAO_MAP_KEY || "").trim();

export const handleKakaoMapSdkRequest = async (request: Request, env: Env): Promise<Response> => {
  const origin = request.headers.get("Origin") ?? "";
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, withCors(origin, { status: 204 }));
  }

  if (request.method !== "GET") {
    return new Response("Method Not Allowed", withCors(origin, { status: 405 }));
  }

  if (url.pathname !== KAKAO_MAP_SDK_API_PATH) {
    return new Response("Invalid endpoint", withCors(origin, { status: 404 }));
  }

  const appKey = resolveKakaoMapKey(env);

  if (!appKey) {
    return new Response("Map configuration unavailable", withCors(origin, { status: 500 }));
  }

  const upstreamUrl = new URL(KAKAO_MAP_SDK_URL);
  upstreamUrl.searchParams.set("appkey", appKey);
  upstreamUrl.searchParams.set("autoload", "false");

  const upstreamResponse = await fetch(upstreamUrl.toString(), {
    method: "GET",
  });
  const body = await upstreamResponse.text();

  return new Response(
    body,
    withCors(origin, {
      status: upstreamResponse.status,
      headers: {
        "Content-Type":
          upstreamResponse.headers.get("Content-Type") ?? "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    }),
  );
};
