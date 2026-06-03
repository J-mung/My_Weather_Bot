import type { ShortFcstItemType, ShortFcstResponseType } from "@/entities/weather/api/weather-api.types";
import { describe, expect, it } from "vitest";
import { getPrecipitationSummary, getTemperatureSummary } from "./temperatureMappers";

const createShortItem = (
  category: string,
  fcstValue: string,
  fcstTime = "0700",
): ShortFcstItemType => ({
  baseDate: "20260603",
  baseTime: "0600",
  category,
  fcstDate: "20260603",
  fcstTime,
  fcstValue,
  nx: 60,
  ny: 127,
  obsrValue: fcstValue,
});

const createShortResponse = (items: ShortFcstItemType[]): ShortFcstResponseType => ({
  response: {
    header: {
      resultCode: "00",
      resultMsg: "NORMAL_SERVICE",
    },
    body: {
      dataType: "JSON",
      items: { item: items },
      pageNo: 1,
      numOfRows: items.length,
      totalCount: items.length,
    },
  },
});

describe("temperature precipitation mappers", () => {
  it("PCP/SNO 없음과 0 단위 문자열을 강수/적설 없음으로 정규화한다", () => {
    const summary = getPrecipitationSummary(
      createShortResponse([
        createShortItem("POP", "0"),
        createShortItem("PCP", "0mm"),
        createShortItem("SNO", "적설없음"),
      ]),
      new Date(2026, 5, 3, 6, 30),
    );

    expect(summary).toEqual({
      probability: 0,
      rainAmountMm: null,
      rainAmountText: null,
      snowAmountCm: null,
      snowAmountText: null,
    });
  });

  it("PCP/SNO 미만 문자열은 원문과 대표 숫자를 보존한다", () => {
    const summary = getPrecipitationSummary(
      createShortResponse([
        createShortItem("POP", "70"),
        createShortItem("PCP", "1mm 미만"),
        createShortItem("SNO", "0.5cm 미만"),
      ]),
      new Date(2026, 5, 3, 6, 30),
    );

    expect(summary.rainAmountText).toBe("1mm 미만");
    expect(summary.rainAmountMm).toBe(1);
    expect(summary.snowAmountText).toBe("0.5cm 미만");
    expect(summary.snowAmountCm).toBe(0.5);
  });

  it("시간별 예보에서도 PCP/SNO 없음과 미만 문자열을 동일하게 처리한다", () => {
    const summary = getTemperatureSummary(
      createShortResponse([
        createShortItem("TMP", "20"),
        createShortItem("SKY", "1"),
        createShortItem("PTY", "0"),
        createShortItem("POP", "60"),
        createShortItem("PCP", "강수없음"),
        createShortItem("SNO", "1cm 미만"),
      ]),
      new Date(2026, 5, 3, 6, 30),
    );

    expect(summary.hourly[0]).toMatchObject({
      precipitationProbability: 60,
      rainAmountText: null,
      snowAmountText: "1cm 미만",
    });
  });
});
