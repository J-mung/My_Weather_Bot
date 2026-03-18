/**
 * worker 환경 변수 타입
 */
export interface Env {
  API_BASE_URL: string;
  API_KEY: string;
  KAKAO_REST_API_KEY: string;
  KAKAO_REST_API_BASE_URL: string;
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}
