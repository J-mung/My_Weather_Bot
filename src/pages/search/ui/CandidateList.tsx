import type { GridCoord } from "@/entities/weather/model/weatherTypes";
import { useBookmarks } from "@/features/bookmark/model/useBookmarks";
import { toDisplayDistrictName } from "@/shared/lib/locationSearch";
import type { DistrictSearchItem } from "@/shared/lib/locationTypes";
import { useNavigate } from "react-router-dom";
import { searchPageStyles } from "./styles";

export const CandidateList = ({
  candidates,
  selectDistrict,
}: {
  candidates: DistrictSearchItem[];
  selectDistrict: (district: DistrictSearchItem) => GridCoord | null;
}) => {
  const navigate = useNavigate();
  const { addBookmark, deleteBookmark, isBookmarked, getBookmarkedId } = useBookmarks();

  const getSelected = (candidateFullName: string): DistrictSearchItem | null => {
    return candidates.find((_candidate) => _candidate.fullName === candidateFullName) ?? null;
  };
  const getGridCoordFromSelected = (selected: DistrictSearchItem): GridCoord | null => {
    return selectDistrict(selected);
  };
  const onClickCandidate = (candidateFullName: string) => {
    const selected = getSelected(candidateFullName);
    if (!selected) {
      alert("선택된 장소의 정보에 오류가 있습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    const gridCoord = getGridCoordFromSelected(selected);
    if (!gridCoord) {
      alert("해당 장소의 정보가 제공되지 않습니다.");
      return;
    }

    const locationQuery = encodeURIComponent(toDisplayDistrictName(selected));
    navigate(`/?nx=${gridCoord.nx}&ny=${gridCoord.ny}&location=${locationQuery}`);
  };
  return (
    <>
      {candidates.map((_candidate) => (
        <div
          key={_candidate.fullName}
          className={searchPageStyles.candidate}
          onClick={() => onClickCandidate(_candidate.fullName)}
        >
          <div className={searchPageStyles.candidateContent} data-full-name={_candidate.fullName}>
            <span className={searchPageStyles.candidateName}>
              {toDisplayDistrictName(_candidate)}
            </span>
          </div>
          {isBookmarked(toDisplayDistrictName(_candidate)) === true ? (
            <button
              type="button"
              className={`${searchPageStyles.candidateButtonBase} ${searchPageStyles.candidateButtonActive}`}
              onClick={(e) => {
                e.stopPropagation();
                const bookmarkId = getBookmarkedId(toDisplayDistrictName(_candidate));
                if (!bookmarkId) {
                  alert("삭제 도중 오류가 발생 했습니다. 잠시 후 다시 시도해 주세요.");
                  return;
                }
                deleteBookmark(bookmarkId);
              }}
            >
              <span>★</span>
            </button>
          ) : (
            <button
              type="button"
              className={`${searchPageStyles.candidateButtonBase} ${searchPageStyles.candidateButtonInactive}`}
              onClick={(e) => {
                e.stopPropagation();
                const selected = getSelected(_candidate.fullName);
                if (!selected) {
                  alert("선택된 장소의 정보에 오류가 있습니다. 잠시 후 다시 시도해 주세요.");
                  return;
                }

                const gridCoord = getGridCoordFromSelected(selected);
                if (!gridCoord) {
                  alert("해당 장소의 정보가 제공되지 않습니다.");
                  return;
                }

                const result = addBookmark({
                  displayName: toDisplayDistrictName(_candidate),
                  nx: gridCoord.nx,
                  ny: gridCoord.ny,
                });
                if (!result.success) {
                  alert(result.message);
                }
              }}
            >
              <span>☆</span>
            </button>
          )}
        </div>
      ))}
    </>
  );
};
