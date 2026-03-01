import type { GridCoord } from "@/entities/weather/model/weatherTypes";
import {
  buildDistrictSearchIndex,
  getGridCoordByDistrictName,
  searchDistricts,
  SPACE_REGEX,
  toDisplayDistrictName,
} from "@/shared/lib/locationSearch";
import type { DistrictSearchItem } from "@/shared/lib/locationTypes";
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
  setInput: (value: string) => void;
  runSearch: () => void;
  selectDistrict: (district: DistrictSearchItem) => GridCoord | null;
  clearSelection: () => void;
} => {
  const [input, setInput] = useState("");
  const [candidates, setCandidates] = useState<DistrictSearchItem[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictSearchItem | null>(null);
  const [selectedGridCoord, setSelectedGridCoord] = useState<GridCoord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // JSON 1번만 읽고 메모이제이션
  const searchIndex = useMemo(() => buildDistrictSearchIndex(), []);

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

    const results = searchDistricts(trimInput, searchIndex, 20);
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
  const selectDistrict = (district: DistrictSearchItem) => {
    const gridCoord = getGridCoordByDistrictName(district.fullName);

    setSelectedDistrict(district);
    setSelectedGridCoord(gridCoord);

    if (!gridCoord) {
      setErrorMessage("해당 장소의 정보가 제공되지 않습니다.");
      return null;
    }

    setErrorMessage(null);
    setInput(toDisplayDistrictName(district));

    return gridCoord;
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
