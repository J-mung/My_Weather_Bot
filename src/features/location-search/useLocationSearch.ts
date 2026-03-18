import type { GridCoord } from "@/entities/weather/model/weather.types";
import { SPACE_REGEX } from "@/shared/lib/location-search.constants";
import { createDistrictSearchEngine } from "@/shared/lib/location-search.engine";
import { searchDistricts, toDisplayDistrictName } from "@/shared/lib/location-search.lib";
import type { DistrictSearchItem } from "@/shared/lib/location.types";
import { resolveGridCoordByRegion } from "@/shared/lib/resolveGridCoord";
import { useMemo, useState } from "react";

/**
 * UI와 로직을 분리하기 위해 위치 검색과 관련한 함수들 정의한 훅
 */
export const useLocationSearch = (): {
  input: string;
  candidates: DistrictSearchItem[];
  selectedDistrict: DistrictSearchItem | null;
  selectedGridCoord: GridCoord | null;
  errorMessage: string | null;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  runSearch: () => void;
  selectDistrict: (district: DistrictSearchItem) => Promise<GridCoord | null>;
  clearSelection: () => void;
} => {
  const [input, setInput] = useState<string>("");
  const [candidates, setCandidates] = useState<DistrictSearchItem[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictSearchItem | null>(null);
  const [selectedGridCoord, setSelectedGridCoord] = useState<GridCoord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // JSON 1번만 읽고 메모이제이션
  const searchEngine = useMemo(() => createDistrictSearchEngine(), []);

  /**
   * 사용자 입력으로 위치 후보 목록 생성
   * @returns
   */
  const runSearch = () => {
    const trimInput = input.trim();

    if (!trimInput) {
      setErrorMessage("검색어를 입력해 주세요.");
      setCandidates([]);
      return;
    }

    const restrictionInput = trimInput.replace(SPACE_REGEX, "");
    if (restrictionInput.length <= 2) {
      setErrorMessage("검색어를 더 구체적으로 입력해 주세요.\n(예: 서울특별시, 종로구, 청운동)");
      setCandidates([]);
      return;
    }

    const results = searchDistricts(trimInput, searchEngine, 20);
    setCandidates(results);
    setErrorMessage(results.length === 0 ? "검색 결과가 없습니다." : null);

    // 새 검색 시작 시 이전 선택 초기화
    setSelectedDistrict(null);
    setSelectedGridCoord(null);
  };

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
    } catch {
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
    runSearch,
    selectDistrict,
    clearSelection,
  };
};
