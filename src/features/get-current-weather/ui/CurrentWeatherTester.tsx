import { useCurrentWeather } from "@/features/get-current-weather/useCurrentWeather";

export const CurrentWeatherTester = () => {
  const { data, isFetching, fetchByCurrentWeather } = useCurrentWeather();

  return (
    <>
      <button onClick={fetchByCurrentWeather}>조회하기</button>
      {isFetching && <div>Loading...</div>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </>
  );
};
