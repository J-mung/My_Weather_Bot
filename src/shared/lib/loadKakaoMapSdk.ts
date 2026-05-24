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

const getKakaoMapJsKey = (): string =>
  (
    import.meta.env.VITE_KAKAO_MAP_JS_KEY ||
    import.meta.env.VITE_KAKAO_MAP_JAVASCRIPT_KEY ||
    ""
  ).trim();

const resolveLoadedKakaoMaps = (resolve: (value: KakaoMapSdk) => void) => {
  const kakaoMaps = window.kakao?.maps;

  if (!kakaoMaps) {
    throw new Error(
      "카카오 지도 SDK가 준비되지 않았습니다. JavaScript 키와 플랫폼 도메인 설정을 확인해 주세요.",
    );
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

  const appKey = getKakaoMapJsKey();

  if (!appKey) {
    return Promise.reject(
      new Error(
        "카카오 지도 JavaScript 키가 없습니다. VITE_KAKAO_MAP_JS_KEY 설정 후 개발 서버를 다시 시작해 주세요.",
      ),
    );
  }

  kakaoMapSdkPromise = new Promise((resolve, reject) => {
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
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
      appKey,
    )}&autoload=false`;
    script.async = true;
    script.onerror = () => {
      rejectWithCleanup(
        new Error(
          "카카오 지도 SDK를 불러오지 못했습니다. JavaScript 키와 카카오 플랫폼 도메인 설정을 확인해 주세요.",
        ),
      );
    };
    script.onload = () => {
      try {
        resolveLoadedKakaoMaps(resolve);
      } catch (error: unknown) {
        rejectWithCleanup(error instanceof Error ? error : new Error("카카오 지도 SDK 오류"));
      }
    };

    if (!script.parentElement) {
      document.head.appendChild(script);
    }
  });

  return kakaoMapSdkPromise;
};
