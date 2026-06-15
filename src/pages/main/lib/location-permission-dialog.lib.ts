import type { CurrentLocationFailureReason } from "@/features/location-current/model";
import type {
  LocationPermissionDialogCopy,
  LocationPermissionStatus,
} from "./location-permission-dialog.types";

const PERMISSION_DENIED_COPY: LocationPermissionDialogCopy = {
  title: "현재 위치 권한이 꺼져 있어요",
  description:
    "현재 위치 날씨를 보려면 브라우저의 사이트 위치 권한과 기기 위치 서비스가 모두 허용되어 있어야 합니다.",
  hint:
    "주소창의 사이트 설정에서 위치 권한을 허용한 뒤 다시 확인해 주세요. 계속 실패하면 지역 검색으로 날씨를 볼 수 있어요.",
};

const UNSUPPORTED_COPY: LocationPermissionDialogCopy = {
  title: "현재 위치 기능을 사용할 수 없어요",
  description:
    "이 브라우저에서는 현재 위치를 가져올 수 없습니다. 지역을 검색해서 날씨를 확인해 주세요.",
  hint: "지역 검색을 이용하면 현재 위치 권한 없이도 원하는 지역의 날씨를 볼 수 있어요.",
};

const OUT_OF_SERVICE_AREA_COPY: LocationPermissionDialogCopy = {
  title: "현재 위치로는 날씨를 찾을 수 없어요",
  description:
    "현재 앱은 국내 지역 날씨를 기준으로 제공돼요. 지역명을 검색해서 원하는 지역의 날씨를 확인해 주세요.",
  hint: "검색한 지역은 북마크로 저장해 다음에도 빠르게 확인할 수 있어요.",
};

const TIMEOUT_COPY: LocationPermissionDialogCopy = {
  title: "위치 확인 시간이 오래 걸리고 있어요",
  description:
    "기기 위치 신호나 네트워크 상태가 불안정하면 현재 위치를 바로 확인하지 못할 수 있어요.",
  hint: "잠시 후 다시 시도하거나 지역 검색으로 위치를 직접 선택해 주세요.",
};

const REGION_LOOKUP_FAILED_COPY: LocationPermissionDialogCopy = {
  title: "현재 위치의 지역명을 확인하지 못했어요",
  description: "현재 좌표는 확인했지만 날씨 조회에 사용할 지역명으로 변환하지 못했습니다.",
  hint: "지역 검색으로 원하는 위치를 선택하면 날씨를 바로 확인할 수 있어요.",
};

const LOCATION_ERROR_COPY: LocationPermissionDialogCopy = {
  title: "현재 위치를 다시 확인해 주세요",
  description:
    "위치 권한이 허용되어 있어도 기기 위치 서비스나 네트워크 상태에 따라 위치 확인이 실패할 수 있습니다.",
  hint: "잠시 후 다시 시도하거나 지역 검색으로 위치를 직접 선택해 주세요.",
};

const LOCATION_PROMPT_COPY: LocationPermissionDialogCopy = {
  title: "현재 위치를 사용해도 될까요?",
  description:
    "현재 위치 기준 날씨를 보여드리려면 브라우저 위치 권한이 필요합니다. 권한 요청이 표시되면 허용을 선택해 주세요.",
  hint: "권한을 허용하지 않아도 지역 검색으로 원하는 위치의 날씨를 확인할 수 있어요.",
};

const FAILURE_REASON_COPY_MAP: Partial<
  Record<CurrentLocationFailureReason, LocationPermissionDialogCopy>
> = {
  "permission-denied": PERMISSION_DENIED_COPY,
  unsupported: UNSUPPORTED_COPY,
  "unsupported-service-area": OUT_OF_SERVICE_AREA_COPY,
  timeout: TIMEOUT_COPY,
  "region-lookup-failed": REGION_LOOKUP_FAILED_COPY,
};

export const getLocationPermissionDialogCopy = ({
  status,
  failureReason,
  hasError,
}: {
  status: LocationPermissionStatus;
  failureReason: CurrentLocationFailureReason | null;
  hasError: boolean;
}): LocationPermissionDialogCopy => {
  if (status === "denied") {
    return PERMISSION_DENIED_COPY;
  }

  if (status === "unsupported") {
    return UNSUPPORTED_COPY;
  }

  if (failureReason && failureReason in FAILURE_REASON_COPY_MAP) {
    return FAILURE_REASON_COPY_MAP[failureReason] ?? LOCATION_ERROR_COPY;
  }

  if (hasError) {
    return LOCATION_ERROR_COPY;
  }

  return LOCATION_PROMPT_COPY;
};

export const isLocationRequestDisabled = ({
  status,
  isRequesting,
}: {
  status: LocationPermissionStatus;
  isRequesting: boolean;
}): boolean => status === "unsupported" || isRequesting;
