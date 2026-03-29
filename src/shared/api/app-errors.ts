import type { AppErrorMeta } from "./types";

export const APP_ERROR = {
  LOCATION_PERMISSION: "LOCATION_PERMISSION",
  WEATHER_PARAMETER: "WEATHER_PARAMETER",
  ULTRA_FORECAST: "ULTRA_FORECAST",
  ULTRA_FORECAST_NOT_FOUND: "ULTRA_FORECAST_NOT_FOUND",
  ULTRA_FORECAST_RETRY_LATER: "ULTRA_FORECAST_RETRY_LATER",
  ULTRA_FORECAST_UNEXPECTED: "ULTRA_FORECAST_UNEXPECTED",
  ULTRA_NOW: "ULTRA_NOW",
  ULTRA_NOW_NOT_FOUND: "ULTRA_NOW_NOT_FOUND",
  ULTRA_NOW_RETRY_LATER: "ULTRA_NOW_RETRY_LATER",
  ULTRA_NOW_UNEXPECTED: "ULTRA_NOW_UNEXPECTED",
  SHORT_FORECAST: "SHORT_FORECAST",
  SHORT_FORECAST_NOT_FOUND: "SHORT_FORECAST_NOT_FOUND",
  SHORT_FORECAST_RETRY_LATER: "SHORT_FORECAST_RETRY_LATER",
  SHORT_FORECAST_UNEXPECTED: "SHORT_FORECAST_UNEXPECTED",
  LOCATION_LOOKUP: "LOCATION_LOOKUP",
  LOCATION_LOOKUP_NOT_FOUND: "LOCATION_LOOKUP_NOT_FOUND",
  LOCATION_LOOKUP_RETRY_LATER: "LOCATION_LOOKUP_RETRY_LATER",
  LOCATION_LOOKUP_UNEXPECTED: "LOCATION_LOOKUP_UNEXPECTED",
  LATLON_LOOKUP: "LATLON_LOOKUP",
  LATLON_LOOKUP_NOT_FOUND: "LATLON_LOOKUP_NOT_FOUND",
  LATLON_LOOKUP_RETRY_LATER: "LATLON_LOOKUP_RETRY_LATER",
  LATLON_LOOKUP_UNEXPECTED: "LATLON_LOOKUP_UNEXPECTED",
  WEATHER_FETCH: "WEATHER_FETCH",
  BOOKMARK_ACTION: "BOOKMARK_ACTION",
} as const;

export const appErrorMetaMap = {
  [APP_ERROR.LOCATION_PERMISSION]: {
    title: "위치 정보 권한이 필요해요",
    description: "현재 위치 기반 서비스를 이용하려면 브라우저에서 위치 정보 권한을 허용해 주세요.",
    actionLabel: "현재 위치 다시 확인",
  },
  [APP_ERROR.WEATHER_PARAMETER]: {
    title: "위치 정보가 없어요.",
    description:
      "위치 정보가 없어서 날씨 정보를 불러오는 중 문제가 발생했습니다. 관리자에게 문의하세요.",
    actionLabel: "관리자 문의",
  },
  [APP_ERROR.ULTRA_FORECAST]: {
    title: "날씨 정보를 찾지 못했어요.",
    description: "날씨 정보를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    actionLabel: "다시 시도",
  },
  [APP_ERROR.ULTRA_FORECAST_NOT_FOUND]: {
    title: "날씨 정보를 찾지 못했어요.",
    description: `날씨 정보를 불러오는 중 문제가 발생했습니다.\n잠시 후 다시 시도해 주세요.`,
    actionLabel: "다시 시도",
  },
  [APP_ERROR.ULTRA_FORECAST_RETRY_LATER]: {
    title: "날씨 정보를 찾지 못했어요.",
    description:
      "날씨 정보를 불러오는 요청이 많거나 서버가 불안정합니다. 잠시 후 다시 시도해 주세요.",
    actionLabel: "다시 시도",
  },
  [APP_ERROR.ULTRA_FORECAST_UNEXPECTED]: {
    title: "날씨 정보를 찾지 못했어요.",
    description: "알 수 없는 에러로 날씨 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    actionLabel: "다시 시도",
  },
  [APP_ERROR.ULTRA_NOW]: {
    title: "날씨 정보를 찾지 못했어요.",
    description: "날씨 정보를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    actionLabel: "다시 시도",
  },
  [APP_ERROR.ULTRA_NOW_NOT_FOUND]: {
    title: "날씨 정보를 찾지 못했어요.",
    description: `날씨 정보를 불러오는 중 문제가 발생했습니다.\n잠시 후 다시 시도해 주세요.`,
    actionLabel: "다시 시도",
  },
  [APP_ERROR.ULTRA_NOW_RETRY_LATER]: {
    title: "날씨 정보를 찾지 못했어요.",
    description:
      "날씨 정보를 불러오는 요청이 많거나 서버가 불안정합니다. 잠시 후 다시 시도해 주세요.",
    actionLabel: "다시 시도",
  },
  [APP_ERROR.ULTRA_NOW_UNEXPECTED]: {
    title: "날씨 정보를 찾지 못했어요.",
    description: "알 수 없는 에러로 날씨 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    actionLabel: "다시 시도",
  },
  [APP_ERROR.SHORT_FORECAST]: {
    title: "날씨 정보를 찾지 못했어요.",
    description: "날씨 정보를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    actionLabel: "다시 시도",
  },
  [APP_ERROR.SHORT_FORECAST_NOT_FOUND]: {
    title: "날씨 정보를 찾지 못했어요.",
    description: `날씨 정보를 불러오는 중 문제가 발생했습니다.\n잠시 후 다시 시도해 주세요.`,
    actionLabel: "다시 시도",
  },
  [APP_ERROR.SHORT_FORECAST_RETRY_LATER]: {
    title: "날씨 정보를 찾지 못했어요.",
    description:
      "날씨 정보를 불러오는 요청이 많거나 서버가 불안정합니다. 잠시 후 다시 시도해 주세요.",
    actionLabel: "다시 시도",
  },
  [APP_ERROR.SHORT_FORECAST_UNEXPECTED]: {
    title: "날씨 정보를 찾지 못했어요.",
    description: "알 수 없는 에러로 날씨 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    actionLabel: "다시 시도",
  },
  [APP_ERROR.LOCATION_LOOKUP]: {
    title: "위치를 찾지 못했어요",
    description: "지역 정보를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    actionLabel: "다시 시도",
  },
  [APP_ERROR.LOCATION_LOOKUP_NOT_FOUND]: {
    title: "위치를 찾지 못했어요",
    description: "현재 위치에 해당하는 지역 정보를 찾지 못했습니다. 잠시 후 다시 시도해 주세요.",
    actionLabel: "다시 시도",
  },
  [APP_ERROR.LOCATION_LOOKUP_RETRY_LATER]: {
    title: "위치 조회가 지연되고 있어요",
    description:
      "지역 정보를 불러오는 요청이 많거나 서버가 불안정합니다. 잠시 후 다시 시도해 주세요.",
    actionLabel: "다시 시도",
  },
  [APP_ERROR.LOCATION_LOOKUP_UNEXPECTED]: {
    title: "위치를 찾지 못했어요.",
    description: "알 수 없는 에러로 지역 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    actionLabel: "다시 시도",
  },
  [APP_ERROR.LATLON_LOOKUP]: {
    title: "위치를 찾지 못했어요",
    description:
      "날씨 정보를 조회하기 위한 지역 정보를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    actionLabel: "다시 시도",
  },
  [APP_ERROR.LATLON_LOOKUP_NOT_FOUND]: {
    title: "위치를 찾지 못했어요.",
    description:
      "날씨 정보를 조회하기 위한 현재 위치에 해당하는 지역 정보를 찾지 못했습니다. 잠시 후 다시 시도해 주세요.",
    actionLabel: "다시 시도",
  },
  [APP_ERROR.LATLON_LOOKUP_RETRY_LATER]: {
    title: "위치를 찾지 못했어요.",
    description:
      "지역 정보를 불러오는 요청이 많거나 서버가 불안정합니다. 잠시 후 다시 시도해 주세요.",
    actionLabel: "다시 시도",
  },
  [APP_ERROR.LATLON_LOOKUP_UNEXPECTED]: {
    title: "위치를 찾지 못했어요.",
    description: "알 수 없는 에러로 지역 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    actionLabel: "다시 시도",
  },
  [APP_ERROR.WEATHER_FETCH]: {
    title: "날씨 정보를 불러오지 못했어요",
    description: "날씨 정보를 가져오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    actionLabel: "다시 시도",
  },
  [APP_ERROR.BOOKMARK_ACTION]: {
    title: "북마크 저장에 실패했어요",
    description: "북마크를 저장하는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    actionLabel: "다시 시도",
  },
} satisfies Record<string, AppErrorMeta>;

export type AppErrorType = (typeof APP_ERROR)[keyof typeof APP_ERROR];
