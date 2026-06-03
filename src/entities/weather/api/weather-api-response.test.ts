import { APP_ERROR } from "@/shared/api/app-errors";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RequestWeatherParams } from "../model/weather-model.types";

const weatherGetMock = vi.hoisted(() => vi.fn());

vi.mock("@/shared/api/axios", () => ({
  getApiClient: () => ({
    get: weatherGetMock,
  }),
}));

import { fetchShortForecast } from "./fetchShortForecast";
import { fetchUltraForecast } from "./fetchUltraForecast";
import { fetchUltraNow } from "./fetchUltraNow";

const requestParams: RequestWeatherParams = {
  base_date: "20260603",
  base_time: "0600",
  nx: 60,
  ny: 127,
};

const createWeatherBody = (options?: {
  resultCode?: string;
  resultMsg?: string;
  item?: unknown;
  omitBody?: boolean;
}) => ({
  response: {
    header: {
      resultCode: options?.resultCode ?? "00",
      resultMsg: options?.resultMsg ?? "NORMAL_SERVICE",
    },
    ...(options?.omitBody
      ? {}
      : {
          body: {
            dataType: "JSON",
            items: {
              item: options?.item ?? [
                {
                  baseDate: "20260603",
                  baseTime: "0600",
                  category: "TMP",
                  fcstDate: "20260603",
                  fcstTime: "0700",
                  fcstValue: "20",
                  nx: 60,
                  ny: 127,
                  obsrValue: "20",
                },
              ],
            },
            pageNo: 1,
            numOfRows: 10,
            totalCount: 1,
          },
        }),
  },
});

describe("weather api response validation", () => {
  afterEach(() => {
    weatherGetMock.mockReset();
  });

  it.each([
    ["초단기실황", fetchUltraNow, APP_ERROR.ULTRA_NOW_NOT_FOUND],
    ["초단기예보", fetchUltraForecast, APP_ERROR.ULTRA_FORECAST_NOT_FOUND],
    ["단기예보", fetchShortForecast, APP_ERROR.SHORT_FORECAST_NOT_FOUND],
  ])("%s 응답 resultCode=03은 not found AppError로 변환한다", async (_, fetcher, expectedType) => {
    weatherGetMock.mockResolvedValue({
      data: createWeatherBody({ resultCode: "03", resultMsg: "NO_DATA" }),
    });

    await expect(fetcher(requestParams)).rejects.toMatchObject({ type: expectedType });
  });

  it.each([
    ["초단기실황", fetchUltraNow, APP_ERROR.ULTRA_NOW_RETRY_LATER],
    ["초단기예보", fetchUltraForecast, APP_ERROR.ULTRA_FORECAST_RETRY_LATER],
    ["단기예보", fetchShortForecast, APP_ERROR.SHORT_FORECAST_RETRY_LATER],
  ])("%s 응답 resultCode=99는 retry later AppError로 변환한다", async (_, fetcher, expectedType) => {
    weatherGetMock.mockResolvedValue({
      data: createWeatherBody({ resultCode: "99", resultMsg: "SERVICE_ERROR" }),
    });

    await expect(fetcher(requestParams)).rejects.toMatchObject({ type: expectedType });
  });

  it.each([
    ["초단기실황", fetchUltraNow, APP_ERROR.ULTRA_NOW_NOT_FOUND],
    ["초단기예보", fetchUltraForecast, APP_ERROR.ULTRA_FORECAST_NOT_FOUND],
    ["단기예보", fetchShortForecast, APP_ERROR.SHORT_FORECAST_NOT_FOUND],
  ])("%s 응답 body.items가 없으면 not found AppError로 변환한다", async (_, fetcher, expectedType) => {
    weatherGetMock.mockResolvedValue({ data: createWeatherBody({ omitBody: true }) });

    await expect(fetcher(requestParams)).rejects.toMatchObject({ type: expectedType });
  });

  it("item이 단일 객체로 내려와도 mapper가 사용할 수 있도록 배열로 정규화한다", async () => {
    weatherGetMock.mockResolvedValue({
      data: createWeatherBody({
        item: {
          baseDate: "20260603",
          baseTime: "0600",
          category: "TMP",
          fcstDate: "20260603",
          fcstTime: "0700",
          fcstValue: "20",
          nx: 60,
          ny: 127,
          obsrValue: "20",
        },
      }),
    });

    const result = await fetchShortForecast(requestParams);

    expect(Array.isArray(result.response.body.items.item)).toBe(true);
    expect(result.response.body.items.item).toHaveLength(1);
  });
});
