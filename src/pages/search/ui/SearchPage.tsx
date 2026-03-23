import { useLocationSearch } from "@/features/location-search/useLocationSearch";
import { cn } from "@/shared/lib/cn";
import { IconInput } from "@/shared/ui/input";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { CandidateList } from "./CandidateList";
import { searchPageStyles } from "./styles";

export default function SearchPage() {
  const {
    input,
    candidates,
    errorMessage,
    setInput,
    selectDistrict, // 내부 상태 동기화를 위해 호출
  } = useLocationSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const routerLocation = useLocation();

  useEffect(() => {
    if (!inputRef.current) return;

    inputRef.current.focus();

    const queryParams = new URLSearchParams(routerLocation.search);
    const queryLocation = queryParams.get("location") ?? "";
    if (queryLocation !== "") {
      setInput(queryLocation);
    }
  }, [routerLocation.search, setInput]);

  return (
    <div className={cn(searchPageStyles.page)}>
      <div className={cn(searchPageStyles.searchWrap)}>
        <IconInput
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          variant={errorMessage ? "error" : "default"}
          placeholder={"검색어 입력..."}
          aria-label={"검색어 입력..."}
          type={"text"}
          onCallback={() => setInput("")}
          showIconButton={true}
          iconName={"close"}
          iconTone={"default"}
          iconSize={"md"}
          disabled={false}
        />
      </div>
      {errorMessage && <div className={cn(searchPageStyles.section)}>{errorMessage}</div>}
      {candidates.length > 0 && (
        <CandidateList candidates={candidates} input={input} selectDistrict={selectDistrict} />
      )}
    </div>
  );
}
