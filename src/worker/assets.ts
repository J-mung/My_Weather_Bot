import type { Env } from "./types";

/**
 * 정적 자산 서빙
 * - 요청 파일이 없으면(SPA 라우팅) index.html fallback 반환
 */
export const serveAsset = async (request: Request, env: Env): Promise<Response> => {
  const assetResponse = await env.ASSETS.fetch(request);

  if (assetResponse.status !== 404) {
    return assetResponse;
  }

  const acceptsHtml = request.headers.get("Accept")?.includes("text/html");
  if (request.method === "GET" && acceptsHtml) {
    const indexUrl = new URL("/index.html", request.url);
    return env.ASSETS.fetch(new Request(indexUrl.toString(), request));
  }

  return assetResponse;
};
