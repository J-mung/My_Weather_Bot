/**
 * 브라우저 CORS 처리를 위한 공통 응답 헤더 생성
 */
export const createCorsHeaders = (origin: string): Record<string, string> => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  Vary: "Origin",
});

/**
 * 기존 ResponseInit에 CORS 헤더를 병합
 */
export const withCors = (origin: string, init?: ResponseInit): ResponseInit => {
  const headers = new Headers(init?.headers);
  const corsHeaders = createCorsHeaders(origin);
  Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value));
  return { ...init, headers };
};
