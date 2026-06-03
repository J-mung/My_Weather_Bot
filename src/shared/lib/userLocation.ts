import type { LatLon } from "@/entities/weather/model/weather.types";
import { APP_ERROR, type AppErrorType } from "@/shared/api/app-errors";
import { AppError } from "@/shared/api/types";

const getGeolocationAppErrorType = (error: GeolocationPositionError): AppErrorType => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return APP_ERROR.LOCATION_PERMISSION;
    case error.POSITION_UNAVAILABLE:
      return APP_ERROR.LOCATION_UNAVAILABLE;
    case error.TIMEOUT:
      return APP_ERROR.LOCATION_TIMEOUT;
    default:
      return APP_ERROR.LOCATION_LOOKUP_UNEXPECTED;
  }
};

const requestCurrentPosition = (options: PositionOptions): Promise<LatLon> => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      options,
    );
  });
};

/**
 * 브라우저에서 현재 위치(위도/경도)를 얻는 유틸리티.
 *    - 웹과 모바일 지원
 * @param options
 * @returns
 */
export const getUserLocation = (options?: PositionOptions): Promise<LatLon> => {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new AppError(APP_ERROR.LOCATION_UNAVAILABLE));
      return;
    }

    const initialOptions: PositionOptions = {
      enableHighAccuracy: true, // GPS 정보 우선 적용, false일 때는 IP 혹은 Wifi
      timeout: 5000,
      maximumAge: 60000, // 1분간 캐시 이용
      ...options, // 필요시 옵션 덮어쓰기
    };

    void requestCurrentPosition(initialOptions)
      .then(resolve)
      .catch(async (error: GeolocationPositionError) => {
        // 고정밀 위치가 불안정한 환경(시뮬레이터/브라우저)에서는 일반 정확도로 한 번 더 시도
        if (error.code === error.POSITION_UNAVAILABLE && initialOptions.enableHighAccuracy) {
          try {
            const fallbackLocation = await requestCurrentPosition({
              ...initialOptions,
              enableHighAccuracy: false,
            });
            resolve(fallbackLocation);
            return;
          } catch (fallbackError) {
            const geolocationFallbackError = fallbackError as GeolocationPositionError;
            reject(new AppError(getGeolocationAppErrorType(geolocationFallbackError), fallbackError));
            return;
          }
        }

        reject(new AppError(getGeolocationAppErrorType(error), error));
      });
  });
};
