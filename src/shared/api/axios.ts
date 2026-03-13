import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import axios from "axios";

const API_BASE_URL = {
  weather: "/api",
  kakao: "/api/kakao",
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
        console.error("API Error: ", error.response?.status, error.response.data);
      } else if (error.request) {
        console.error("Network Error: ", error.message);
      } else {
        console.error("Unexcepted Error: ", error.message);
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

const apiClients: Record<ApiClientName, AxiosInstance> = {
  weather: createAxiosInstance(API_BASE_URL.weather),
  kakao: createAxiosInstance(API_BASE_URL.kakao),
};

export const getApiClient = (name: ApiClientName): AxiosInstance => {
  return apiClients[name];
};
