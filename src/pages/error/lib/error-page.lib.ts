import { APP_ERROR, appErrorMetaMap } from "@/shared/api/app-errors";
import { isAppError } from "@/shared/api/types";
import { isRouteErrorResponse } from "react-router-dom";
import type {
  ErrorPagePrimaryAction,
  ErrorPageResolution,
  ErrorPageRetryTarget,
} from "./error-page.types";

export const ERROR_PAGE_RETRY_LOADING_DELAY_MS = 500;

export const ERROR_PAGE_REASON_META = {
  "location-request-limit": appErrorMetaMap[APP_ERROR.LOCATION_REQUEST_LIMIT],
} as const;

export type ErrorPageReason = keyof typeof ERROR_PAGE_REASON_META;

const SEARCH_FALLBACK_ERROR_REASONS = new Set<ErrorPageReason>(["location-request-limit"]);

export const isErrorPageReason = (reason: string | null): reason is ErrorPageReason => {
  return Boolean(reason && reason in ERROR_PAGE_REASON_META);
};

export const getErrorMeta = (routeError: unknown) => {
  if (isAppError(routeError)) {
    return routeError.meta;
  }

  if (isRouteErrorResponse(routeError) && routeError.status === 404) {
    return appErrorMetaMap[APP_ERROR.APP_ROUTE_NOT_FOUND];
  }

  return appErrorMetaMap[APP_ERROR.APP_RUNTIME];
};

const getReasonRetryTarget = (reason: ErrorPageReason): ErrorPageRetryTarget => {
  if (SEARCH_FALLBACK_ERROR_REASONS.has(reason)) {
    return "search";
  }

  return "home";
};

export const resolveErrorPageState = ({
  notFound,
  routeError,
  errorReason,
}: {
  notFound: boolean;
  routeError: unknown;
  errorReason: string | null;
}): ErrorPageResolution => {
  if (notFound) {
    return {
      meta: appErrorMetaMap[APP_ERROR.APP_ROUTE_NOT_FOUND],
      retryTarget: "home",
    };
  }

  if (routeError) {
    return {
      meta: getErrorMeta(routeError),
      retryTarget: isRouteErrorResponse(routeError) && routeError.status === 404 ? "home" : "reload",
    };
  }

  if (isErrorPageReason(errorReason)) {
    return {
      meta: ERROR_PAGE_REASON_META[errorReason],
      retryTarget: getReasonRetryTarget(errorReason),
    };
  }

  return {
    meta: appErrorMetaMap[APP_ERROR.APP_RUNTIME],
    retryTarget: "reload",
  };
};

export const getErrorPagePrimaryAction = ({
  meta,
  retryTarget,
}: ErrorPageResolution): ErrorPagePrimaryAction => ({
  label: meta.actionLabel ?? "다시 시도",
  loadingLabel: retryTarget === "reload" ? "다시 불러오는 중..." : "이동 중...",
  iconName: retryTarget === "search" ? "search" : "refresh",
  shouldSpinIcon: retryTarget !== "search",
});
