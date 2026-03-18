import { WEATHER_ALLOWED_ENDPOINTS, WEATHER_API_PREFIX } from "./config";
import { withCors } from "./cors";
import type { Env } from "./types";

/**
 * 클라이언트 요청 쿼리를 upstream으로 전달하고,
 * API_KEY/serviceKey를 서버에서만 주입한 기상청 호출 URL 생성
 */
const buildUpstreamUrl = (request: Request, env: Env, endpoint: string): URL => {
  const incomingUrl = new URL(request.url);
  const normalizedBase = env.API_BASE_URL.replace(/\/+$/, "");
  const upstreamUrl = new URL(`${normalizedBase}/${endpoint}`);

  incomingUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.set(key, value);
  });

  upstreamUrl.searchParams.set("serviceKey", env.API_KEY);

  if (!upstreamUrl.searchParams.has("dataType")) {
    upstreamUrl.searchParams.set("dataType", "JSON");
  }

  return upstreamUrl;
};

/**
 * /api/* 요청 처리
 *    - OPTIONS: preflight 처리
 *    - GET: 허용 endpoint 검증 후 기상청 API 프록시 호출
 */
export const handleApiRequest = async (request: Request, env: Env): Promise<Response> => {
  const origin = request.headers.get("Origin") ?? "";
  const url = new URL(request.url);
  const endpoint = url.pathname.slice(WEATHER_API_PREFIX.length);

  if (request.method === "OPTIONS") {
    return new Response(null, withCors(origin, { status: 204 }));
  }

  if (request.method !== "GET") {
    return new Response("Method Not Allowed", withCors(origin, { status: 405 }));
  }

  if (!WEATHER_ALLOWED_ENDPOINTS.has(endpoint)) {
    return new Response("Invalid endpoint", withCors(origin, { status: 400 }));
  }

  if (!env.API_BASE_URL || !env.API_KEY) {
    const missing = [!env.API_BASE_URL ? "API_BASE_URL" : null, !env.API_KEY ? "API_KEY" : null]
      .filter(Boolean)
      .join(", ");
    return new Response(`Missing API env: ${missing}`, { status: 500 });
  }

  const upstreamUrl = buildUpstreamUrl(request, env, endpoint);
  const upstreamRes = await fetch(upstreamUrl.toString(), { method: "GET" });
  const body = await upstreamRes.text();

  return new Response(
    body,
    withCors(origin, {
      status: upstreamRes.status,
      headers: {
        // upstream content-type 우선, 없으면 JSON 기본값
        "Content-Type":
          upstreamRes.headers.get("Content-Type") ?? "application/json; charset=utf-8",
        // API 응답은 캐시 미사용(디버깅/신선도 확보)
        "Cache-Control": "no-store",
      },
    }),
  );
};
