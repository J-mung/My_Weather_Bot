import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/button";
import { ErrorCode } from "@/shared/ui/error-code";
import {
  getLocationPermissionDialogCopy,
  isLocationRequestDisabled,
} from "../lib/location-permission-dialog.lib";
import type {
  LocationPermissionDialogProps,
  LocationPermissionStatus,
} from "../lib/location-permission-dialog.types";
import { mainPageStyles } from "./styles";

export const LocationPermissionDialog = ({
  isOpen,
  status,
  error,
  failureReason,
  isRequesting,
  onRequestLocation,
  onSearchLocation,
}: LocationPermissionDialogProps) => {
  if (!isOpen) {
    return null;
  }

  const copy = getLocationPermissionDialogCopy({
    status,
    failureReason,
    hasError: Boolean(error),
  });
  const isRequestDisabled = isLocationRequestDisabled({ status, isRequesting });

  return (
    <div
      className={cn(mainPageStyles.locationDialogBackdrop)}
      role="presentation"
    >
      <section
        className={cn(mainPageStyles.locationDialogPanel)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-permission-title"
      >
        <h2 id="location-permission-title" className={cn(mainPageStyles.locationDialogTitle)}>
          {copy.title}
        </h2>
        <span className={cn(mainPageStyles.locationDialogDescription)}>{copy.description}</span>
        {error && (
          <span className={cn(mainPageStyles.locationDialogDescription)}>
            {error.description}
            <ErrorCode code={error.code} />
          </span>
        )}
        <span className={cn(mainPageStyles.locationDialogHint)}>{copy.hint}</span>

        <div className={cn(mainPageStyles.locationDialogActions)}>
          <Button
            type="button"
            variant="primary"
            disabled={isRequestDisabled}
            onClick={onRequestLocation}
          >
            {isRequesting ? "확인 중..." : "현재 위치 다시 확인"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={isRequesting}
            onClick={onSearchLocation}
          >
            지역 검색으로 선택
          </Button>
        </div>
      </section>
    </div>
  );
};

export type { LocationPermissionStatus };
