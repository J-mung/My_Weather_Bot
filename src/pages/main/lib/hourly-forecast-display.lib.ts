import type { SummaryDomain } from "@/entities/weather/model/weather.types";

export type HourlyForecastDisplayItem = NonNullable<SummaryDomain["hourly"]>[number];

export const formatHourlyPrecipitationProbability = (
  precipitationProbability: number | null,
): string => {
  return typeof precipitationProbability === "number" ? `${precipitationProbability}%` : "--%";
};

export const getHourlyPrecipitationAmountText = ({
  rainAmountText,
  snowAmountText,
}: Pick<HourlyForecastDisplayItem, "rainAmountText" | "snowAmountText">): string | null => {
  const precipitationDetails = [
    rainAmountText ? `강수량 ${rainAmountText}` : null,
    snowAmountText ? `적설 ${snowAmountText}` : null,
  ].filter((value): value is string => Boolean(value));

  return precipitationDetails.length > 0 ? precipitationDetails.join(" · ") : null;
};

export const getHourlyPrecipitationAmountShortText = ({
  rainAmountText,
  snowAmountText,
}: Pick<HourlyForecastDisplayItem, "rainAmountText" | "snowAmountText">): string | null => {
  const precipitationDetails = [
    rainAmountText ?? null,
    snowAmountText ? `눈 ${snowAmountText}` : null,
  ].filter((value): value is string => Boolean(value));

  return precipitationDetails.length > 0 ? precipitationDetails.join(" · ") : null;
};

export const getHourlyPrecipitationAriaLabel = (
  forecast: Pick<
    HourlyForecastDisplayItem,
    "precipitationProbability" | "rainAmountText" | "snowAmountText"
  >,
): string => {
  const probabilityText = formatHourlyPrecipitationProbability(forecast.precipitationProbability);
  const amountText = getHourlyPrecipitationAmountText(forecast);

  return amountText ? `강수확률 ${probabilityText}, ${amountText}` : `강수확률 ${probabilityText}`;
};
