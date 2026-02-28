import { useCurrentTemperature } from "../model/useCurrentTemperature";

export const CurrentWeatherTester = () => {
  const { data, isFetching, refresh } = useCurrentTemperature();

  return (
    <>
      <button onClick={refresh}>조회하기</button>
      {isFetching && <div>Loading...</div>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </>
  );
};
