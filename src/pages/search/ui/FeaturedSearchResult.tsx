import type { GridCoord } from "@/entities/weather/model/weather.types";
import { useBookmarks } from "@/features/bookmark/model/useBookmarks";
import { isAppError } from "@/shared/api/types";
import { cn } from "@/shared/lib/cn";
import { toDisplayDistrictName } from "@/shared/lib/location-search.lib";
import type { DistrictSearchResult } from "@/shared/lib/location.types";
import { resolveGridCoordByRegion } from "@/shared/lib/resolveGridCoord";
import Button from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { Skeleton } from "@/shared/ui/skeleton";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { writeRecentSearch } from "../lib/recent-searches";
import { searchPageStyles } from "./styles";

const FeaturedSearchLocation = ({
  candidate,
  gridCoord,
}: {
  candidate: DistrictSearchResult;
  gridCoord: GridCoord;
}) => {
  const navigate = useNavigate();
  const { addBookmark, isBookmarked } = useBookmarks();
  const displayName = toDisplayDistrictName(candidate.item);
  const alreadyBookmarked = isBookmarked(displayName);

  const moveToMain = () => {
    writeRecentSearch({
      displayName,
      fullName: candidate.item.fullName,
      nx: gridCoord.nx,
      ny: gridCoord.ny,
    });
    const searchParams = new URLSearchParams({
      location: displayName,
      nx: String(gridCoord.nx),
      ny: String(gridCoord.ny),
    });
    navigate(`/?${searchParams.toString()}`);
  };

  const addToBookmark = () => {
    const result = addBookmark({ displayName, nx: gridCoord.nx, ny: gridCoord.ny });
    if (!result.success) {
      alert(result.message);
    }
  };

  return (
    <article className={cn(searchPageStyles.featuredCard)}>
      <button type={"button"} className={cn(searchPageStyles.featuredMain)} onClick={moveToMain}>
        <div className={cn(searchPageStyles.featuredText)}>
          <p className={cn(searchPageStyles.featuredLocation)}>{displayName}</p>
          <div className={cn(searchPageStyles.featuredWeatherRow)}>
            <strong className={cn(searchPageStyles.featuredTemperature)}>예보 보기</strong>
            <span className={cn(searchPageStyles.featuredCondition)}>
              선택하면 메인 화면에서 날씨와 옷차림 추천을 확인할 수 있어요.
            </span>
          </div>
          <p className={cn(searchPageStyles.featuredRange)}>{candidate.item.fullName}</p>
        </div>
        <Icon name={"search"} tone={"current"} className={cn(searchPageStyles.featuredIcon)} />
      </button>

      <div className={cn(searchPageStyles.featuredMetrics)}>
        <div className={cn(searchPageStyles.featuredMetric)}>
          <span className={cn(searchPageStyles.featuredMetricLabel)}>Forecast</span>
          <strong className={cn(searchPageStyles.featuredMetricValue)}>날씨 확인</strong>
        </div>
        <div className={cn(searchPageStyles.featuredMetric)}>
          <span className={cn(searchPageStyles.featuredMetricLabel)}>Bookmark</span>
          <strong className={cn(searchPageStyles.featuredMetricValue)}>
            {alreadyBookmarked ? "저장됨" : "저장 가능"}
          </strong>
        </div>
      </div>

      <Button
        type={"button"}
        variant={alreadyBookmarked ? "secondary" : "primary"}
        size={"lg"}
        className={cn(searchPageStyles.featuredBookmarkButton)}
        disabled={alreadyBookmarked}
        onClick={addToBookmark}
      >
        <Icon name={alreadyBookmarked ? "bookmark" : "bookmarkAdd"} />
        {alreadyBookmarked ? "Already in My Weather" : "Add to My Weather"}
      </Button>
    </article>
  );
};

export const FeaturedSearchResult = ({ candidate }: { candidate: DistrictSearchResult }) => {
  const [gridCoord, setGridCoord] = useState<GridCoord | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    const resolveGridCoord = async () => {
      try {
        setErrorMessage("");
        const nextGridCoord = await resolveGridCoordByRegion(candidate.item.fullName);
        if (!ignore) {
          setGridCoord(nextGridCoord);
        }
      } catch (error: unknown) {
        if (ignore) return;
        setGridCoord(null);
        setErrorMessage(
          isAppError(error)
            ? error.meta.description
            : "대표 검색 결과의 좌표를 확인하지 못했습니다.",
        );
      }
    };

    void resolveGridCoord();

    return () => {
      ignore = true;
    };
  }, [candidate.item.fullName]);

  if (errorMessage) {
    return <div className={cn(searchPageStyles.section)}>{errorMessage}</div>;
  }

  if (!gridCoord) {
    return (
      <div className={cn(searchPageStyles.featuredCard, searchPageStyles.featuredSkeleton)}>
        <Skeleton className={"h-6 w-48 bg-white/30"} />
        <Skeleton className={"mt-5 h-16 w-40 bg-white/30"} />
        <Skeleton className={"mt-5 h-10 w-full bg-white/30"} />
      </div>
    );
  }

  return <FeaturedSearchLocation candidate={candidate} gridCoord={gridCoord} />;
};
