import type { CurrentLocationFailureReason } from "@/features/location-current/model";
import type { AppErrorMeta } from "@/shared/api/types";

export type LocationPermissionStatus = PermissionState | "unsupported" | "unknown";

export type LocationPermissionDialogProps = {
  isOpen: boolean;
  status: LocationPermissionStatus;
  error: AppErrorMeta | null;
  failureReason: CurrentLocationFailureReason | null;
  isRequesting: boolean;
  onRequestLocation: () => void;
  onSearchLocation: () => void;
};

export type LocationPermissionDialogCopy = {
  title: string;
  description: string;
  hint: string;
};
