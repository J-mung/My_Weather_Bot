import type { SummaryDomain } from "@/entities/weather/model/weatherTypes";

export const NowInfoCard = ({
  data,
  isFetching,
  error,
}: {
  data: SummaryDomain | null;
  isFetching: boolean;
  error: Error | null;
}) => {
  return (
    <div className={"container"}>
      {isFetching && <div>Loading...</div>}
      {data && (
        <>
          <div className={"content-current"}>
            <span>현재기온: </span>
            <span>{data.current}</span>
          </div>
          <div className={"content-min"}>
            <span>최저기온: </span>
            <span>{data.todayMin}</span>
          </div>
          <div className={"content-max"}>
            <span>최고기온: </span>
            <span>{data.todayMax}</span>
          </div>
        </>
      )}
      {error && (
        <div>
          <span>{error.message}</span>
        </div>
      )}
    </div>
  );
};
