import { APP_ERROR, appErrorMetaMap } from "@/shared/api/app-errors";
import { isAppError } from "@/shared/api/types";
import { cn } from "@/shared/lib/cn";
import Button, { IconButton } from "@/shared/ui/button";
import { ErrorCode } from "@/shared/ui/error-code";
import { useState } from "react";
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
  useSearchParams,
} from "react-router-dom";
import { errorPageStyles } from "./styles";

const ERROR_PAGE_REASON_META = {
  "location-request-limit": appErrorMetaMap[APP_ERROR.LOCATION_REQUEST_LIMIT],
} as const;

type ErrorPageReason = keyof typeof ERROR_PAGE_REASON_META;

const isErrorPageReason = (reason: string | null): reason is ErrorPageReason => {
  return Boolean(reason && reason in ERROR_PAGE_REASON_META);
};

const getErrorMeta = (routeError: unknown) => {
  if (isAppError(routeError)) {
    return routeError.meta;
  }

  if (isRouteErrorResponse(routeError) && routeError.status === 404) {
    return appErrorMetaMap[APP_ERROR.APP_ROUTE_NOT_FOUND];
  }

  return appErrorMetaMap[APP_ERROR.APP_RUNTIME];
};

type ErrorPageProps = {
  notFound?: boolean;
};

const RETRY_LOADING_DELAY_MS = 500;

const SEARCH_FALLBACK_ERROR_REASONS = new Set<ErrorPageReason>(["location-request-limit"]);

export default function ErrorPage({ notFound = false }: ErrorPageProps) {
  const routeError = useRouteError();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isRetrying, setIsRetrying] = useState(false);
  const errorReason = searchParams.get("reason");
  const shouldNavigateSearchOnRetry =
    isErrorPageReason(errorReason) && SEARCH_FALLBACK_ERROR_REASONS.has(errorReason);
  const shouldNavigateHomeOnRetry =
    notFound ||
    (isErrorPageReason(errorReason) && !shouldNavigateSearchOnRetry) ||
    (isRouteErrorResponse(routeError) && routeError.status === 404);
  const errorMeta = (() => {
    if (notFound) {
      return appErrorMetaMap[APP_ERROR.APP_ROUTE_NOT_FOUND];
    }

    if (routeError) {
      return getErrorMeta(routeError);
    }

    if (isErrorPageReason(errorReason)) {
      return ERROR_PAGE_REASON_META[errorReason];
    }

    return appErrorMetaMap[APP_ERROR.APP_RUNTIME];
  })();

  const primaryActionLabel = errorMeta.actionLabel ?? "다시 시도";
  const primaryLoadingLabel =
    shouldNavigateSearchOnRetry || shouldNavigateHomeOnRetry
      ? "이동 중..."
      : "다시 불러오는 중...";
  const primaryIconName = shouldNavigateSearchOnRetry ? "search" : "refresh";

  const handleRetry = () => {
    if (isRetrying) {
      return;
    }

    setIsRetrying(true);
    window.setTimeout(() => {
      if (shouldNavigateSearchOnRetry) {
        navigate("/search", { replace: true });
        return;
      }

      if (shouldNavigateHomeOnRetry) {
        navigate("/", { replace: true });
        return;
      }

      window.location.reload();
    }, RETRY_LOADING_DELAY_MS);
  };

  return (
    <main className={cn(errorPageStyles.page)}>
      <section className={cn(errorPageStyles.card)} aria-labelledby="app-error-title">
        <div className={cn(errorPageStyles.panel)}>
          <span className={cn(errorPageStyles.eyebrow)}>MyWeatherBot</span>
          <h1 id="app-error-title" className={cn(errorPageStyles.title)}>
            {errorMeta.title}
          </h1>
          <span className={cn(errorPageStyles.description)}>{errorMeta.description}</span>
          <ErrorCode code={errorMeta.code} />

          <div className={cn(errorPageStyles.actions)}>
            <IconButton
              type="button"
              variant="primary"
              disabled={isRetrying}
              onClick={handleRetry}
              iconName={primaryIconName}
              iconClassName={cn(!shouldNavigateSearchOnRetry && isRetrying && "animate-spin")}
            >
              {isRetrying ? primaryLoadingLabel : primaryActionLabel}
            </IconButton>
            <Button
              type="button"
              variant="secondary"
              disabled={isRetrying}
              onClick={() => {
                navigate("/", { replace: true });
              }}
            >
              홈으로 이동
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
