/**
 * Worker 파일이 필요한 이유
 * - 프론트에서 기상청 API를 직접 호출하면 CORS 및 키 노출 이슈가 생김
 * - Worker가 /api/* 요청을 받아 서버에서 API_KEY를 주입한 뒤 기상청으로 프록시 호출
 * - 같은 Worker에서 정적 dist 자산도 함께 서빙해 단일 배포 경로로 운영 가능
 */

import { handleAirQualityApiRequest } from "./worker/air-quality";
import { handleClientConfigRequest } from "./worker/client-config";
import { serveAsset } from "./worker/assets";
import {
  AIR_QUALITY_API_PREFIX,
  CLIENT_CONFIG_API_PATH,
  KAKAO_API_PREFIX,
  KAKAO_MAP_SDK_API_PATH,
  RISE_SET_API_PREFIX,
  WEATHER_API_PREFIX,
} from "./worker/constants";
import { handleKakaoApiRequest } from "./worker/kakao";
import { handleKakaoMapSdkRequest } from "./worker/kakao-map-sdk";
import { withWorkerObservability } from "./worker/observability";
import { handleRadarApiRequest, isRadarApiRequest } from "./worker/radar";
import { handleRiseSetApiRequest } from "./worker/rise-set";
import type { Env, WorkerExecutionContext } from "./worker/types";
import { handleApiRequest } from "./worker/weather";

export default {
  /**
   * Worker 진입점
   * - /api/* 는 API 프록시 핸들러로 전달
   * - 그 외 경로는 정적 자산 응답
   */
  async fetch(request: Request, env: Env, context: WorkerExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === CLIENT_CONFIG_API_PATH) {
      return withWorkerObservability(request, "client-config", () =>
        handleClientConfigRequest(request, env),
      );
    }

    if (url.pathname === KAKAO_MAP_SDK_API_PATH) {
      return withWorkerObservability(request, "kakao-map-sdk", () =>
        handleKakaoMapSdkRequest(request, env),
      );
    }

    if (url.pathname.startsWith(KAKAO_API_PREFIX)) {
      return withWorkerObservability(request, "kakao", () => handleKakaoApiRequest(request, env));
    }

    if (url.pathname.startsWith(AIR_QUALITY_API_PREFIX)) {
      return withWorkerObservability(request, "air-quality", () =>
        handleAirQualityApiRequest(request, env, context),
      );
    }

    if (isRadarApiRequest(url.pathname, env)) {
      return withWorkerObservability(request, "radar", () =>
        handleRadarApiRequest(request, env, context),
      );
    }

    if (url.pathname.startsWith(RISE_SET_API_PREFIX)) {
      return withWorkerObservability(request, "rise-set", () =>
        handleRiseSetApiRequest(request, env, context),
      );
    }

    if (url.pathname.startsWith(WEATHER_API_PREFIX)) {
      return withWorkerObservability(request, "weather", () =>
        handleApiRequest(request, env, context),
      );
    }

    return withWorkerObservability(request, "asset", () => serveAsset(request, env));
  },
};
