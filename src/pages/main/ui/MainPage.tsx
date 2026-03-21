import { fetchRegionNameFromCoord } from "@/entities/kakao/api/fetchRegionNameFromCoord";
import type { GridCoord } from "@/entities/weather/model/weather.types";
import type { BookmarkItem } from "@/features/bookmark/model/types";
import { readBookmarkFromStorage } from "@/features/bookmark/model/useBookmarks";
import { useWeatherSummary } from "@/features/get-current-weather/model/useWeatherSummary";
import { cn } from "@/shared/lib/cn";
import { getUserLocation } from "@/shared/lib/userLocation";
import { Input } from "@/shared/ui/input/Input";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { buildDistrictDisplay } from "../lib/district-display.lib";
import { HourlyInfoCard } from "./HourlyInfoCard";
import { NowInfoCard } from "./NowInfoCard";
import { mainPageStyles } from "./styles";

export default function MainPage() {
  const routelocation = useLocation();
  const { param, displayDistrict, displayAlias } = useMemo((): {
    param: GridCoord;
    displayDistrict: string;
    displayAlias: string;
  } => {
    const queryParams = new URLSearchParams(routelocation.search);
    const queryLocation = queryParams.get("location") ?? "";
    const bookmarkId = queryParams.get("id");

    if (bookmarkId) {
      const bookmarkList: BookmarkItem[] = readBookmarkFromStorage();
      const bookmark = bookmarkList.find((_bookmark) => _bookmark.id === bookmarkId);

      if (bookmark) {
        return {
          param: { nx: bookmark.nx, ny: bookmark.ny },
          displayDistrict: bookmark.displayName,
          displayAlias: bookmark.alias?.trim() || bookmark.displayName,
        };
      }
    }

    return {
      param: {
        nx: Number(queryParams.get("nx")) || Number.POSITIVE_INFINITY,
        ny: Number(queryParams.get("ny")) || Number.POSITIVE_INFINITY,
      },
      displayDistrict: queryLocation,
      displayAlias: queryLocation,
    };
  }, [routelocation.search]);

  const { data, isLoading, isFetching, error, refresh } = useWeatherSummary(param);
  const navigate = useNavigate();
  const [currentRegionName, setCurrentRegionName] = useState("");
  const [currentRegionError, setCurrentRegionError] = useState("");

  useEffect(() => {
    if (displayDistrict) {
      return;
    }

    let ignore = false;

    const loadCurrentRegionName = async () => {
      try {
        const userLocation = await getUserLocation();
        const regionName = await fetchRegionNameFromCoord(userLocation);
        if (!ignore) {
          setCurrentRegionName(regionName);
          setCurrentRegionError("");
        }
      } catch (fetchError) {
        if (!ignore) {
          console.warn("현재 위치의 지역명을 불러오지 못했습니다.", fetchError);
          setCurrentRegionName("");
          setCurrentRegionError("현재 위치를 확인하지 못했습니다. 검색으로 지역을 선택해 주세요.");
        }
      }
    };

    void loadCurrentRegionName();

    return () => {
      ignore = true;
    };
  }, [displayDistrict]);

  const locationLabel = displayDistrict || currentRegionName;
  const aliasLabel = displayAlias || currentRegionName;
  const districtDisplay = buildDistrictDisplay({
    district: locationLabel || "알 수 없음",
    alias: aliasLabel || "",
  });

  return (
    <div className={cn(mainPageStyles.page)}>
      <div className={cn(mainPageStyles.searchWrap)}>
        <Input
          value={locationLabel}
          aria-label={"검색어 입력"}
          variant={"default"}
          placeholder={"검색어 입력..."}
          onClick={() => {
            navigate("/search", { replace: true });
          }}
          readOnly
        />
        {currentRegionError && !displayDistrict && (
          <p className={cn(mainPageStyles.searchStatus)}>{currentRegionError}</p>
        )}
      </div>
      <div className={cn(mainPageStyles.dailySummary)}>
        <div className={cn(mainPageStyles.section)}>
          <NowInfoCard
            primaryDistrict={districtDisplay.primaryDistrict}
            secondaryDistrict={districtDisplay.secondaryDistrict}
            fullDistrict={districtDisplay.fullDistrict}
            isAlias={districtDisplay.isAlias}
            data={data}
            isLoading={isLoading}
            isFetching={isFetching}
            error={error}
            refresh={refresh}
          />
        </div>
        <div className={cn(mainPageStyles.section)}>
          <h2 className={cn(mainPageStyles.sectionTitle)}>시간대별 날씨</h2>
          <HourlyInfoCard data={data} isFetching={isFetching} error={error} />
        </div>
      </div>
    </div>
  );
}
