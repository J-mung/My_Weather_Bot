import type { GridCoord } from "@/entities/weather/model/weather.types";
import { isAppError } from "@/shared/api/types";
import { SPACE_REGEX } from "@/shared/lib/location-search.constants";
import { createDistrictSearchEngine } from "@/shared/lib/location-search.engine";
import { searchDistricts, toDisplayDistrictName } from "@/shared/lib/location-search.lib";
import type { DistrictSearchItem, DistrictSearchResult } from "@/shared/lib/location.types";
import { resolveGridCoordByRegion } from "@/shared/lib/resolveGridCoord";
import { useEffect, useMemo, useState } from "react";

/**
 * UI와 로직을 분리하기 위해 위치 검색과 관련한 함수들 정의한 훅
 */
export const useLocationSearch = (): {
  input: string;
  candidates: DistrictSearchResult[];
  selectedDistrict: DistrictSearchItem | null;
  selectedGridCoord: GridCoord | null;
  errorMessage: string | null;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  selectDistrict: (district: DistrictSearchItem) => Promise<GridCoord | null>;
  clearSelection: () => void;
} => {
  const [input, setInput] = useState<string>("");
  const [candidates, setCandidates] = useState<DistrictSearchResult[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictSearchItem | null>(null);
  const [selectedGridCoord, setSelectedGridCoord] = useState<GridCoord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // JSON 1번만 읽고 메모이제이션
  const searchEngine = useMemo(() => createDistrictSearchEngine(), []);

  /**
   * 사용자 입력으로 위치 후보 목록 생성
   * @returns
   */
  useEffect(() => {
    const trimInput = input.trim();

    const timer = window.setTimeout(() => {
      if (!trimInput) {
        setCandidates([]);
        setErrorMessage(null);
        return null;
      }

      const parsedInput = trimInput.replace(SPACE_REGEX, "");
      if (parsedInput.length <= 1) {
        setCandidates([]);
        setErrorMessage("검색어를 더 구체적으로 입력해 주세요.");
        return;
      }

      const results = searchDistricts(trimInput, searchEngine, 20);
      setCandidates(results);
      setErrorMessage(results.length === 0 ? "검색 결과가 없습니다." : null);
    }, 200);

    return () => window.clearTimeout(timer);
  }, [input, searchEngine]);

  /**
   * 위치 후보 목록에서 사용자가 1개를 선택 했을 때 선택된 항목의 GridCoord 반환
   * @param district
   * @returns
   */
  const selectDistrict = async (district: DistrictSearchItem) => {
    setSelectedDistrict(district);

    try {
      const gridCoord = await resolveGridCoordByRegion(district.fullName);

      setSelectedGridCoord(gridCoord);
      setErrorMessage(null);
      setInput(toDisplayDistrictName(district));

      return gridCoord;
    } catch (error: unknown) {
      if (isAppError(error)) {
        setSelectedGridCoord(null);
        setErrorMessage(error.meta.description);
        return null;
      }

      setSelectedGridCoord(null);
      setErrorMessage("해당 장소의 좌표를 확인하지 못했습니다.");
      return null;
    }
  };

  /**
   * 선택된 후보/좌표/에러 상태 초기화
   */
  const clearSelection = () => {
    setSelectedDistrict(null);
    setSelectedGridCoord(null);
    setErrorMessage(null);
  };

  return {
    input,
    candidates,
    selectedDistrict,
    selectedGridCoord,
    errorMessage,
    setInput,
    selectDistrict,
    clearSelection,
  };
};
