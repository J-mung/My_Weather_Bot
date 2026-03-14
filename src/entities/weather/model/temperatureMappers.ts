import type {
  ShortFcstItemType,
  ShortFcstResponseType,
  UltraFcstResponseType,
  UltraNowResponseType,
} from "@/entities/weather/api/weather-api.types";
import type { TemperatureSummary } from "@/entities/weather/model/weather.types";
import { mapPtyToCondition, mapSkyToCondition } from "@/entities/weather/model/weatherCondition";
/**
 *
 * @param yyyymmdd
 * @param hhmm
 * @returns
 */
const parseDateTime = (yyyymmdd: string, hhmm: string): Date | null => {
  if (yyyymmdd.length !== 8 || hhmm.length !== 4) {
    return null;
  }

  const year = Number(yyyymmdd.slice(0, 4));
  const month = Number(yyyymmdd.slice(4, 6));
  const day = Number(yyyymmdd.slice(6, 8));
  const hour = Number(hhmm.slice(0, 2));
  const minute = Number(hhmm.slice(2, 4));

  const isInvalid =
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute);

  if (isInvalid) {
    return null;
  }

  return new Date(year, month - 1, day, hour, minute);
};

const formatHourLabel = (yyyymmdd: string, hhmm: string): string => {
  if (yyyymmdd.length !== 8 || hhmm.length !== 4) {
    return `${yyyymmdd} ${hhmm}`;
  }

  const mm = yyyymmdd.slice(4, 6);
  const dd = yyyymmdd.slice(6, 8);
  const hour = hhmm.slice(0, 2);
  const minute = hhmm.slice(2, 4);

  return `${mm}/${dd} ${hour}:${minute}`;
};

const toNumber = (value: string | undefined, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/**
 * 초단기예보에서 특정 카테고리(SKY, PTY)의 값 중
 * 현재 시각 이후와 가장 가까운 예보값을 반환
 *
 * 현재 기상상태 판단 시에는 강수형태(PTY)를 우선 확인하고,
 * 강수형태가 없을 때만 하늘상태(SKY)를 사용
 *
 * 이 함수는 우선순위를 결정하지 않고
 * 전달받은 category에 해당하는 가장 가까운 예보값만 찾는 보조 함수
 * @param forecast
 * @param category
 * @param observationDT
 * @returns
 */
const getNearestForecastValue = (
  forecast: UltraFcstResponseType,
  category: "SKY" | "PTY",
  observationDT: Date,
): number | null => {
  const candidates = forecast.response.body.items.item
    .filter((_item) => _item.category === category)
    .map((_item) => ({
      date: parseDateTime(_item.fcstDate, _item.fcstTime),
      value: toNumber(_item.fcstValue, 0),
    }))
    .filter((_item) => _item.date !== null)
    .sort((a, b) => a.date!.getTime() - b.date!.getTime());

  const nearest =
    candidates.find((_item) => _item.date!.getTime() >= observationDT.getTime()) ?? candidates[0];

  return nearest ? nearest.value : null;
};

const formatYmd = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
};

/**
 * 현재 기온/습도 반환
 * @param now API 응답
 * @returns
 */
export const getCurrentTemperature = (
  now: UltraNowResponseType,
): { temperature: number; humidity: number } => {
  const items = now.response.body.items.item;
  const t1h = items.find((_item) => _item.category === "T1H");
  const reh = items.find((_item) => _item.category === "REH");
  return {
    temperature: toNumber(t1h?.obsrValue, 0),
    humidity: toNumber(reh?.obsrValue, 0),
  }; // 값이 없을 때는 0 fallback
};

/**
 * 현재(API 요청) 시각 반환
 * @param now API 응답
 * @returns
 */
export const getObservationDateTime = (now: UltraNowResponseType): Date | null => {
  const first = now.response.body.items.item[0];

  if (!first) {
    return null;
  }

  return parseDateTime(first.baseDate, first.baseTime);
};

/**
 * 현재 기상 상태 반환
 * - 강수 상태를 우선적으로 사용(초단기실황, 초단기예보)
 * - 강수 상태가 없으면 하늘 상태를 사용(초단기예보)
 */
export const getCurrentCondition = (
  now: UltraNowResponseType,
  ultraForecast: UltraFcstResponseType,
  observationDT: Date = new Date(),
) => {
  // 실황에 강수 정보가 있으면 가장 우선한다.
  const currentPty = toNumber(
    now.response.body.items.item.find((_item) => _item.category === "PTY")?.obsrValue,
    0,
  );

  if (currentPty !== 0) {
    return mapPtyToCondition(currentPty);
  }

  // 실황에 강수 정보가 없으면 가장 가까운 초단기예보 강수 정보를 사용한다.
  const forecastPty = getNearestForecastValue(ultraForecast, "PTY", observationDT) ?? 0;

  if (forecastPty !== 0) {
    return mapPtyToCondition(forecastPty);
  }

  // 강수 정보가 모두 없을 때만 하늘 상태를 사용한다.
  const sky = getNearestForecastValue(ultraForecast, "SKY", observationDT);

  if (sky === null) {
    // SKY도 없으면 현재 상태를 확정할 수 없으므로 중립 상태를 반환한다.
    return "unavailable";
  }

  return mapSkyToCondition(sky);
};

/**
 * 단기예보 데이터 반환
 *    - 당일 최저/최고 기온
 *    - 시간대별 데이터: 현재(API 요청) 시각 기준으로 시간별로 반환
 * @param short
 * @param observationDT
 * @returns
 */
export const getTemperatureSummary = (
  short: ShortFcstResponseType,
  observationDT: Date = new Date(),
  shortForDailyExtreme?: ShortFcstResponseType,
): TemperatureSummary => {
  const items = short.response.body.items.item;
  const extremeItems = shortForDailyExtreme?.response.body.items.item ?? items;
  const targetDate = formatYmd(observationDT);

  // 현재(API 요청) 시각 구하기
  const end = new Date(observationDT.getTime() + 24 * 60 * 60 * 1000);
  const tmpItems: ShortFcstItemType[] = items.filter((_item) => _item.category === "TMP");

  // 현재(API 요청) 시각 기준 24시간 TMP 데이터
  const hourly = tmpItems
    .map((_temp) => ({
      date: parseDateTime(_temp.fcstDate, _temp.fcstTime),
      time: formatHourLabel(_temp.fcstDate, _temp.fcstTime),
      temp: toNumber(_temp.fcstValue, 0),
      fcstDate: _temp.fcstDate,
    }))
    .filter((_item) => _item.date !== null && _item.date >= observationDT && _item.date < end)
    .sort((a, b) => a.date!.getTime() - b.date!.getTime())
    .map(({ time, temp }) => ({ time, temp }));

  // 오늘 날짜 기준 TMN/TMX 우선 추출
  const todayTmnValues = extremeItems
    .filter((_item) => _item.category === "TMN" && _item.fcstDate === targetDate)
    .map((_item) => toNumber(_item.fcstValue, 0));
  const todayTmxValues = extremeItems
    .filter((_item) => _item.category === "TMX" && _item.fcstDate === targetDate)
    .map((_item) => toNumber(_item.fcstValue, 0));

  // TMN/TMX가 없으면 오늘 TMP로 fallback
  const todayTmpValues = tmpItems
    .filter((_item) => _item.fcstDate === targetDate)
    .map((_item) => toNumber(_item.fcstValue, 0));

  const fallbackValues =
    todayTmpValues.length > 0 ? todayTmpValues : hourly.map((_hour) => _hour.temp);

  const todayMin =
    todayTmnValues.length > 0
      ? Math.min(...todayTmnValues)
      : fallbackValues.length > 0
        ? Math.min(...fallbackValues)
        : 0;
  const todayMax =
    todayTmxValues.length > 0
      ? Math.max(...todayTmxValues)
      : fallbackValues.length > 0
        ? Math.max(...fallbackValues)
        : 0;

  return {
    todayMin,
    todayMax,
    hourly,
  };
};
