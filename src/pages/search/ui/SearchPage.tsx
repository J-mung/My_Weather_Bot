import { useLocationSearch } from "@/features/location-search/useLocationSearch";
import { cn } from "@/shared/lib/cn";
import { IconInput } from "@/shared/ui/input";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { readRecentSearches, type RecentSearchItem } from "../lib/recent-searches";
import { CandidateList } from "./CandidateList";
import { FeaturedSearchResult } from "./FeaturedSearchResult";
import { searchPageStyles } from "./styles";
import { useState } from "react";

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
  const navigate = useNavigate();
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>(() =>
    readRecentSearches(),
  );

  useEffect(() => {
    if (!inputRef.current) return;

    inputRef.current.focus();

    const queryParams = new URLSearchParams(routerLocation.search);
    const queryLocation = queryParams.get("location") ?? "";
    if (queryLocation !== "") {
      setInput(queryLocation);
    }
  }, [routerLocation.search, setInput]);

  useEffect(() => {
    const syncRecentSearches = () => {
      setRecentSearches(readRecentSearches());
    };

    window.addEventListener("focus", syncRecentSearches);
    window.addEventListener("storage", syncRecentSearches);

    return () => {
      window.removeEventListener("focus", syncRecentSearches);
      window.removeEventListener("storage", syncRecentSearches);
    };
  }, []);

  const featuredCandidate =
    candidates.find((candidate) => candidate.item.fullName !== candidate.item.displayName) ??
    candidates[0] ??
    null;

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
      {featuredCandidate && (
        <section className={cn(searchPageStyles.sectionGroup)}>
          <h2 className={cn(searchPageStyles.sectionTitle)}>Featured Result</h2>
          <FeaturedSearchResult candidate={featuredCandidate} />
        </section>
      )}
      {candidates.length > 0 && (
        <section className={cn(searchPageStyles.sectionGroup)}>
          <h2 className={cn(searchPageStyles.sectionTitle)}>Search Results</h2>
          <CandidateList candidates={candidates} input={input} selectDistrict={selectDistrict} />
        </section>
      )}
      {recentSearches.length > 0 && (
        <section className={cn(searchPageStyles.sectionGroup)}>
          <h2 className={cn(searchPageStyles.sectionTitle)}>Recent Searches</h2>
          <div className={cn(searchPageStyles.recentList)}>
            {recentSearches.map((recent) => (
              <button
                key={recent.fullName}
                type={"button"}
                className={cn(searchPageStyles.recentItem)}
                onClick={() => {
                  const searchParams = new URLSearchParams({
                    location: recent.displayName,
                    nx: String(recent.nx),
                    ny: String(recent.ny),
                  });
                  navigate(`/?${searchParams.toString()}`);
                }}
              >
                <span className={cn(searchPageStyles.recentText)}>
                  <strong>{recent.displayName}</strong>
                  <span>{recent.fullName}</span>
                </span>
                <span className={cn(searchPageStyles.recentArrow)}>→</span>
              </button>
            ))}
          </div>
        </section>
      )}
      <button type={"button"} className={cn(searchPageStyles.mapCtaCard)}>
        <span className={cn(searchPageStyles.mapTexture)} />
        <span className={cn(searchPageStyles.mapButton)}>View on Map</span>
      </button>
    </div>
  );
}
