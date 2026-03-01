import type { BaseDateTime } from "@/entities/weather/model/weatherTypes";

/**
 * 기상청 초단기실황용 base_date, base_time 계산
 *
 *    - 바로 직전 정시를 사용할 경우 API 데이터 제공 시간 전일 수 있기 때문에
 *    - 안전하게 현재 시각 기준 1시간 이전의 정시를 사용
 * @param now
 * @returns
 */
export const getUltraSrtNcstBaseDateTime = (now: Date = new Date()): BaseDateTime => {
  // 1시간 전으로 이동
  now.setHours(now.getHours() - 1);

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");

  return {
    base_date: `${yyyy}${mm}${dd}`,
    base_time: `${hh}00`,
  };
};

/**
 * 기상청 단기예보용 base_date, base_time 계산
 *
 *    - 단기예보 발표 시간:
 *      02, 05, 08, 11, 14, 17, 20, 23시
 *    - 현재 시각 기준으로 가장 최근 발표 시각을 선택
 * @param now
 * @returns
 */
export const getVilageFcstBaseDateTime = (now: Date = new Date()): BaseDateTime => {
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  let baseDate = `${yyyy}${mm}${dd}`;

  const hour = now.getHours();

  const announceTime = [2, 5, 8, 11, 14, 17, 20, 23];

  let baseHour = announceTime
    .slice()
    .reverse()
    .find((h) => hour >= h);

  // 자정 ~ 01시 사이면 전날 23시 사용
  if (baseHour === undefined) {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const yyyyy = yesterday.getFullYear();
    const ymm = String(yesterday.getMonth() + 1).padStart(2, "0");
    const ydd = String(yesterday.getDate()).padStart(2, "0");

    baseDate = `${yyyyy}${ymm}${ydd}`;
    baseHour = 23;
  }

  const baseTime = String(baseHour).padStart(2, "0") + "00";

  return {
    base_date: baseDate,
    base_time: baseTime,
  };
};

/**
 * 단기예보 TMN/TMX 안정 조회용 base_date, base_time 계산
 *    - 별도 계산 이유
 *      - 오늘의 최고, 최저 기온을 때에 따라 알려주지 않음
 *      - 기준 시각: 최고 기온(오후 3시) / 최저 기온(오전 6시)
 *      - 예시)
 *        - 새벽 2시: 오늘 중 최고, 최저 기온 데이터가 있음
 *        - 오전 8시: 오늘 중 최저 기온일 때는 지났기 때문에 오늘의 최저 기온 데이터가 없음
 *        - 오후 2시: 오늘 중 최고, 최저 기온일 때가 지났기 때문에 알 수 없으며, 내일의 최고, 최저 기온 데이터가 있음
 *    - 당일 02시 자료를 우선 사용
 *    - 새벽 02시 이전이면 전날 02시 자료 사용
 */
export const getVilageFcstTodayTempRangeBaseDateTime = (now: Date = new Date()): BaseDateTime => {
  const target = new Date(now);

  if (target.getHours() < 2) {
    target.setDate(target.getDate() - 1);
  }

  const yyyy = target.getFullYear();
  const mm = String(target.getMonth() + 1).padStart(2, "0");
  const dd = String(target.getDate()).padStart(2, "0");

  return {
    base_date: `${yyyy}${mm}${dd}`,
    base_time: "0200",
  };
};
