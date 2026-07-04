import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchRiseSetInfo } from "./fetchRiseSetInfo";

const riseSetGetMock = vi.hoisted(() => vi.fn());

vi.mock("@/shared/api/axios", () => ({
  getApiClient: () => ({
    get: riseSetGetMock,
  }),
}));

describe("fetchRiseSetInfo", () => {
  beforeEach(() => {
    riseSetGetMock.mockReset();
  });

  it("maps KASI JSON response into sunrise/sunset summary", async () => {
    riseSetGetMock.mockResolvedValue({
      data: {
        response: {
          header: {
            resultCode: "00",
            resultMsg: "NORMAL SERVICE.",
          },
          body: {
            items: {
              item: {
                location: "서울",
                locdate: 20260704,
                sunrise: "0516  ",
                sunset: "1957  ",
              },
            },
          },
        },
      },
    });

    await expect(fetchRiseSetInfo({ locdate: "20260704", location: "서울" })).resolves.toMatchObject({
      location: "서울",
      locdate: "20260704",
      sunriseText: "05:16",
      sunsetText: "19:57",
      dayLengthText: "14시간 41분",
    });
  });

  it("maps KASI XML response into sunrise/sunset summary", async () => {
    riseSetGetMock.mockResolvedValue({
      data: [
        "<response>",
        "<header><resultCode>00</resultCode><resultMsg>NORMAL SERVICE.</resultMsg></header>",
        "<body><items><item>",
        "<location>서울</location><locdate>20260704</locdate>",
        "<sunrise>0516  </sunrise><sunset>1957  </sunset>",
        "</item></items></body>",
        "</response>",
      ].join(""),
    });

    await expect(fetchRiseSetInfo({ locdate: "20260704", location: "서울" })).resolves.toMatchObject({
      sunriseText: "05:16",
      sunsetText: "19:57",
    });
  });

  it("maps KASI JSON string response into sunrise/sunset summary", async () => {
    riseSetGetMock.mockResolvedValue({
      data: JSON.stringify({
        response: {
          header: {
            resultCode: "00",
            resultMsg: "NORMAL SERVICE.",
          },
          body: {
            items: {
              item: {
                location: "서울",
                locdate: 20260704,
                sunrise: "0516  ",
                sunset: "1957  ",
              },
            },
          },
        },
      }),
    });

    await expect(fetchRiseSetInfo({ locdate: "20260704", location: "서울" })).resolves.toMatchObject({
      location: "서울",
      locdate: "20260704",
      sunriseText: "05:16",
      sunsetText: "19:57",
    });
  });

  it("throws API result message for KASI failure response", async () => {
    riseSetGetMock.mockResolvedValue({
      data: {
        response: {
          header: {
            resultCode: "30",
            resultMsg: "SERVICE KEY IS NOT REGISTERED ERROR.",
          },
        },
      },
    });

    await expect(fetchRiseSetInfo({ locdate: "20260704", location: "서울" })).rejects.toThrow(
      "SERVICE KEY IS NOT REGISTERED ERROR.",
    );
  });

  it("throws when KASI success response has no item", async () => {
    riseSetGetMock.mockResolvedValue({
      data: {
        response: {
          header: {
            resultCode: "00",
            resultMsg: "NORMAL SERVICE.",
          },
          body: {
            items: {},
          },
        },
      },
    });

    await expect(fetchRiseSetInfo({ locdate: "20260704", location: "서울" })).rejects.toThrow(
      "출몰시각 응답에 item이 없습니다.",
    );
  });

  it("throws when KASI item cannot be mapped into display times", async () => {
    riseSetGetMock.mockResolvedValue({
      data: {
        response: {
          header: {
            resultCode: "00",
            resultMsg: "NORMAL SERVICE.",
          },
          body: {
            items: {
              item: {
                location: "서울",
                locdate: 20260704,
                sunrise: "1957",
                sunset: "0516",
              },
            },
          },
        },
      },
    });

    await expect(fetchRiseSetInfo({ locdate: "20260704", location: "서울" })).rejects.toThrow(
      "출몰시각 응답을 표시 형식으로 변환하지 못했습니다.",
    );
  });

  it("propagates request failures to React Query", async () => {
    riseSetGetMock.mockRejectedValue(new Error("Network Error"));

    await expect(fetchRiseSetInfo({ locdate: "20260704", location: "서울" })).rejects.toThrow(
      "Network Error",
    );
  });
});
