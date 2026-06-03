import type { AppErrorType } from "@/shared/api/app-errors";
import { AppError } from "@/shared/api/types";

type WeatherApiErrorMap = {
  fallback: AppErrorType;
  notFound: AppErrorType;
  retryLater: AppErrorType;
  unexpected: AppErrorType;
};

type WeatherApiErrorCause = {
  resultCode?: string;
  resultMsg?: string;
  data: unknown;
};

const notFoundResultCodes = new Set(["03"]);
const retryLaterResultCodes = new Set(["20", "22", "30", "31", "32", "99"]);

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const toOptionalString = (value: unknown): string | undefined => {
  return typeof value === "string" ? value : undefined;
};

const createCause = (data: unknown, resultCode?: string, resultMsg?: string): WeatherApiErrorCause => {
  return { data, resultCode, resultMsg };
};

const getResultErrorType = (
  resultCode: string | undefined,
  resultMsg: string | undefined,
  errorMap: WeatherApiErrorMap,
): AppErrorType => {
  if (!resultCode) {
    return errorMap.unexpected;
  }

  if (notFoundResultCodes.has(resultCode) || resultMsg?.includes("NO_DATA")) {
    return errorMap.notFound;
  }

  if (retryLaterResultCodes.has(resultCode)) {
    return errorMap.retryLater;
  }

  return errorMap.fallback;
};

const assertNormalHeader = (
  data: unknown,
  errorMap: WeatherApiErrorMap,
): { response: Record<string, unknown>; resultCode: string; resultMsg?: string } => {
  if (!isRecord(data) || !isRecord(data.response) || !isRecord(data.response.header)) {
    throw new AppError(errorMap.unexpected, createCause(data));
  }

  const resultCode = toOptionalString(data.response.header.resultCode);
  const resultMsg = toOptionalString(data.response.header.resultMsg);

  if (resultCode !== "00") {
    throw new AppError(
      getResultErrorType(resultCode, resultMsg, errorMap),
      createCause(data, resultCode, resultMsg),
    );
  }

  return { response: data.response, resultCode, resultMsg };
};

export const validateWeatherApiResponse = <T>(data: unknown, errorMap: WeatherApiErrorMap): T => {
  const { response, resultCode, resultMsg } = assertNormalHeader(data, errorMap);

  if (!isRecord(response.body) || !isRecord(response.body.items)) {
    throw new AppError(errorMap.notFound, createCause(data, resultCode, resultMsg));
  }

  const item = response.body.items.item;

  if (Array.isArray(item)) {
    if (item.length === 0) {
      throw new AppError(errorMap.notFound, createCause(data, resultCode, resultMsg));
    }

    return data as T;
  }

  if (isRecord(item)) {
    response.body.items.item = [item];
    return data as T;
  }

  throw new AppError(errorMap.notFound, createCause(data, resultCode, resultMsg));
};
