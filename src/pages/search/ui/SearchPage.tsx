import type { GridCoord } from "@/entities/weather/model/weatherTypes";
import districts from "@/shared/lib/korea_districts.json";
import {
  buildDistrictSearchIndex,
  searchDistricts,
  type DistrictSearchItem,
} from "@/shared/lib/locationSearch";
import type { KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { CandidateList } from "./CandidateList";
import { searchPageStyles } from "./styles";

export default function SearchPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [candidates, setCandidates] = useState<DistrictSearchItem[] | null>(null);
  const [gridCoord, setgridCoord] = useState<GridCoord | null>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    inputRef.current.focus();
  }, [inputRef]);

  const onEnterSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      if (e.currentTarget.value === "") {
        alert("검색어를 입력해 주세요.");
        return;
      }

      if (e.currentTarget.value.length <= 2) {
        alert(`검색어를 더 구체적으로 입력해 주세요.\n(예: 서울특별시, 종로구, 청운동)`);
        return;
      }

      const searchIndex = buildDistrictSearchIndex(districts);
      setCandidates(searchDistricts(e.currentTarget.value, searchIndex, 20));
    }
  };

  return (
    <div className={searchPageStyles.page}>
      <div className={searchPageStyles.searchWrap}>
        <input
          aria-label="검색어 입력"
          ref={inputRef}
          className={searchPageStyles.searchInput}
          placeholder="검색어 입력..."
          type="text"
          onKeyDown={onEnterSearch}
        />
      </div>
      {candidates && <CandidateList candidates={candidates} setgridCoord={setgridCoord} />}
      {gridCoord && (
        <div className={searchPageStyles.section}>
          <span>
            선택 좌표: nx {gridCoord.nx}, ny {gridCoord.ny}
          </span>
        </div>
      )}
    </div>
  );
}
