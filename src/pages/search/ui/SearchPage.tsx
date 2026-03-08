import { useLocationSearch } from "@/features/location-search/useLocationSearch";
import { Input } from "@/shared/ui/input/Input";
import { useEffect, useRef, type KeyboardEvent } from "react";
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

  const onEnterSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      runSearch();
    }
  };

  return (
    <div className={searchPageStyles.page}>
      <div className={searchPageStyles.searchWrap}>
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          variant={errorMessage ? "error" : "default"}
          placeholder={"검색어 입력..."}
          aria-label={"검색어 입력..."}
          type={"text"}
          onKeyDown={onEnterSearch}
        />
      </div>
      {errorMessage && <div className={searchPageStyles.section}>{errorMessage}</div>}
      {candidates.length > 0 && (
        <CandidateList candidates={candidates} selectDistrict={selectDistrict} />
      )}
    </div>
  );
}
