import type {
  ShortFcstItemType,
  ShortFcstResponseType,
  UltraNowResponseType,
} from "@/entities/weather/api/weatherApiTypes";
import type { TemperatureSummary } from "@/entities/weather/model/weatherTypes";
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

/**
 * 현재 기온 반환
 * @param now API 응답
 * @returns
 */
export const getCurrentTemperature = (now: UltraNowResponseType): number => {
  const items = now.response.body.items.item;
  const t1h = items.find((_item) => _item.category === "T1H");
  return Number(t1h?.obsrValue ?? 0); // 값이 없을 때는 0 fallback
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
): TemperatureSummary => {
  const items = short.response.body.items.item;

  // 현재(API 요청) 시각 구하기
  const end = new Date(observationDT.getTime() + 24 * 60 * 60 * 1000);
  const temps: ShortFcstItemType[] = items.filter((_item) => _item.category === "TMP");

  // 현재(API 요청) 시각 기준으로 데이터 구하기
  const hourly = temps
    .map((_temp) => ({
      date: parseDateTime(_temp.fcstDate, _temp.fcstTime),
      time: formatHourLabel(_temp.fcstDate, _temp.fcstTime),
      temp: Number(_temp.fcstValue ?? 0),
    }))
    .filter((_item) => _item.date !== null && _item.date >= observationDT && _item.date < end)
    .sort((a, b) => a.date!.getTime() - b.date!.getTime())
    .map(({ time, temp }) => ({ time, temp }));

  const values = hourly.map((_hour) => _hour.temp);
  const todayMin = values.length > 0 ? Math.min(...values) : 0;
  const todayMax = values.length > 0 ? Math.max(...values) : 0;

  return {
    todayMin,
    todayMax,
    hourly,
  };
};
