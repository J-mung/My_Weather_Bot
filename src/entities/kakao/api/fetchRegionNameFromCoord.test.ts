import { APP_ERROR } from "@/shared/api/app-errors";
import { API_ERROR } from "@/shared/api/types";
import { afterEach, describe, expect, it, vi } from "vitest";

const kakaoGetMock = vi.hoisted(() => vi.fn());

vi.mock("@/shared/api/axios", () => ({
  getApiClient: () => ({
    get: kakaoGetMock,
  }),
}));

import { fetchRegionNameFromCoord } from "./fetchRegionNameFromCoord";

const coord = { lat: 37.5665, lon: 126.978 };

describe("fetchRegionNameFromCoord", () => {
  afterEach(() => {
    kakaoGetMock.mockReset();
  });

  it("법정동 문서가 있으면 법정동 기준 지역명을 반환한다", async () => {
    kakaoGetMock.mockResolvedValue({
      data: {
        documents: [
          {
            region_type: "H",
            address_name: "서울특별시 중구 태평로1가",
            region_1depth_name: "서울특별시",
            region_2depth_name: "중구",
            region_3depth_name: "태평로1가",
          },
          {
            region_type: "B",
            address_name: "서울특별시 중구 명동",
            region_1depth_name: "서울특별시",
            region_2depth_name: "중구",
            region_3depth_name: "명동",
          },
        ],
      },
    });

    await expect(fetchRegionNameFromCoord(coord)).resolves.toBe("서울특별시 중구 명동");
  });

  it("documents가 비어 있으면 서비스 영역 밖 AppError로 분류한다", async () => {
    kakaoGetMock.mockResolvedValue({ data: { documents: [] } });

    await expect(fetchRegionNameFromCoord(coord)).rejects.toMatchObject({
      type: APP_ERROR.LOCATION_LOOKUP_OUT_OF_SERVICE_AREA,
    });
  });

  it("Kakao HTTP 400은 서비스 영역 밖 AppError로 분류한다", async () => {
    kakaoGetMock.mockRejectedValue({
      type: API_ERROR.HTTP,
      status: 400,
      statusText: "Bad Request",
      data: {},
      message: "bad request",
      cause: null,
    });

    await expect(fetchRegionNameFromCoord(coord)).rejects.toMatchObject({
      type: APP_ERROR.LOCATION_LOOKUP_OUT_OF_SERVICE_AREA,
    });
  });
});
