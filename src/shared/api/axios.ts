import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { API_ERROR, type ApiError } from "./types";

const API_BASE_URL = {
  weather: "/api",
  kakao: "/api/kakao",
  airQuality: "/api/air-quality",
  riseSet: "/api/rise-set",
  clientConfig: "/api/client-config",
} as const;

export type ApiClientName = keyof typeof API_BASE_URL;

/**
 * 공통 Axios 인스턴스
 */
const createAxiosInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 5000,
  });

  // 요청 인터셉터
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    config.params = {
      ...config.params,
    };

    return config;
  });

  // 응답 인터셉터
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response) {
        return Promise.reject<ApiError>({
          type: API_ERROR.HTTP,
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          message: error.message,
          cause: error,
        });
      }
      if (error.request) {
        return Promise.reject<ApiError>({
          type: API_ERROR.NETWORK,
          message: "서버 응답을 받지 못했습니다.",
          cause: error,
        });
      }
      return Promise.reject<ApiError>({
        type: API_ERROR.UNEXPECTED,
        message: error.message || "알 수 없는 오류가 발생했습니다.",
        cause: error,
      });
    },
  );

  return instance;
};

const apiClients: Record<ApiClientName, AxiosInstance> = {
  weather: createAxiosInstance(API_BASE_URL.weather),
  kakao: createAxiosInstance(API_BASE_URL.kakao),
  airQuality: createAxiosInstance(API_BASE_URL.airQuality),
  riseSet: createAxiosInstance(API_BASE_URL.riseSet),
  clientConfig: createAxiosInstance(API_BASE_URL.clientConfig),
};

/**
 * axios 객체 반환 (weather / kakao / airQuality 택 1)
 * @param name
 * @returns
 */
export const getApiClient = (name: ApiClientName): AxiosInstance => {
  return apiClients[name];
};
