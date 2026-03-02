import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import axios from "axios";

/**
 * 공통 Axios 인스턴스
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: "/api",
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

export const axiosInstance: AxiosInstance = createAxiosInstance();
