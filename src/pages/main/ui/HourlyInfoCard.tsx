import type { SummaryDomain } from "@/entities/weather/model/weatherTypes";

export const HourlyInfoCard = ({
  data,
  isFetching,
  error,
}: {
  data: SummaryDomain | null;
  isFetching: boolean;
  error: Error | null;
}) => {
  const hourly = data?.hourly;
  return (
    <div>
      {isFetching && <div>Loading...</div>}
      {hourly &&
        hourly.map((_hour, idx) => (
          <div key={idx}>
            <span>시간: {_hour.time}</span>
            <br />
            <span>온도: {_hour.temp}</span>
            <br />
          </div>
        ))}
      {error && <div>{error.message}</div>}
    </div>
  );
};
