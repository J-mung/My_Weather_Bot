import {
  fetchRadarCompositeImage,
  type RadarCompositeImageData,
} from "@/entities/weather/api/fetchRadarCompositeImage";
import { useCallback, useEffect, useRef, useState } from "react";

type RadarImageState = {
  data: RadarCompositeImageData | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

export const useRadarCompositeImage = (enabled: boolean) => {
  const [refreshIndex, setRefreshIndex] = useState(0);
  const currentObjectUrlRef = useRef<string | null>(null);
  const [state, setState] = useState<RadarImageState>({
    data: null,
    isLoading: enabled,
    isError: false,
    error: null,
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const abortController = new AbortController();

    queueMicrotask(() => {
      if (!abortController.signal.aborted) {
        setState((prev) => ({
          data: prev.data,
          isLoading: true,
          isError: false,
          error: null,
        }));
      }
    });

    fetchRadarCompositeImage({ signal: abortController.signal })
      .then((data) => {
        if (currentObjectUrlRef.current) {
          URL.revokeObjectURL(currentObjectUrlRef.current);
        }

        currentObjectUrlRef.current = data.imageUrl;
        setState({
          data,
          isLoading: false,
          isError: false,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        setState((prev) => ({
          data: prev.data,
          isLoading: false,
          isError: true,
          error: error instanceof Error ? error : new Error("레이더 영상을 불러오지 못했어요."),
        }));
      });

    return () => {
      abortController.abort();
    };
  }, [enabled, refreshIndex]);

  useEffect(() => {
    return () => {
      if (currentObjectUrlRef.current) {
        URL.revokeObjectURL(currentObjectUrlRef.current);
        currentObjectUrlRef.current = null;
      }
    };
  }, []);

  const refresh = useCallback(() => {
    setRefreshIndex((prev) => prev + 1);
  }, []);

  return {
    ...state,
    refresh,
  };
};
