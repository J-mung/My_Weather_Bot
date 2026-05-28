import { CLIENT_CONFIG_API_PATH } from "./constants";
import { withCors } from "./cors";
import type { Env } from "./types";

const normalizeProxyPath = (path: string): string => {
  const trimmedPath = path.trim();
  const withLeadingSlash = trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}`;
  return withLeadingSlash.replace(/\/+$/, "");
};

const resolveRadarApiProxyPath = (env: Env): string | null => {
  const proxyPath = (env.RADAR_API_PROXY_PATH || "").trim();
  return proxyPath ? normalizeProxyPath(proxyPath) : null;
};

export const handleClientConfigRequest = async (request: Request, env: Env): Promise<Response> => {
  const origin = request.headers.get("Origin") ?? "";
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, withCors(origin, { status: 204 }));
  }

  if (request.method !== "GET") {
    return new Response("Method Not Allowed", withCors(origin, { status: 405 }));
  }

  if (url.pathname !== CLIENT_CONFIG_API_PATH) {
    return new Response("Not Found", withCors(origin, { status: 404 }));
  }

  const radarApiProxyPath = resolveRadarApiProxyPath(env);

  if (!radarApiProxyPath) {
    return new Response("Client configuration unavailable", withCors(origin, { status: 503 }));
  }

  return new Response(JSON.stringify({ radarApiProxyPath }),
    withCors(origin, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    }),
  );
};
