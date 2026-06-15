import { useCurrentLocationRegion } from "@/features/location-current/model";
import { useBookmarks } from "@/features/bookmark/model/useBookmarks";
import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookmarkCardList } from "./card/BookmarkCardList";
import { CurrentLocationErrorCard } from "./CurrentLocationErrorCard";
import { CurrentLocationForecastCard } from "./CurrentLocationForecastCard";
import { CurrentLocationSkeletonCard } from "./CurrentLocationSkeletonCard";
import { bookmarkPageStyles } from "./styles";

export default function BookmarkPage() {
  const { bookmarkList, isFull, deleteBookmark, updateAlias, remainingList, totalBookmarkList } =
    useBookmarks();
  const navigate = useNavigate();
  const [isManageMode, setIsManageMode] = useState(false);
  const currentLocation = useCurrentLocationRegion({
    promptBeforeRequest: false,
    showDialogOnError: false,
  });

  return (
    <div className={cn(bookmarkPageStyles.page)}>
      <section className={cn(bookmarkPageStyles.hero)}>
        <div className={cn(bookmarkPageStyles.heroText)}>
          <p className={cn(bookmarkPageStyles.eyebrow)}>내 지역</p>
          <h1 className={cn(bookmarkPageStyles.title)}>즐겨찾기 관리</h1>
          <p className={cn(bookmarkPageStyles.description)}>
            자주 확인하는 지역을 저장하고 메인 날씨 화면으로 빠르게 이동하세요.
          </p>
        </div>
        <div className={cn(bookmarkPageStyles.actionList)}>
          <Button
            type={"button"}
            variant={"secondary"}
            size={"md"}
            className={cn(bookmarkPageStyles.actionButton)}
            onClick={() => {
              setIsManageMode((prev) => !prev);
            }}
          >
            <Icon name={"edit"} />
            {isManageMode ? "완료" : "목록 편집"}
          </Button>
          <Button
            type={"button"}
            variant={"primary"}
            size={"md"}
            className={cn(bookmarkPageStyles.actionButton)}
            onClick={() => {
              navigate("/search");
            }}
          >
            <Icon name={"addCircle"} />
            새 지역 추가
          </Button>
        </div>
      </section>

      <div className={cn(bookmarkPageStyles.remainSlotWrap)}>
        <span className={cn(bookmarkPageStyles.remainSlotContent)}>
          북마크 {remainingList} / {totalBookmarkList}
        </span>
        {isFull ? (
          <span className={cn(bookmarkPageStyles.remainSlotContent)}>
            북마크는 최대 6개까지 가능합니다.
          </span>
        ) : (
          <span className={cn(bookmarkPageStyles.remainSlotHint)}>
            {totalBookmarkList - remainingList}개 더 추가할 수 있어요.
          </span>
        )}
      </div>

      {currentLocation.status === "success" && currentLocation.gridCoord ? (
        <CurrentLocationForecastCard
          regionName={currentLocation.regionName}
          gridCoord={currentLocation.gridCoord}
        />
      ) : currentLocation.status === "error" && currentLocation.errorMeta ? (
        <CurrentLocationErrorCard errorMeta={currentLocation.errorMeta} />
      ) : (
        <CurrentLocationSkeletonCard />
      )}

      <BookmarkCardList
        key={isManageMode ? "manage" : "view"}
        bookmarkList={bookmarkList}
        isFull={isFull}
        isManageMode={isManageMode}
        deleteBookmark={deleteBookmark}
        updateAlias={updateAlias}
        onAddBookmark={() => {
          navigate("/search");
        }}
      />

      <button
        type={"button"}
        className={cn(bookmarkPageStyles.manageAlertsCard)}
        onClick={() => {
          navigate("/search");
        }}
      >
        <span className={cn(bookmarkPageStyles.manageAlertsIcon)}>
          <Icon name={"cloudAlert"} />
        </span>
        <span className={cn(bookmarkPageStyles.manageAlertsText)}>
          <strong>알림 관리</strong>
          <span>알림 기능은 이후 단계에서 연결할 예정이에요.</span>
        </span>
        <Icon name={"arrowUp"} className={cn(bookmarkPageStyles.manageAlertsArrow)} />
      </button>
    </div>
  );
}
