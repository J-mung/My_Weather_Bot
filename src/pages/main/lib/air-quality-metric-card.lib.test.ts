import type { AirQualityMetric } from "@/entities/air-quality/model/air-quality.types";
import { describe, expect, it } from "vitest";
import {
  formatAirQualityValue,
  getAirQualityDescription,
  getAirQualityGrade,
} from "./air-quality-metric-card.lib";

const metric: AirQualityMetric = {
  value: 23,
  grade: "normal",
  flag: null,
};

describe("air quality metric card display helpers", () => {
  it("로딩/오류/값 없음 상태에서는 unavailable 등급을 표시한다", () => {
    expect(getAirQualityGrade({ metric, isLoading: true, isError: false })).toBe("unavailable");
    expect(getAirQualityGrade({ metric, isLoading: false, isError: true })).toBe("unavailable");
    expect(
      getAirQualityGrade({
        metric: { value: null, grade: "unavailable", flag: null },
        isLoading: false,
        isError: false,
      }),
    ).toBe("unavailable");
  });

  it("정상 값이면 측정 등급과 수치를 그대로 표시한다", () => {
    expect(getAirQualityGrade({ metric, isLoading: false, isError: false })).toBe("normal");
    expect(formatAirQualityValue(metric)).toBe("23");
  });

  it("값이 없으면 fallback 값과 flag 설명을 사용한다", () => {
    const unavailableMetric: AirQualityMetric = {
      value: null,
      grade: "unavailable",
      flag: "점검 중",
    };

    expect(formatAirQualityValue(unavailableMetric)).toBe("--");
    expect(
      getAirQualityDescription({
        metric: unavailableMetric,
        label: "미세먼지",
        displayDistrict: "복대동",
        isLoading: false,
        isError: false,
      }),
    ).toBe("점검 중");
  });

  it("상태별 설명 문구를 반환한다", () => {
    expect(
      getAirQualityDescription({
        metric,
        label: "미세먼지",
        displayDistrict: "복대동",
        isLoading: false,
        isError: false,
      }),
    ).toBe("복대동 기준 미세먼지 보통");

    expect(
      getAirQualityDescription({
        metric,
        label: "초미세먼지",
        displayDistrict: "",
        isLoading: false,
        isError: false,
      }),
    ).toBe("선택 지역 기준 초미세먼지 보통");

    expect(
      getAirQualityDescription({
        metric,
        label: "미세먼지",
        displayDistrict: "복대동",
        isLoading: true,
        isError: false,
      }),
    ).toBe("대기질 정보를 확인하고 있어요.");

    expect(
      getAirQualityDescription({
        metric,
        label: "미세먼지",
        displayDistrict: "복대동",
        isLoading: false,
        isError: true,
      }),
    ).toBe("대기질 정보를 불러오지 못했어요.");
  });
});
