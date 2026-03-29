import type { GridCoord } from "@/entities/weather/model/weather.types";
import { useBookmarks } from "@/features/bookmark/model/useBookmarks";
import { cn } from "@/shared/lib/cn";
import {
  buildDisplayHighlightParts,
  toDisplayDistrictName,
} from "@/shared/lib/location-search.lib";
import type { DistrictSearchItem, DistrictSearchResult } from "@/shared/lib/location.types";
import { Button } from "@/shared/ui/button/Button";
import { Icon } from "@/shared/ui/icon";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { searchPageStyles } from "./styles";

export const CandidateList = ({
  candidates,
  input,
  selectDistrict,
}: {
  candidates: DistrictSearchResult[];
  input: string;
  selectDistrict: (district: DistrictSearchItem) => Promise<GridCoord | null>;
}) => {
  const navigate = useNavigate();
  const { addBookmark, deleteBookmark, isBookmarked, getBookmarkedId } = useBookmarks();

  const getSelected = (candidateFullName: string): DistrictSearchResult | null => {
    return candidates.find((_candidate) => _candidate.item.fullName === candidateFullName) ?? null;
  };

  const getGridCoordFromSelected = async (
    selected: DistrictSearchItem,
  ): Promise<GridCoord | null> => {
    return await selectDistrict(selected);
  };

  const onClickCandidate = async (candidateFullName: string) => {
    const selected = getSelected(candidateFullName);
    if (!selected) {
      return;
    }

    const gridCoord = await getGridCoordFromSelected(selected.item);
    if (!gridCoord) {
      return;
    }

    const locationQuery = encodeURIComponent(toDisplayDistrictName(selected.item));
    navigate(`/?nx=${gridCoord.nx}&ny=${gridCoord.ny}&location=${locationQuery}`);
  };

  const onClickAddBookmark = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    candidate: DistrictSearchItem,
  ) => {
    e.stopPropagation();
    const selected = getSelected(candidate.fullName);

    if (!selected) {
      alert("선택된 장소의 정보에 오류가 있습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    const gridCoord = await getGridCoordFromSelected(selected.item);
    if (!gridCoord) {
      alert("해당 장소의 기상 정보가 제공되지 않습니다.");
      return;
    }

    const result = addBookmark({
      displayName: toDisplayDistrictName(candidate),
      nx: gridCoord.nx,
      ny: gridCoord.ny,
    });
    if (!result.success) {
      alert(result.message);
    }
  };

  const onClickDeleteBookmark = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    candidate: DistrictSearchItem,
  ) => {
    e.stopPropagation();
    const id = getBookmarkedId(toDisplayDistrictName(candidate));
    if (!id) {
      alert("삭제 도중 오류가 발생 했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    deleteBookmark(id);
  };

  const highlightText = (candidate: DistrictSearchResult): ReactNode => {
    const parts = buildDisplayHighlightParts(candidate.item.displayName, input);

    return (
      <>
        {parts.map((part, idx) => (
          <span
            key={`${candidate.item.fullName}-${idx}`}
            className={
              part.matched
                ? cn(searchPageStyles.candidateHighlight)
                : cn(searchPageStyles.candidateName)
            }
          >
            {part.text}
          </span>
        ))}
      </>
    );
  };

  return (
    <>
      {candidates.map((_candidate) => (
        <div
          key={_candidate.item.fullName}
          className={cn(searchPageStyles.candidate)}
          onClick={() => onClickCandidate(_candidate.item.fullName)}
        >
          <div
            className={cn(searchPageStyles.candidateContent)}
            data-full-name={_candidate.item.fullName}
          >
            {highlightText(_candidate)}
          </div>
          {isBookmarked(toDisplayDistrictName(_candidate.item)) === true ? (
            <Button
              type={"button"}
              variant={"primary"}
              title={"북마크 삭제"}
              onClick={(e) => {
                onClickDeleteBookmark(e, _candidate.item);
              }}
            >
              <Icon name={"bookmark"} size={"lg"} />
            </Button>
          ) : (
            <Button
              type={"button"}
              variant={"secondary"}
              title={"북마크 추가"}
              onClick={(e) => {
                onClickAddBookmark(e, _candidate.item);
              }}
            >
              <Icon name={"bookmarkAdd"} size={"lg"} tone={"brand"} />
            </Button>
          )}
        </div>
      ))}
    </>
  );
};
