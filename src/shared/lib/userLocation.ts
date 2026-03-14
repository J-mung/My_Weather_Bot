import type { LatLon } from "@/entities/weather/model/weather.types";

const getGeolocationErrorMessage = (error: GeolocationPositionError): string => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "위치 권한이 거부되었습니다.";
    case error.POSITION_UNAVAILABLE:
      return "현재 위치를 확인할 수 없습니다.";
    case error.TIMEOUT:
      return "위치 확인 시간이 초과되었습니다.";
    default:
      return error.message || "알 수 없는 위치 오류가 발생했습니다.";
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
      reject(new Error("Geolocation을 지원하지 않습니다."));
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
            reject(new Error(getGeolocationErrorMessage(geolocationFallbackError)));
            return;
          }
        }

        reject(new Error(getGeolocationErrorMessage(error)));
      });
  });
};
