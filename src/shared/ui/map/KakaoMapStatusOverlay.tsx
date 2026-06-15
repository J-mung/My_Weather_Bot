import { cn } from "@/shared/lib/cn";
import { ErrorCode } from "@/shared/ui/error-code";
import { DEFAULT_ERROR_MESSAGE } from "./kakao-region-map.constants";
import { getKakaoRegionMapStatusTitle } from "./kakao-region-map.lib";
import type { KakaoRegionMapStatus } from "./kakao-region-map.types";

type KakaoMapStatusOverlayProps = {
  status: KakaoRegionMapStatus;
  message: string;
  errorCode: string | null;
};

export const KakaoMapStatusOverlay = ({
  status,
  message,
  errorCode,
}: KakaoMapStatusOverlayProps) => (
  <div
    className={cn(
      "absolute inset-0 grid place-items-center bg-[var(--surface-soft)] px-5 text-center",
    )}
  >
    <div className={cn("max-w-sm")}>
      <span className={cn("block font-extrabold text-[var(--text-main)]")}>
        {getKakaoRegionMapStatusTitle(status)}
      </span>
      <span className={cn("mt-2 block text-sm leading-6 text-[var(--text-sub)]")}>
        {message || DEFAULT_ERROR_MESSAGE}
        <ErrorCode code={errorCode} />
      </span>
    </div>
  </div>
);
