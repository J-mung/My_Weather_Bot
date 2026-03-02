import type { GridCoord } from "@/entities/weather/model/weatherTypes";
import type { BookmarkItem } from "@/features/bookmark/model/types";
import { readBookmarkFromStorage } from "@/features/bookmark/model/useBookmarks";
import { useCurrentTemperature } from "@/features/get-current-weather/model/useCurrentTemperature";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

  const { data, isFetching, error } = useCurrentTemperature(param);
  const navigate = useNavigate();

  return (
    <div className={mainPageStyles.page}>
      <div className={mainPageStyles.searchWrap}>
        <input
          id="districtSearch"
          aria-label="검색어 입력"
          className={mainPageStyles.searchInput}
          placeholder="검색어 입력..."
          type="text"
          readOnly
          value={displayDistrict}
          onClick={() => {
            navigate("/search", { replace: true });
          }}
        />
      </div>
      <div className={mainPageStyles.dailySummary}>
        <h1 className={"text-xl font-bold mb-3"}>{displayAlias}</h1>
        <div className={mainPageStyles.section}>
          <h2 className={mainPageStyles.sectionTitle}>기온 요약</h2>
          <NowInfoCard data={data} isFetching={isFetching} error={error} />
        </div>
        <div className={mainPageStyles.section}>
          <h2 className={mainPageStyles.sectionTitle}>시간대별 날씨</h2>
          <HourlyInfoCard data={data} isFetching={isFetching} error={error} />
        </div>
      </div>
    </div>
  );
}
