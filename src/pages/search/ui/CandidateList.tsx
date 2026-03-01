import type { GridCoord } from "@/entities/weather/model/weatherTypes";
import { getGridCoordByDistrictName } from "@/shared/lib/locationGridCoord";
import { toDisplayDistrictName, type DistrictSearchItem } from "@/shared/lib/locationSearch";
import type { Dispatch, MouseEvent, SetStateAction } from "react";
import { searchPageStyles } from "./styles";

export const CandidateList = ({
  candidates,
  setgridCoord,
}: {
  candidates: DistrictSearchItem[];
  setgridCoord: Dispatch<SetStateAction<GridCoord | null>>;
}) => {
  const onClickHandler = (e: MouseEvent<HTMLDivElement>) => {
    const fullName = e.currentTarget.dataset.fullName;
    if (!fullName) return;

    setgridCoord(getGridCoordByDistrictName(fullName));
  };
  return (
    <div className={searchPageStyles.section}>
      {candidates.length === 0 && <span>일치하는 검색 결과가 없습니다. 다시 입력해 주세요.</span>}
      {candidates.map((_candidate) => (
        <div
          key={_candidate.fullName}
          data-full-name={_candidate.fullName}
          onClick={onClickHandler}
        >
          <span>{toDisplayDistrictName(_candidate)}</span>
        </div>
      ))}
    </div>
  );
};
