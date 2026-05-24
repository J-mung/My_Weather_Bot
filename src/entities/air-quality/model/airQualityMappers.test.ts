import type { AirQualityStationItemType } from "@/entities/air-quality/api/air-quality-api.types";
import { describe, expect, it } from "vitest";
import {
  ensureAirQualityItems,
  resolveDistrictStationKeywords,
  resolveSidoName,
  selectAirQualityStation,
  toAirQualitySummary,
} from "./airQualityMappers";

const station = (
  stationName: string,
  pm10Value: string = "12",
  pm25Value: string = "6",
): AirQualityStationItemType => ({
  stationName,
  dataTime: "2026-05-24 17:00",
  pm10Value,
  pm10Grade: "1",
  pm25Value,
  pm25Grade: "2",
});

describe("airQualityMappers", () => {
  it("행정구역명에서 AirKorea 시도명과 세부 측정소 후보를 계산한다", () => {
    expect(resolveSidoName("충청북도 청주시 흥덕구 복대동")).toBe("충북");
    expect(resolveDistrictStationKeywords("충청북도 청주시 흥덕구 복대동")).toEqual([
      "복대동",
      "흥덕구",
      "흥덕",
      "청주시",
      "청주",
    ]);
  });

  it("가장 구체적인 측정소 후보를 우선 선택한다", () => {
    const selected = selectAirQualityStation(
      [station("청주"), station("복대동"), station("흥덕구", "-", "-")],
      resolveDistrictStationKeywords("충청북도 청주시 흥덕구 복대동"),
    );

    expect(selected.item?.stationName).toBe("복대동");
    expect(selected.matchedKeyword).toBe("복대동");
    expect(selected.selectionReason).toBe("exact");
  });

  it("일치 측정소가 없으면 측정값이 있는 대표 측정소로 fallback한다", () => {
    const selected = selectAirQualityStation(
      [station("점검중", "-", "-"), station("대표측정소")],
      resolveDistrictStationKeywords("서울특별시 중구 명동"),
    );

    expect(selected.item?.stationName).toBe("대표측정소");
    expect(selected.selectionReason).toBe("fallback");
  });

  it("측정소 선택 사유와 등급을 summary에 보존한다", () => {
    const selected = selectAirQualityStation(
      [station("복대동")],
      resolveDistrictStationKeywords("충청북도 청주시 흥덕구 복대동"),
    );
    const summary = toAirQualitySummary("충북", selected);

    expect(summary.stationName).toBe("복대동");
    expect(summary.matchedKeyword).toBe("복대동");
    expect(summary.selectionReason).toBe("exact");
    expect(summary.pm10).toEqual({ value: 12, grade: "good", flag: null });
    expect(summary.pm25).toEqual({ value: 6, grade: "normal", flag: null });
  });

  it("AirKorea item 응답이 단일 객체여도 배열로 정규화한다", () => {
    expect(ensureAirQualityItems({ item: station("중구") })).toHaveLength(1);
  });
});
