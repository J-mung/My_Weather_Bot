import { useLocationSearch } from "@/features/location-search/useLocationSearch";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon";
import { IconInput } from "@/shared/ui/input";
import { KakaoRegionMap } from "@/shared/ui/map";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  deleteRecentSearch,
  readRecentSearches,
  type RecentSearchItem,
} from "../lib/recent-searches";
import { CandidateList } from "./CandidateList";
import { searchPageStyles } from "./styles";

const MAP_ANIMATION_DURATION_MS = 300;

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

  const navigateToRecentSearch = (recent: RecentSearchItem) => {
    const searchParams = new URLSearchParams({
      location: recent.displayName,
      nx: String(recent.nx),
      ny: String(recent.ny),
    });

    navigate(`/?${searchParams.toString()}`);
  };

  const removeRecentSearch = (fullName: string) => {
    setRecentSearches(deleteRecentSearch(fullName));
  };

  const mapLocationLabel = candidates[0]?.item.displayName ?? "";
  const [renderedMapLocationLabel, setRenderedMapLocationLabel] = useState(mapLocationLabel);
  const [isMapVisible, setIsMapVisible] = useState(false);

  useEffect(() => {
    let animationFrameId: number | null = null;
    let motionTimeoutId: number | null = null;
    let unmountTimeoutId: number | null = null;

    if (mapLocationLabel) {
      motionTimeoutId = window.setTimeout(() => {
        setRenderedMapLocationLabel(mapLocationLabel);
        animationFrameId = window.requestAnimationFrame(() => {
          setIsMapVisible(true);
        });
      }, 0);
    } else {
      motionTimeoutId = window.setTimeout(() => {
        setIsMapVisible(false);
      }, 0);

      unmountTimeoutId = window.setTimeout(() => {
        setRenderedMapLocationLabel("");
      }, MAP_ANIMATION_DURATION_MS);
    }

    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
      if (motionTimeoutId !== null) {
        window.clearTimeout(motionTimeoutId);
      }
      if (unmountTimeoutId !== null) {
        window.clearTimeout(unmountTimeoutId);
      }
    };
  }, [mapLocationLabel]);

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
      {errorMessage && (
        <div className={cn(searchPageStyles.stackItem, searchPageStyles.section)}>
          {errorMessage}
        </div>
      )}
      {renderedMapLocationLabel && (
        <div
          className={cn(
            searchPageStyles.mapMotionSlot,
            isMapVisible
              ? searchPageStyles.mapMotionSlotOpen
              : searchPageStyles.mapMotionSlotClosed,
          )}
        >
          <KakaoRegionMap
            location={renderedMapLocationLabel}
            title={"Weather Map"}
            mapClassName={cn(searchPageStyles.mapCanvas)}
            showHeader={false}
          />
        </div>
      )}
      {candidates.length > 0 && (
        <section className={cn(searchPageStyles.stackItem, searchPageStyles.sectionGroup)}>
          <h2 className={cn(searchPageStyles.sectionTitle)}>Search Results</h2>
          <CandidateList candidates={candidates} input={input} selectDistrict={selectDistrict} />
        </section>
      )}
      {recentSearches.length > 0 && (
        <section className={cn(searchPageStyles.stackItem, searchPageStyles.sectionGroup)}>
          <h2 className={cn(searchPageStyles.sectionTitle)}>Recent Searches</h2>
          <div className={cn(searchPageStyles.recentList)}>
            {recentSearches.map((recent) => (
              <div key={recent.fullName} className={cn(searchPageStyles.recentItem)}>
                <button
                  type={"button"}
                  className={cn(searchPageStyles.recentNavigateButton)}
                  onClick={() => navigateToRecentSearch(recent)}
                >
                  <span className={cn(searchPageStyles.recentText)}>
                    <strong>{recent.displayName}</strong>
                    <span>{recent.fullName}</span>
                  </span>
                  <span className={cn(searchPageStyles.recentArrow)}>→</span>
                </button>
                <button
                  type={"button"}
                  className={cn(searchPageStyles.recentDeleteButton)}
                  aria-label={`${recent.displayName} 최근 검색 삭제`}
                  onClick={() => removeRecentSearch(recent.fullName)}
                >
                  <Icon name={"close"} size={"sm"} tone={"default"} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
