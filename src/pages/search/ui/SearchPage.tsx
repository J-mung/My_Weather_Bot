import { useLocationSearch } from "@/features/location-search/useLocationSearch";
import { useEffect, useRef, type ChangeEvent, type KeyboardEvent } from "react";
import { CandidateList } from "./CandidateList";
import { searchPageStyles } from "./styles";

export default function SearchPage() {
  const {
    input,
    candidates,
    errorMessage,
    setInput,
    runSearch,
    selectDistrict, // 내부 상태 동기화를 위해 호출
  } = useLocationSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    inputRef.current.focus();
  });

  const onChnageInput = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    setInput(e.currentTarget.value);
  };

  const onEnterSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      runSearch();
    }
  };

  return (
    <div className={searchPageStyles.page}>
      <div className={searchPageStyles.searchWrap}>
        <input
          aria-label="검색어 입력"
          className={searchPageStyles.searchInput}
          placeholder="검색어 입력..."
          type="text"
          ref={inputRef}
          value={input}
          onChange={onChnageInput}
          onKeyDown={onEnterSearch}
        />
      </div>
      {errorMessage && <div className={searchPageStyles.section}>{errorMessage}</div>}
      {candidates && <CandidateList candidates={candidates} selectDistrict={selectDistrict} />}
    </div>
  );
}
