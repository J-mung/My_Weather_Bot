import type { LatLon } from "../entities/weather/model/weatherTypes";

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

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      // 타임아웃, 위치를 가져올 수 없음 등
      (error) => {
        reject(new Error(error.message));
      },
      {
        enableHighAccuracy: true, // GPS 정보 우선 적용, false일 때는 IP 혹은 Wifi
        timeout: 5000,
        maximumAge: 60000, // 1분간 캐시 이용
        ...options, // 필요시 옵션 덮어쓰기
      },
    );
  });
};
