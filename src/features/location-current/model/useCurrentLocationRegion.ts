import { fetchRegionNameFromCoord } from "@/entities/kakao/api/fetchRegionNameFromCoord";
import type { GridCoord, LatLon } from "@/entities/weather/model/weather.types";
import { APP_ERROR, appErrorMetaMap } from "@/shared/api/app-errors";
import { isAppError, type AppErrorMeta } from "@/shared/api/types";
import { convertToGridCoord } from "@/shared/lib/convertToGridCoord";
import {
  createRequestAttemptState,
  recordRequestFailure,
  resetRequestAttemptState,
  type RequestAttemptPolicy,
  type RequestAttemptState,
} from "@/shared/lib/requestAttemptPolicy";
import { getUserLocation } from "@/shared/lib/userLocation";
import { useCallback, useEffect, useRef, useState } from "react";

export type LocationPermissionStatus = PermissionState | "unsupported" | "unknown";

export type CurrentLocationFailureReason =
  | "permission-denied"
  | "unavailable"
  | "timeout"
  | "unsupported"
  | "region-lookup-failed"
  | "unexpected";

export type CurrentLocationRegionStatus = "idle" | "loading" | "success" | "error";

export type CurrentLocationRegionState = {
  status: CurrentLocationRegionStatus;
  regionName: string;
  latLon: LatLon | null;
  gridCoord: GridCoord | null;
  errorMeta: AppErrorMeta | null;
  failureReason: CurrentLocationFailureReason | null;
};

type CurrentLocationResolution =
  | {
      status: "success";
      regionName: string;
      latLon: LatLon;
      gridCoord: GridCoord;
    }
  | {
      status: "error";
      errorMeta: AppErrorMeta;
      failureReason: CurrentLocationFailureReason;
    };

type UseCurrentLocationRegionOptions = {
  enabled?: boolean;
  requestOnMount?: boolean;
  promptBeforeRequest?: boolean;
  showDialogOnError?: boolean;
  policy?: RequestAttemptPolicy;
  onRequestLimitReached?: () => void;
};

type UseCurrentLocationRegionResult = CurrentLocationRegionState & {
  permissionStatus: LocationPermissionStatus;
  isDialogOpen: boolean;
  isRequesting: boolean;
  attemptState: RequestAttemptState;
  requestCurrentLocation: () => Promise<void>;
  closeDialog: () => void;
  openDialog: () => void;
};

export const DEFAULT_LOCATION_REQUEST_ATTEMPT_POLICY: RequestAttemptPolicy = {
  maxFailures: 3,
  minFeedbackMs: 700,
};

const waitForMinimumFeedback = async (
  startedAt: number,
  policy: RequestAttemptPolicy,
): Promise<void> => {
  const elapsedMs = Date.now() - startedAt;
  const remainingMs = policy.minFeedbackMs - elapsedMs;

  if (remainingMs > 0) {
    await new Promise((resolve) => window.setTimeout(resolve, remainingMs));
  }
};

const createInitialState = (): CurrentLocationRegionState => ({
  status: "idle",
  regionName: "",
  latLon: null,
  gridCoord: null,
  errorMeta: null,
  failureReason: null,
});

export const getCurrentLocationFailureReason = (
  error: unknown,
): CurrentLocationFailureReason => {
  if (!isAppError(error)) {
    return "unexpected";
  }

  switch (error.type) {
    case APP_ERROR.LOCATION_PERMISSION:
      return "permission-denied";
    case APP_ERROR.LOCATION_UNAVAILABLE:
      return "unavailable";
    case APP_ERROR.LOCATION_TIMEOUT:
      return "timeout";
    case APP_ERROR.LOCATION_LOOKUP:
    case APP_ERROR.LOCATION_LOOKUP_NOT_FOUND:
    case APP_ERROR.LOCATION_LOOKUP_RETRY_LATER:
    case APP_ERROR.LOCATION_LOOKUP_UNEXPECTED:
      return "region-lookup-failed";
    default:
      return "unexpected";
  }
};

const resolveCurrentLocationRegion = async (): Promise<CurrentLocationResolution> => {
  try {
    const latLon = await getUserLocation();
    const regionName = await fetchRegionNameFromCoord(latLon);

    return {
      status: "success",
      regionName,
      latLon,
      gridCoord: convertToGridCoord(latLon),
    };
  } catch (error: unknown) {
    return {
      status: "error",
      errorMeta: isAppError(error)
        ? error.meta
        : appErrorMetaMap[APP_ERROR.LOCATION_LOOKUP_UNEXPECTED],
      failureReason: getCurrentLocationFailureReason(error),
    };
  }
};

export const useCurrentLocationRegion = ({
  enabled = true,
  requestOnMount = true,
  promptBeforeRequest = true,
  showDialogOnError = true,
  policy = DEFAULT_LOCATION_REQUEST_ATTEMPT_POLICY,
  onRequestLimitReached,
}: UseCurrentLocationRegionOptions = {}): UseCurrentLocationRegionResult => {
  const [state, setState] = useState<CurrentLocationRegionState>(() => createInitialState());
  const [permissionStatus, setPermissionStatus] =
    useState<LocationPermissionStatus>("unknown");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [attemptState, setAttemptState] = useState<RequestAttemptState>(() =>
    createRequestAttemptState(policy),
  );
  const isRequestInFlightRef = useRef(false);
  const attemptStateRef = useRef(attemptState);
  const policyRef = useRef(policy);
  const onRequestLimitReachedRef = useRef(onRequestLimitReached);

  useEffect(() => {
    attemptStateRef.current = attemptState;
  }, [attemptState]);

  useEffect(() => {
    policyRef.current = policy;
  }, [policy]);

  useEffect(() => {
    onRequestLimitReachedRef.current = onRequestLimitReached;
  }, [onRequestLimitReached]);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const openDialog = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const requestCurrentLocation = useCallback(async () => {
    if (!enabled || isRequestInFlightRef.current) {
      return;
    }

    const currentPolicy = policyRef.current;

    if (attemptStateRef.current.isLimitReached) {
      onRequestLimitReachedRef.current?.();
      return;
    }

    isRequestInFlightRef.current = true;
    setIsRequesting(true);
    setState((prev) => ({ ...prev, status: "loading", errorMeta: null, failureReason: null }));
    const startedAt = Date.now();
    const resolution = await resolveCurrentLocationRegion();

    await waitForMinimumFeedback(startedAt, currentPolicy);

    if (resolution.status === "success") {
      const resetState = resetRequestAttemptState(currentPolicy);
      attemptStateRef.current = resetState;
      setAttemptState(resetState);
      setState({
        status: "success",
        regionName: resolution.regionName,
        latLon: resolution.latLon,
        gridCoord: resolution.gridCoord,
        errorMeta: null,
        failureReason: null,
      });
      setPermissionStatus("granted");
      setIsDialogOpen(false);
      setIsRequesting(false);
      isRequestInFlightRef.current = false;
      return;
    }

    const nextAttemptState = recordRequestFailure(attemptStateRef.current, currentPolicy);
    attemptStateRef.current = nextAttemptState;
    setAttemptState(nextAttemptState);

    if (resolution.failureReason === "permission-denied") {
      setPermissionStatus("denied");
    }

    setState({
      status: "error",
      regionName: "",
      latLon: null,
      gridCoord: null,
      errorMeta: resolution.errorMeta,
      failureReason: resolution.failureReason,
    });
    setIsDialogOpen(showDialogOnError);
    setIsRequesting(false);
    isRequestInFlightRef.current = false;

    if (nextAttemptState.isLimitReached) {
      onRequestLimitReachedRef.current?.();
    }
  }, [enabled, showDialogOnError]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (!requestOnMount) {
      return;
    }

    if (!promptBeforeRequest) {
      const requestTimer = window.setTimeout(() => {
        void requestCurrentLocation();
      }, 0);

      return () => {
        window.clearTimeout(requestTimer);
      };
    }

    if (!("geolocation" in navigator)) {
      const unsupportedTimer = window.setTimeout(() => {
        setPermissionStatus("unsupported");
        setState({
          status: "error",
          regionName: "",
          latLon: null,
          gridCoord: null,
          errorMeta: appErrorMetaMap[APP_ERROR.LOCATION_UNAVAILABLE],
          failureReason: "unsupported",
        });
        setIsDialogOpen(true);
      }, 0);

      return () => {
        window.clearTimeout(unsupportedTimer);
      };
    }

    let ignore = false;
    let permission: PermissionStatus | null = null;

    const preparePermissionState = async () => {
      if (!("permissions" in navigator) || !navigator.permissions.query) {
        setIsDialogOpen(true);
        return;
      }

      try {
        permission = await navigator.permissions.query({
          name: "geolocation" as PermissionName,
        });

        if (ignore) {
          return;
        }

        const applyPermissionState = () => {
          if (!permission) {
            return;
          }

          const nextState = permission.state;
          setPermissionStatus(nextState);

          if (nextState === "granted") {
            setIsDialogOpen(false);
            void requestCurrentLocation();
            return;
          }

          setIsDialogOpen(true);
        };

        permission.onchange = applyPermissionState;
        applyPermissionState();
      } catch {
        if (!ignore) {
          setPermissionStatus("unknown");
          setIsDialogOpen(true);
        }
      }
    };

    void preparePermissionState();

    return () => {
      ignore = true;
      if (permission) {
        permission.onchange = null;
      }
    };
  }, [enabled, promptBeforeRequest, requestCurrentLocation, requestOnMount]);

  return {
    ...state,
    permissionStatus,
    isDialogOpen,
    isRequesting,
    attemptState,
    requestCurrentLocation,
    closeDialog,
    openDialog,
  };
};
