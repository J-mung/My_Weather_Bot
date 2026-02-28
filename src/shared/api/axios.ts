import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import axios from "axios";

/**
 * 공통 Axios 인스턴스
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 5000,
  });

  // 요청 인터셉터
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const serviceKey = import.meta.env.VITE_API_KEY;

    if (!serviceKey) {
      console.warn("Service Key가 준비되지 않았습니다.");
    }

    config.params = {
      ...config.params,
      serviceKey,
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
