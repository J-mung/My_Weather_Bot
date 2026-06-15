import { cn } from "@/shared/lib/cn";
import Button, { IconButton } from "@/shared/ui/button";
import { ErrorCode } from "@/shared/ui/error-code";
import { useState } from "react";
import { useNavigate, useRouteError, useSearchParams } from "react-router-dom";
import {
  ERROR_PAGE_RETRY_LOADING_DELAY_MS,
  getErrorPagePrimaryAction,
  resolveErrorPageState,
} from "../lib/error-page.lib";
import type { ErrorPageProps } from "../lib/error-page.types";
import { errorPageStyles } from "./styles";

export default function ErrorPage({ notFound = false }: ErrorPageProps) {
  const routeError = useRouteError();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isRetrying, setIsRetrying] = useState(false);
  const errorReason = searchParams.get("reason");
  const errorPageState = resolveErrorPageState({ notFound, routeError, errorReason });
  const primaryAction = getErrorPagePrimaryAction(errorPageState);
  const errorMeta = errorPageState.meta;

  const handleRetry = () => {
    if (isRetrying) {
      return;
    }

    setIsRetrying(true);
    window.setTimeout(() => {
      if (errorPageState.retryTarget === "search") {
        navigate("/search", { replace: true });
        return;
      }

      if (errorPageState.retryTarget === "home") {
        navigate("/", { replace: true });
        return;
      }

      window.location.reload();
    }, ERROR_PAGE_RETRY_LOADING_DELAY_MS);
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
              iconName={primaryAction.iconName}
              iconClassName={cn(primaryAction.shouldSpinIcon && isRetrying && "animate-spin")}
            >
              {isRetrying ? primaryAction.loadingLabel : primaryAction.label}
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
