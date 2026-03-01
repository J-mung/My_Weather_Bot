import { useCurrentTemperature } from "@/features/get-current-weather/model/useCurrentTemperature";
import { useLocation, useNavigate } from "react-router-dom";
import { HourlyInfoCard } from "./HourlyInfoCard";
import { NowInfoCard } from "./NowInfoCard";
import { mainPageStyles } from "./styles";

export default function MainPage() {
  const routelocation = useLocation();
  const queryParams = new URLSearchParams(routelocation.search);
  const param = {
    nx: Number(queryParams.get("nx")) || Number.POSITIVE_INFINITY,
    ny: Number(queryParams.get("ny")) || Number.POSITIVE_INFINITY,
  };
  const location = queryParams.get("location");

  const { data, isFetching, error } = useCurrentTemperature(param);
  const navigate = useNavigate();

  return (
    <div className={mainPageStyles.page}>
      <div className={mainPageStyles.searchWrap}>
        <input
          aria-label="검색어 입력"
          className={mainPageStyles.searchInput}
          placeholder="검색어 입력..."
          type="text"
          readOnly
          value={location ?? ""}
          onClick={() => {
            navigate("/search", { replace: true });
          }}
        />
      </div>
      <section className={mainPageStyles.dailySummary}>
        <section className={mainPageStyles.section}>
          <h2 className={mainPageStyles.sectionTitle}>기온 요약</h2>
          <NowInfoCard data={data} isFetching={isFetching} error={error} />
        </section>
        <section className={mainPageStyles.section}>
          <h2 className={mainPageStyles.sectionTitle}>시간대별 날씨</h2>
          <HourlyInfoCard data={data} isFetching={isFetching} error={error} />
        </section>
      </section>
    </div>
  );
}
