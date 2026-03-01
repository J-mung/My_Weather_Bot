import { useCurrentTemperature } from "@/features/get-current-weather/model/useCurrentTemperature";
import { NowInfoCard } from "./NowInfoCard";
import { mainPageStyles } from "./styles";

export default function MainPage() {
  const { data, isFetching, error } = useCurrentTemperature();

  return (
    <div className={mainPageStyles.page}>
      <div className={mainPageStyles.searchWrap}>
        <input
          aria-label="검색어 입력"
          className={mainPageStyles.searchInput}
          placeholder="검색어 입력..."
          type="text"
        />
      </div>
      <section className={mainPageStyles.dailySummary}>
        <p className={"text-m font-semibold"}>Seoul, South Korea</p>
        <section className={mainPageStyles.section}>
          <h2 className={mainPageStyles.sectionTitle}>기온 요약</h2>
          <NowInfoCard data={data} isFetching={isFetching} error={error} />
        </section>
      </section>
    </div>
  );
}
