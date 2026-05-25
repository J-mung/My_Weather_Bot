/**
 * worker 환경 변수 타입
 */
export interface Env {
  API_BASE_URL: string;
  API_KEY: string;
  AIRKOREA_API_BASE_URL: string;
  AIRKOREA_BASE_URL?: string;
  AIRKOREA_API_KEY?: string;
  KAKAO_REST_API_KEY: string;
  KAKAO_REST_API_BASE_URL: string;
  KAKAO_MAP_KEY?: string;
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

export type KakaoEndpointKey = "coord2regioncode" | "searchAddress" | "searchKeyword";

export interface WorkerExecutionContext {
  waitUntil: (promise: Promise<unknown>) => void;
}
