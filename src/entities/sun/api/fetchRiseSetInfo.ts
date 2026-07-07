import { mapRiseSetInfo, type RiseSetSummary } from "@/entities/sun/model/riseSetMappers";
import { APP_ERROR } from "@/shared/api/app-errors";
import { getApiClient } from "@/shared/api/axios";
import { AppError, isAppError } from "@/shared/api/types";
import type { RiseSetInfoItemType } from "./rise-set-api.types";

const riseSetApiClient = getApiClient("riseSet");

const parseXmlTag = (xml: string, tagName: string): string | undefined => {
  const match = xml.match(new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`));
  return match?.[1]?.trim();
};

const parseRiseSetItemFromXml = (xml: string): RiseSetInfoItemType | null => {
  const itemXml = xml.match(/<item>([\s\S]*?)<\/item>/)?.[1];
  if (!itemXml) {
    return null;
  }

  return {
    locdate: parseXmlTag(itemXml, "locdate"),
    location: parseXmlTag(itemXml, "location"),
    locatioan: parseXmlTag(itemXml, "locatioan"),
    longitude: parseXmlTag(itemXml, "longitude"),
    latitude: parseXmlTag(itemXml, "latitude"),
    sunrise: parseXmlTag(itemXml, "sunrise"),
    suntransit: parseXmlTag(itemXml, "suntransit"),
    sunset: parseXmlTag(itemXml, "sunset"),
    moonrise: parseXmlTag(itemXml, "moonrise"),
    moontransit: parseXmlTag(itemXml, "moontransit"),
    moonset: parseXmlTag(itemXml, "moonset"),
    civilm: parseXmlTag(itemXml, "civilm"),
    civile: parseXmlTag(itemXml, "civile"),
    nautm: parseXmlTag(itemXml, "nautm"),
    naute: parseXmlTag(itemXml, "naute"),
    astm: parseXmlTag(itemXml, "astm"),
    aste: parseXmlTag(itemXml, "aste"),
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeRiseSetItem = (value: unknown): RiseSetInfoItemType | null => {
  if (!isRecord(value)) {
    return null;
  }

  return value as RiseSetInfoItemType;
};

const parseRiseSetPayloadFromJson = (
  payload: unknown,
): {
  resultCode?: string;
  resultMsg?: string;
  item: RiseSetInfoItemType | null;
} => {
  if (!isRecord(payload) || !isRecord(payload.response)) {
    return { item: null };
  }

  const response = payload.response;
  const header = isRecord(response.header) ? response.header : {};
  const body = isRecord(response.body) ? response.body : {};
  const items = isRecord(body.items) ? body.items : {};
  const rawItem = Array.isArray(items.item) ? items.item[0] : items.item;

  return {
    resultCode:
      header.resultCode === undefined || header.resultCode === null
        ? undefined
        : String(header.resultCode),
    resultMsg:
      header.resultMsg === undefined || header.resultMsg === null
        ? undefined
        : String(header.resultMsg),
    item: normalizeRiseSetItem(rawItem),
  };
};

const parseRiseSetPayload = (
  payload: unknown,
): {
  resultCode?: string;
  resultMsg?: string;
  item: RiseSetInfoItemType | null;
} => {
  if (typeof payload !== "string") {
    return parseRiseSetPayloadFromJson(payload);
  }

  const text = payload.trim();
  if (text.startsWith("{")) {
    try {
      return parseRiseSetPayloadFromJson(JSON.parse(text));
    } catch {
      return { item: null };
    }
  }

  return {
    resultCode: parseXmlTag(text, "resultCode"),
    resultMsg: parseXmlTag(text, "resultMsg"),
    item: parseRiseSetItemFromXml(text),
  };
};

export const fetchRiseSetInfo = async ({
  locdate,
  location,
}: {
  locdate: string;
  location: string;
}): Promise<RiseSetSummary | null> => {
  try {
    const response = await riseSetApiClient.get("getAreaRiseSetInfo", {
      params: {
        locdate,
        location,
      },
      responseType: "text",
    });
    const { resultCode, resultMsg, item } = parseRiseSetPayload(response.data);

    if (!resultCode) {
      throw new AppError(APP_ERROR.SUNRISE_SUNSET, response.data);
    }

    if (resultCode && resultCode !== "00") {
      throw new AppError(APP_ERROR.SUNRISE_SUNSET, { resultCode, resultMsg });
    }

    if (!item) {
      return null;
    }

    const mapped = mapRiseSetInfo(item);
    if (!mapped) {
      return null;
    }

    return mapped;
  } catch (error) {
    if (isAppError(error)) {
      throw error;
    }

    throw new AppError(APP_ERROR.SUNRISE_SUNSET, error);
  }
};
