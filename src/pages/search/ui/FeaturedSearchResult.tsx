import type { GridCoord, WeatherCondition } from "@/entities/weather/model/weather.types";
import { useBookmarks } from "@/features/bookmark/model/useBookmarks";
import { useWeatherSummary } from "@/features/get-current-weather/model/useWeatherSummary";
import { isAppError } from "@/shared/api/types";
import { cn } from "@/shared/lib/cn";
import { toDisplayDistrictName } from "@/shared/lib/location-search.lib";
import type { DistrictSearchResult } from "@/shared/lib/location.types";
import { resolveGridCoordByRegion } from "@/shared/lib/resolveGridCoord";
import Button from "@/shared/ui/button";
import { Icon, type IconName } from "@/shared/ui/icon";
import { Skeleton } from "@/shared/ui/skeleton";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { writeRecentSearch } from "../lib/recent-searches";
import { searchPageStyles } from "./styles";

const WEATHER_ICON_MAP: Record<WeatherCondition, IconName> = {
  sunny: "wbSunny",
  mostlyCloudy: "partlyCloudyDay",
  unavailable: "cloudAlert",
  cloudy: "cloud",
  rain: "rainy",
  rainSnow: "weatherMix",
  snow: "weatherSnowy",
  drizzle: "rainyLight",
  drizzleSnow: "weatherMix",
  snowFlurry: "snowing",
};

const formatTemperature = (value: number | null): string => {
  if (value === null) return "--°";
  return `${value}°`;
};

const FeaturedSearchWeather = ({
  candidate,
  gridCoord,
}: {
  candidate: DistrictSearchResult;
  gridCoord: GridCoord;
}) => {
  const navigate = useNavigate();
  const { addBookmark, isBookmarked } = useBookmarks();
  const { data, isLoading, isFetching } = useWeatherSummary(gridCoord);
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
    <article
      className={cn(searchPageStyles.featuredCard, isFetching && searchPageStyles.featuredFetching)}
    >
      <button type={"button"} className={cn(searchPageStyles.featuredMain)} onClick={moveToMain}>
        <div className={cn(searchPageStyles.featuredText)}>
          <p className={cn(searchPageStyles.featuredLocation)}>{displayName}</p>
          <div className={cn(searchPageStyles.featuredWeatherRow)}>
            {isLoading ? (
              <Skeleton className={"h-16 w-32 bg-white/30"} />
            ) : (
              <strong className={cn(searchPageStyles.featuredTemperature)}>
                {formatTemperature(data?.now.temperature ?? null)}
              </strong>
            )}
            <span className={cn(searchPageStyles.featuredCondition)}>
              {data?.outfitRecommendation.summary ?? "날씨 요약을 불러오는 중이에요."}
            </span>
          </div>
          <p className={cn(searchPageStyles.featuredRange)}>
            H: {data?.todayMax ?? "--"}° · L: {data?.todayMin ?? "--"}° · Feels like{" "}
            {data?.now.feelsLike ?? "--"}°
          </p>
        </div>
        <Icon
          name={WEATHER_ICON_MAP[data?.now.condition ?? "unavailable"]}
          tone={"current"}
          className={cn(searchPageStyles.featuredIcon)}
        />
      </button>

      <div className={cn(searchPageStyles.featuredMetrics)}>
        <div className={cn(searchPageStyles.featuredMetric)}>
          <span className={cn(searchPageStyles.featuredMetricLabel)}>Humidity</span>
          <strong className={cn(searchPageStyles.featuredMetricValue)}>
            {data?.now.humidity ?? "--"}%
          </strong>
        </div>
        <div className={cn(searchPageStyles.featuredMetric)}>
          <span className={cn(searchPageStyles.featuredMetricLabel)}>Rain</span>
          <strong className={cn(searchPageStyles.featuredMetricValue)}>
            {data?.precipitation.probability ?? "--"}%
          </strong>
        </div>
        <div className={cn(searchPageStyles.featuredMetric)}>
          <span className={cn(searchPageStyles.featuredMetricLabel)}>Wind</span>
          <strong className={cn(searchPageStyles.featuredMetricValue)}>
            {data?.now.windSpeedMs ?? "--"} m/s
          </strong>
        </div>
        <div className={cn(searchPageStyles.featuredMetric)}>
          <span className={cn(searchPageStyles.featuredMetricLabel)}>Outfit</span>
          <strong className={cn(searchPageStyles.featuredMetricValue)}>
            {data?.outfitRecommendation.items[0] ?? "추천 준비 중"}
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

  return <FeaturedSearchWeather candidate={candidate} gridCoord={gridCoord} />;
};
