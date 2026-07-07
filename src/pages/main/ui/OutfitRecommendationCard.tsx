import { NO_DATA_STATUS_CODE } from "@/shared/api/no-data-status-codes";
import { cn } from "@/shared/lib/cn";
import { Skeleton } from "@/shared/ui/skeleton";
import { MetricStateCard } from "./MetricStateCard";
import { outfitRecommendationCardStyles } from "./styles";
import type { OutfitRecommendationCardProps } from "./types";

const BASIS_SOURCE_LABEL = {
  feelsLike: "체감온도 기준",
  temperature: "현재기온 기준",
  unavailable: "기준 정보 없음",
} as const;

const formatBasisText = ({
  basisSource,
  basisTemperature,
}: NonNullable<OutfitRecommendationCardProps["recommendation"]>): string => {
  if (basisTemperature === null) {
    return BASIS_SOURCE_LABEL[basisSource];
  }

  return `${BASIS_SOURCE_LABEL[basisSource]} ${basisTemperature}°`;
};

const OutfitRecommendationSkeletonCard = () => {
  const chipSkeletonList = ["h-9 w-18", "h-9 w-24", "h-9 w-28", "h-9 w-20"];

  return (
    <div className={cn(outfitRecommendationCardStyles.root)} aria-hidden={"true"}>
      <div className={cn(outfitRecommendationCardStyles.skeletonHeader)}>
        <Skeleton className={"h-4 w-32"} />
        <Skeleton className={"h-8 w-56 max-w-full"} />
        <Skeleton className={"h-5 w-full"} />
        <Skeleton className={"h-5 w-4/5"} />
      </div>
      <div className={cn(outfitRecommendationCardStyles.skeletonChipList)}>
        {chipSkeletonList.map((chipClassName) => (
          <Skeleton key={chipClassName} rounded={"full"} className={chipClassName} />
        ))}
      </div>
    </div>
  );
};

export const OutfitRecommendationCard = ({
  recommendation,
  isLoading,
  isFetching,
  isNoData = false,
}: OutfitRecommendationCardProps) => {
  if (isLoading) {
    return <OutfitRecommendationSkeletonCard />;
  }

  if (isNoData) {
    return (
      <div className={cn(outfitRecommendationCardStyles.root)}>
        <MetricStateCard
          title={"오늘의 옷차림 정보가 아직 없어요"}
          description={
            "날씨 데이터가 아직 없어 옷차림을 추천할 수 없어요.\n잠시 후 다시 확인해 주세요."
          }
          code={NO_DATA_STATUS_CODE.WEATHER_OUTFIT}
          codeLabel={"상태 코드"}
          tone={"info"}
        />
      </div>
    );
  }

  if (!recommendation) {
    return null;
  }

  return (
    <div
      className={cn(
        outfitRecommendationCardStyles.root,
        isFetching && outfitRecommendationCardStyles.fetching,
      )}
    >
      <div className={cn(outfitRecommendationCardStyles.header)}>
        <div className={"min-w-0"}>
          <p className={cn(outfitRecommendationCardStyles.eyebrow)}>오늘의 옷차림</p>
          <h2 className={cn(outfitRecommendationCardStyles.title)}>{recommendation.title}</h2>
        </div>
        <span className={cn(outfitRecommendationCardStyles.basis)}>
          {formatBasisText(recommendation)}
        </span>
      </div>

      <p className={cn(outfitRecommendationCardStyles.summary)}>{recommendation.summary}</p>

      <div className={cn(outfitRecommendationCardStyles.chipList)} aria-label={"추천 옷차림"}>
        {recommendation.items.map((item) => (
          <span key={item} className={cn(outfitRecommendationCardStyles.chip)}>
            {item}
          </span>
        ))}
      </div>

      {recommendation.cautions.length > 0 && (
        <div className={cn(outfitRecommendationCardStyles.cautionBox)}>
          <p className={cn(outfitRecommendationCardStyles.cautionTitle)}>챙기면 좋아요</p>
          <ul className={cn(outfitRecommendationCardStyles.cautionList)}>
            {recommendation.cautions.map((caution) => (
              <li key={caution} className={cn(outfitRecommendationCardStyles.cautionItem)}>
                {caution}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
