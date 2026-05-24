type KakaoLatLng = object;
type KakaoMap = object;

type KakaoMarker = {
  setMap: (map: KakaoMap | null) => void;
};

export type KakaoMapSdk = {
  load: (callback: () => void) => void;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Map: new (
    container: HTMLElement,
    options: {
      center: KakaoLatLng;
      level: number;
    },
  ) => KakaoMap;
  Marker: new (options: { position: KakaoLatLng }) => KakaoMarker;
};

declare global {
  interface Window {
    kakao?: {
      maps?: KakaoMapSdk;
    };
  }
}

let kakaoMapSdkPromise: Promise<KakaoMapSdk> | null = null;

const KAKAO_MAP_SDK_SCRIPT_ID = "kakao-map-sdk";

const resolveLoadedKakaoMaps = (resolve: (value: KakaoMapSdk) => void) => {
  const kakaoMaps = window.kakao?.maps;

  if (!kakaoMaps) {
    throw new Error("지도를 표시하기 위한 설정을 확인하지 못했어요.");
  }

  kakaoMaps.load(() => resolve(kakaoMaps));
};

export const loadKakaoMapSdk = (): Promise<KakaoMapSdk> => {
  const existingKakaoMaps = window.kakao?.maps;

  if (existingKakaoMaps) {
    return new Promise((resolve) => {
      existingKakaoMaps.load(() => resolve(existingKakaoMaps));
    });
  }

  if (kakaoMapSdkPromise) {
    return kakaoMapSdkPromise;
  }

  kakaoMapSdkPromise = new Promise<KakaoMapSdk>((resolve, reject) => {
    const script =
      (document.getElementById(KAKAO_MAP_SDK_SCRIPT_ID) as HTMLScriptElement | null) ??
      document.createElement("script");

    const rejectWithCleanup = (error: Error) => {
      kakaoMapSdkPromise = null;
      script.remove();
      reject(error);
    };

    script.id = KAKAO_MAP_SDK_SCRIPT_ID;
    script.setAttribute("data-kakao-map-sdk", "true");
    script.src = "/api/kakao-map-sdk.js";
    script.async = true;
    script.onerror = () => {
      rejectWithCleanup(new Error("지도를 불러오지 못했어요. 잠시 후 다시 시도해 주세요."));
    };
    script.onload = () => {
      try {
        resolveLoadedKakaoMaps(resolve);
      } catch (error: unknown) {
        rejectWithCleanup(
          error instanceof Error
            ? error
            : new Error("지도를 표시하기 위한 설정을 확인하지 못했어요."),
        );
      }
    };

    if (!script.parentElement) {
      document.head.appendChild(script);
    }
  });

  return kakaoMapSdkPromise;
};
