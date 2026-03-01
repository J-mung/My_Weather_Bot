import type { GridCoord } from "@/entities/weather/model/weatherTypes";
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

  const onClickCandidate = (candidateFullName: string) => {
    const selected = candidates.find((_candidate) => _candidate.fullName === candidateFullName);
    if (!selected) return;

    const gridCoord = selectDistrict(selected);

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
        <div key={_candidate.fullName} className={searchPageStyles.section}>
          <div
            data-full-name={_candidate.fullName}
            onClick={() => onClickCandidate(_candidate.fullName)}
          >
            <span>{toDisplayDistrictName(_candidate)}</span>
          </div>
        </div>
      ))}
    </>
  );
};
