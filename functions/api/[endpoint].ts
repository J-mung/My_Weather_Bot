/**
 * Cloudflare Pages 배포 시 발생하는 Cross Origin 문제 해결을 위한 프록시 설정
 *
 *  - 프론트에서 기상청 API를 직접 호출하면 브라우저 CORS 이슈 발생
 *  - 추가로 serviceKey가 URL에 노출됨
 *  - Pages Functions를 프록시로 둬서 얻는 이점
 *    1) serviceKey는 서버 환경변수로만 관리
 *    2) 프론트는 same-origin(/api/...)만 호출
 *    3) CORS 응답 헤더를 서버에서 일관되게 제어 가능
 *
 *  by chatgpt
 */

interface Env {
  API_BASE_URL: string;
  API_KEY: string;
}

/**
 * 허용 endpoint 목록
 */
const ALLOWED_ENDPOINTS = new Set(["getUltraSrtNcst", "getVilageFcst"]);

/**
 * CORS 헤더 생성
 *  - 브라우저가 cross-origin 요청을 허용하도록 응답 헤더 부여
 * @param origin
 * @returns
 */
const createCorsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  Vary: "Origin",
});

/**
 * Preflight(OPTIONS) 요청 처리
 *  - 실제 GET 전에 브라우저가 허용 여부를 확인할 때 사용
 * @param param0
 * @returns
 */
export const onRequestOptions: PagesFunction<Env> = async ({ request }) => {
  const origin = request.headers.get("Origin") ?? "";
  return new Response(null, { status: 204, headers: createCorsHeaders(origin) });
};

/**
 * GET 요청 처리
 *  - /api/:endpoint 형태 요청을 받아
 *  - 기상청 API로 프록시 호출 후 응답을 그대로 반환
 * @param param0
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, params, env }) => {
  const origin = request.headers.get("Origin") ?? "";
  const endpoint = String(params.endpoint ?? "");

  // 허용되지 않은 endpoint 요청 차단
  if (!ALLOWED_ENDPOINTS.has(endpoint)) {
    return new Response("Invalid endpoint", {
      status: 400,
      headers: createCorsHeaders(origin),
    });
  }

  // 서버 환경변수 미설정 방어
  if (!env.API_KEY) {
    return new Response("Missing API_KEY", {
      status: 500,
      headers: createCorsHeaders(origin),
    });
  }

  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(`${env.API_BASE_URL}/${endpoint}`);

  // 프론트가 보낸 쿼리스트링을 upstream에 전달
  incomingUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.set(key, value);
  });

  // serviceKey는 서버에서만 주입 (프론트 비노출)
  upstreamUrl.searchParams.set("serviceKey", env.API_KEY);

  // dataType 누락 시 JSON 기본값 보정
  if (!upstreamUrl.searchParams.has("dataType")) {
    upstreamUrl.searchParams.set("dataType", "JSON");
  }

  // 기상청 API 노출
  const upstreamRes = await fetch(upstreamUrl.toString(), { method: "GET" });
  const body = await upstreamRes.text();

  // 원본 상태코드 유지 + CORS 헤더 포함해서 프론트로 반환
  return new Response(body, {
    status: upstreamRes.status,
    headers: {
      ...createCorsHeaders(origin),
      "Content-Type": upstreamRes.headers.get("Content-Type") ?? "application/json; charset=utf-8",
    },
  });
};
