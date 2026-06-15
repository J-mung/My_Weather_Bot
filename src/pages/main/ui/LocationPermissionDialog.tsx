import type { CurrentLocationFailureReason } from "@/features/location-current/model";
import type { AppErrorMeta } from "@/shared/api/types";
import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/button";
import { ErrorCode } from "@/shared/ui/error-code";
import { mainPageStyles } from "./styles";

type LocationPermissionStatus = PermissionState | "unsupported" | "unknown";

type LocationPermissionDialogProps = {
  isOpen: boolean;
  status: LocationPermissionStatus;
  error: AppErrorMeta | null;
  failureReason: CurrentLocationFailureReason | null;
  isRequesting: boolean;
  onRequestLocation: () => void;
  onSearchLocation: () => void;
};

const getDialogCopy = (
  status: LocationPermissionStatus,
  failureReason: CurrentLocationFailureReason | null,
  hasError: boolean,
) => {
  if (status === "denied" || failureReason === "permission-denied") {
    return {
      title: "현재 위치 권한이 꺼져 있어요",
      description:
        "현재 위치 날씨를 보려면 브라우저의 사이트 위치 권한과 기기 위치 서비스가 모두 허용되어 있어야 합니다.",
      hint:
        "주소창의 사이트 설정에서 위치 권한을 허용한 뒤 다시 확인해 주세요. 계속 실패하면 지역 검색으로 날씨를 볼 수 있어요.",
    };
  }

  if (status === "unsupported" || failureReason === "unsupported") {
    return {
      title: "현재 위치 기능을 사용할 수 없어요",
      description:
        "이 브라우저에서는 현재 위치를 가져올 수 없습니다. 지역을 검색해서 날씨를 확인해 주세요.",
      hint: "지역 검색을 이용하면 현재 위치 권한 없이도 원하는 지역의 날씨를 볼 수 있어요.",
    };
  }

  if (failureReason === "unsupported-service-area") {
    return {
      title: "현재 위치로는 날씨를 찾을 수 없어요",
      description:
        "현재 앱은 국내 지역 날씨를 기준으로 제공돼요. 지역명을 검색해서 원하는 지역의 날씨를 확인해 주세요.",
      hint: "검색한 지역은 북마크로 저장해 다음에도 빠르게 확인할 수 있어요.",
    };
  }

  if (failureReason === "timeout") {
    return {
      title: "위치 확인 시간이 오래 걸리고 있어요",
      description:
        "기기 위치 신호나 네트워크 상태가 불안정하면 현재 위치를 바로 확인하지 못할 수 있어요.",
      hint: "잠시 후 다시 시도하거나 지역 검색으로 위치를 직접 선택해 주세요.",
    };
  }

  if (failureReason === "region-lookup-failed") {
    return {
      title: "현재 위치의 지역명을 확인하지 못했어요",
      description:
        "현재 좌표는 확인했지만 날씨 조회에 사용할 지역명으로 변환하지 못했습니다.",
      hint: "지역 검색으로 원하는 위치를 선택하면 날씨를 바로 확인할 수 있어요.",
    };
  }

  if (hasError) {
    return {
      title: "현재 위치를 다시 확인해 주세요",
      description:
        "위치 권한이 허용되어 있어도 기기 위치 서비스나 네트워크 상태에 따라 위치 확인이 실패할 수 있습니다.",
      hint: "잠시 후 다시 시도하거나 지역 검색으로 위치를 직접 선택해 주세요.",
    };
  }

  return {
    title: "현재 위치를 사용해도 될까요?",
    description:
      "현재 위치 기준 날씨를 보여드리려면 브라우저 위치 권한이 필요합니다. 권한 요청이 표시되면 허용을 선택해 주세요.",
    hint: "권한을 허용하지 않아도 지역 검색으로 원하는 위치의 날씨를 확인할 수 있어요.",
  };
};

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

  const copy = getDialogCopy(status, failureReason, Boolean(error));
  const isLocationRequestDisabled = status === "unsupported" || isRequesting;

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
            disabled={isLocationRequestDisabled}
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
