import { useShortFcstWeather } from "@/features/get-current-weather/useShortFcstWeather";

export const ShortFcstWeatherTester = () => {
  const { data, isFetching, fetchShortFcstWeather } = useShortFcstWeather();

  return (
    <>
      <div>
        <button onClick={fetchShortFcstWeather}>조회하기</button>
        {isFetching && <div>Loading...</div>}
        {data && <div>{JSON.stringify(data, null, 2)}</div>}
      </div>
    </>
  );
};
