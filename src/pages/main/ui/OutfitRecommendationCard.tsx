import { cn } from "@/shared/lib/cn";
import { Skeleton } from "@/shared/ui/skeleton";
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
}: OutfitRecommendationCardProps) => {
  if (isLoading) {
    return <OutfitRecommendationSkeletonCard />;
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
