import { useCurrentWeather } from "./useCurrentWeather";

export const CurrentWeatherTester = () => {
  const { data, isFetching, fetchByCurrentLocation } = useCurrentWeather();

  return (
    <>
      <button onClick={fetchByCurrentLocation}>조회하기</button>
      {isFetching && <div>Loading...</div>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </>
  );
};
