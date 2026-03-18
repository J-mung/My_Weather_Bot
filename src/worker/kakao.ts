import { KAKAO_ENDPOINT_KEY_BY_PATH } from "./constants";
import { withCors } from "./cors";
import type { Env, KakaoEndpointKey } from "./types";

/**
 * 카카오 api 요청 endpoint인지 확인
 * @param pathName
 * @returns
 */
const isKakaoEndpointPath = (
  pathName: string,
): pathName is keyof typeof KAKAO_ENDPOINT_KEY_BY_PATH => {
  return pathName in KAKAO_ENDPOINT_KEY_BY_PATH;
};

/**
 * 카카오 api 원문을 생성할 때 필요한 key 반환
 * @param pathName
 * @returns
 */
const getKakaoEndpointKey = (pathName: string): KakaoEndpointKey | null => {
  if (!isKakaoEndpointPath(pathName)) {
    return null;
  }

  return KAKAO_ENDPOINT_KEY_BY_PATH[pathName];
};

/**
 * 위/경도로 지역명 조회
 * @param request
 * @param env
 * @returns
 */
export const buildKakaoCoord2RegionUrl = (request: Request, env: Env): URL => {
  const incomingUrl = new URL(request.url);
  const baseUrl = env.KAKAO_REST_API_BASE_URL || "https://dapi.kakao.com";
  const upstreamUrl = new URL("/v2/local/geo/coord2regioncode.json", baseUrl);

  const x = incomingUrl.searchParams.get("x");
  const y = incomingUrl.searchParams.get("y");

  if (!x || !y) {
    throw new Error("Missing x or y query parameter.");
  }

  upstreamUrl.searchParams.set("x", x);
  upstreamUrl.searchParams.set("y", y);

  upstreamUrl.searchParams.set(
    "input_coord",
    incomingUrl.searchParams.get("input_coord") ?? "WGS84",
  );

  return upstreamUrl;
};

/**
 * 주소로 위/경도 조회
 * @param request
 * @param env
 * @returns
 */
export const buildKakaoAddressSearchUrl = (request: Request, env: Env): URL => {
  const incomingUrl = new URL(request.url);
  const baseUrl = env.KAKAO_REST_API_BASE_URL || "https://dapi.kakao.com";
  const upstreamUrl = new URL("/v2/local/search/address.json", baseUrl);

  const query = incomingUrl.searchParams.get("query");
  if (!query) {
    throw new Error("Missing query parameter.");
  }

  upstreamUrl.searchParams.set("query", query);
  return upstreamUrl;
};

/**
 * URL 생성기 선택
 * @param endpointKey
 * @param request
 * @param env
 * @returns
 */
const buildKakaoUpstreamUrl = (endpointKey: KakaoEndpointKey, request: Request, env: Env): URL => {
  switch (endpointKey) {
    case "coord2regioncode":
      return buildKakaoCoord2RegionUrl(request, env);
    case "searchAddress":
      return buildKakaoAddressSearchUrl(request, env);
  }
};

/**
 * /api/kakao/* 요청 처리
 *    - OPTIONS: preflight 처리
 *    - GET: 허용 endpoint 검증 후 Kakao API 프록시 호출
 * @param request
 * @param env
 * @returns
 */
export const handleKakaoApiRequest = async (request: Request, env: Env): Promise<Response> => {
  const origin = request.headers.get("Origin") ?? "";
  const url = new URL(request.url);
  const endpointKey = getKakaoEndpointKey(url.pathname);

  if (request.method === "OPTIONS") {
    return new Response(null, withCors(origin, { status: 204 }));
  }

  if (request.method !== "GET") {
    return new Response("Method Not Allowed", withCors(origin, { status: 405 }));
  }

  if (!endpointKey) {
    return new Response("Invalid endpoint", withCors(origin, { status: 400 }));
  }

  if (!env.KAKAO_REST_API_BASE_URL || !env.KAKAO_REST_API_KEY) {
    const missing = [
      !env.KAKAO_REST_API_BASE_URL ? "KAKAO_REST_API_BASE_URL" : null,
      !env.KAKAO_REST_API_KEY ? "KAKAO_REST_API_KEY" : null,
    ]
      .filter(Boolean)
      .join(", ");
    return new Response(`Missing API env: ${missing}`, withCors(origin, { status: 500 }));
  }

  let upstreamUrl: URL;
  try {
    upstreamUrl = buildKakaoUpstreamUrl(endpointKey, request, env);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return new Response(message, withCors(origin, { status: 400 }));
  }

  const upstreamRes = await fetch(upstreamUrl.toString(), {
    method: "GET",
    headers: {
      Authorization: `KakaoAK ${env.KAKAO_REST_API_KEY}`,
    },
  });

  const body = await upstreamRes.text();

  return new Response(
    body,
    withCors(origin, {
      status: upstreamRes.status,
      headers: {
        "Content-Type":
          upstreamRes.headers.get("Content-Type") ?? "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    }),
  );
};
