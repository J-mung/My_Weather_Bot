import type {
  ShortFcstItemType,
  ShortFcstResponseType,
  UltraFcstResponseType,
  UltraNowResponseType,
} from "@/entities/weather/api/weather-api.types";
import type {
  CurrentWeatherNow,
  ParsedShortFcstItemType,
  TemperatureSummary,
  WeatherPrecipitation,
  WeatherCondition,
} from "@/entities/weather/model/weather.types";
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

/**
 * 시간대별 날씨의 시간 Label fomater
 * @param yyyymmdd
 * @param hhmm
 * @returns
 */
const formatHourLabel = (yyyymmdd: string, hhmm: string): string => {
  if (!/^\d{8}$/.test(yyyymmdd) || !/^\d{4}$/.test(hhmm)) {
    return `${yyyymmdd} ${hhmm}`;
  }

  const year = Number(yyyymmdd.slice(0, 4));
  const month = Number(yyyymmdd.slice(4, 6)) - 1;
  const day = Number(yyyymmdd.slice(6, 8));
  const hour = Number(hhmm.slice(0, 2));
  const minute = Number(hhmm.slice(2, 4));

  const date = new Date(year, month, day, hour, minute);

  return date.toLocaleString("en-US", {
    hour: "numeric",
    hour12: true,
  });
};

const toNumber = (value: string | undefined, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toNullableNumber = (value: string | undefined): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const isNoPrecipitationText = (value: string | undefined): boolean => {
  if (!value) {
    return true;
  }

  return value.includes("없음") || value === "0" || value === "0.0";
};

const getFirstNumericValue = (value: string | undefined): number | null => {
  if (!value || isNoPrecipitationText(value)) {
    return null;
  }

  const matched = value.match(/\d+(?:\.\d+)?/);
  if (!matched) {
    return null;
  }

  const parsed = Number(matched[0]);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizePrecipitationText = (value: string | undefined): string | null => {
  if (!value || isNoPrecipitationText(value)) {
    return null;
  }

  return value;
};

/**
 * 계산 결과를 정수 단위로 반올림한다.
 */
const toRounded = (value: number | null): number | null => {
  if (value === null || !Number.isFinite(value)) {
    return null;
  }

  return Math.round(value);
};

/**
 * 체감온도(Wind Chill)를 계산한다.
 * - 입력 풍속은 기상청 WSD 기준 m/s
 * - 공식 적용 전 km/h로 변환한다.
 */
const calculateWindChill = (temperatureC: number, windSpeedMs: number): number => {
  const windSpeedKmh = windSpeedMs * 3.6;

  if (windSpeedKmh <= 4.8) {
    return temperatureC;
  }

  return (
    13.12 +
    0.6215 * temperatureC -
    11.37 * windSpeedKmh ** 0.16 +
    0.3965 * temperatureC * windSpeedKmh ** 0.16
  );
};

/**
 * 체감온도(Heat Index)를 계산한다.
 * - 입력 온도는 섭씨, 공식 계산은 화씨 기반으로 수행한다.
 */
const calculateHeatIndex = (temperatureC: number, humidity: number): number => {
  const temperatureF = temperatureC * (9 / 5) + 32;

  const heatIndexF =
    -42.379 +
    2.04901523 * temperatureF +
    10.14333127 * humidity -
    0.22475541 * temperatureF * humidity -
    0.00683783 * temperatureF * temperatureF -
    0.05481717 * humidity * humidity +
    0.00122874 * temperatureF * temperatureF * humidity +
    0.00085282 * temperatureF * humidity * humidity -
    0.00000199 * temperatureF * temperatureF * humidity * humidity;

  const heatIndexC = (heatIndexF - 32) * (5 / 9);

  return Math.max(temperatureC, heatIndexC);
};

/**
 * 연중 공통 기준으로 체감온도를 계산한다.
 * - 27도 이상: Heat Index
 * - 10도 이하: Wind Chill
 * - 11도~26도: 실제 기온
 */
const calculateFeelsLike = (
  temperatureC: number | null,
  humidity: number | null,
  windSpeedMs: number | null,
): number | null => {
  if (temperatureC === null) {
    return null;
  }

  if (temperatureC >= 27) {
    if (humidity === null) {
      return null;
    }

    return toRounded(calculateHeatIndex(temperatureC, humidity));
  }

  if (temperatureC <= 10) {
    if (windSpeedMs === null) {
      return null;
    }

    return toRounded(calculateWindChill(temperatureC, windSpeedMs));
  }

  return toRounded(temperatureC);
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
 * 현재 관측값 반환
 * @param now API 응답
 * @returns
 */
export const getCurrentObservation = (
  now: UltraNowResponseType,
): {
  temperature: number | null;
  humidity: number | null;
  windSpeedMs: number | null;
} => {
  const items = now.response.body.items.item;
  const t1h = items.find((_item) => _item.category === "T1H");
  // 여름철(27℃ 이상) 체감온도를 구하기 위해 습도 필요
  const reh = items.find((_item) => _item.category === "REH");
  // 겨울철(10℃ 이하) 체감온도를 구하기 위해 풍속 필요
  const wsd = items.find((_item) => _item.category === "WSD");
  return {
    temperature: toNullableNumber(t1h?.obsrValue),
    humidity: toNullableNumber(reh?.obsrValue),
    windSpeedMs: toNullableNumber(wsd?.obsrValue),
  };
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
): WeatherCondition => {
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
 * 현재 날씨 정보 조회
 *  - 현재 기온
 *  - 습도
 *  - 풍속 / 체감온도 / 기상 상태
 * @param now
 * @param ultraForecast
 * @param observationDT
 * @returns
 */
export const getCurrentWeatherNow = (
  now: UltraNowResponseType,
  ultraForecast: UltraFcstResponseType,
  observationDT: Date = new Date(),
): CurrentWeatherNow => {
  const { temperature, humidity, windSpeedMs } = getCurrentObservation(now);

  return {
    temperature,
    humidity,
    windSpeedMs,
    feelsLike: calculateFeelsLike(temperature, humidity, windSpeedMs),
    condition: getCurrentCondition(now, ultraForecast, observationDT),
  };
};

export const getPrecipitationSummary = (
  short: ShortFcstResponseType,
  observationDT: Date = new Date(),
): WeatherPrecipitation => {
  const items = short.response.body.items.item;
  const candidates = getParsedFcstItems(
    items.filter(
      (_item) => _item.category === "POP" || _item.category === "PCP" || _item.category === "SNO",
    ),
  )
    .filter((_item) => _item.date !== null)
    .sort((a, b) => a.date!.getTime() - b.date!.getTime());

  const nearest =
    candidates.find((_item) => _item.date!.getTime() >= observationDT.getTime()) ?? candidates[0];

  if (!nearest) {
    return {
      probability: null,
      rainAmountMm: null,
      rainAmountText: null,
      snowAmountCm: null,
      snowAmountText: null,
    };
  }

  const rainAmountText = normalizePrecipitationText(nearest.rawValues.PCP);
  const snowAmountText = normalizePrecipitationText(nearest.rawValues.SNO);

  return {
    probability: toNullableNumber(nearest.rawValues.POP),
    rainAmountMm: getFirstNumericValue(nearest.rawValues.PCP),
    rainAmountText,
    snowAmountCm: getFirstNumericValue(nearest.rawValues.SNO),
    snowAmountText,
  };
};

/**
 * 예보 데이터 카테고리 컬럼화
 * @param items
 * @returns
 */
const getParsedFcstItems = (items: ShortFcstItemType[]): ParsedShortFcstItemType[] => {
  const map = new Map<string, ParsedShortFcstItemType>();

  items.forEach((_item) => {
    const key = `${_item.fcstDate}_${_item.fcstTime}`;

    if (!map.has(key)) {
      map.set(key, {
        date: parseDateTime(_item.fcstDate, _item.fcstTime),
        time: formatHourLabel(_item.fcstDate, _item.fcstTime),
        fcstDate: _item.fcstDate,
        values: {},
        rawValues: {},
      });
    }

    const target = map.get(key)!;
    target.values[_item.category] = toNumber(_item.fcstValue, 0);
    target.rawValues[_item.category] = _item.fcstValue;
  });

  return Array.from(map.values());
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
  const fcstItems: ShortFcstItemType[] = items.filter(
    (_item) =>
      _item.category === "TMP" ||
      _item.category === "SKY" ||
      _item.category === "PTY" ||
      _item.category === "POP" ||
      _item.category === "PCP" ||
      _item.category === "SNO",
  );

  // 현재(API 요청) 시각 기준 24시간 TMP 데이터
  const hourly = getParsedFcstItems(fcstItems)
    .filter((_item) => _item.date !== null && _item.date >= observationDT && _item.date < end)
    .sort((a, b) => a.date!.getTime() - b.date!.getTime())
    .map(({ time, values, rawValues }) => {
      const temp = values.TMP;
      const sky = values.SKY;
      const pty = values.PTY;
      let condition: WeatherCondition;
      if (pty !== 0) {
        condition = mapPtyToCondition(pty);
      } else if (sky !== 0) {
        condition = mapSkyToCondition(sky);
      } else {
        condition = "unavailable";
      }

      return {
        time,
        temp,
        condition,
        precipitationProbability: toNullableNumber(rawValues.POP),
        rainAmountText: normalizePrecipitationText(rawValues.PCP),
        snowAmountText: normalizePrecipitationText(rawValues.SNO),
      };
    });

  // 오늘 날짜 기준 TMN/TMX 우선 추출
  const todayTmnValues = extremeItems
    .filter((_item) => _item.category === "TMN" && _item.fcstDate === targetDate)
    .map((_item) => toNumber(_item.fcstValue, 0));
  const todayTmxValues = extremeItems
    .filter((_item) => _item.category === "TMX" && _item.fcstDate === targetDate)
    .map((_item) => toNumber(_item.fcstValue, 0));

  // TMN/TMX가 없으면 오늘 TMP로 fallback
  const todayTmpValues = fcstItems
    .filter((_item) => _item.category === "TMP" && _item.fcstDate === targetDate)
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
