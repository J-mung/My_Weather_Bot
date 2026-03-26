import { cn } from "@/shared/lib/cn";
import { Skeleton } from "@/shared/ui/skeleton";
import { nowInfoCardStyles } from "./styles";

export const NowInfoSkeletonCard = () => {
  const detailSkeletonList = Array(3).fill({
    icon: "h-8 w-8",
    category: "h-5 w-21",
    value: "h-9 w-21",
  });
  return (
    <div className={cn(nowInfoCardStyles.root)}>
      {/* Title */}
      <div className={cn(nowInfoCardStyles.header)}>
        <div className={cn(nowInfoCardStyles.headerText)}>
          <div className={cn(nowInfoCardStyles.titleRow)}>
            <div className={cn(nowInfoCardStyles.titleGroup)}>
              <div className={cn(nowInfoCardStyles.mobileTitle, "md:hidden")}>
                <div className={cn(nowInfoCardStyles.districtSecondary)}>
                  <Skeleton className={"h-5 w-80"} />
                </div>
                <div className={cn(nowInfoCardStyles.districtPrimary)}>
                  <Skeleton className={"h-11 w-80"} />
                </div>
              </div>
              <div className={cn(nowInfoCardStyles.desktopTitle, "hidden md:block")}>
                <Skeleton className={"h-10 w-100 md:h-12 md:w-56"} />
              </div>
              <Skeleton className={"h-6 w-32"} />
            </div>
            <Skeleton rounded={"full"} className={"h-10 w-10"} />
          </div>
        </div>
        <Skeleton className={"h-17 w-17"} />
      </div>
      {/* Body */}
      <div className={cn(nowInfoCardStyles.body)}>
        <div className={cn(nowInfoCardStyles.currentTemp)}>
          <Skeleton className={"h-32 w-50"} />
        </div>
        <div className={cn(nowInfoCardStyles.currentMeta)}>
          <div className={cn(nowInfoCardStyles.currentSummary)}>
            <Skeleton className={"h-9 w-29"} />
          </div>
          <div className={cn(nowInfoCardStyles.currentFeelsLike)}>
            <Skeleton className={"h-8 w-29"} />
          </div>
        </div>
      </div>
      <div className={cn(nowInfoCardStyles.divider)} />
      <div className={cn(nowInfoCardStyles.detailList)}>
        {detailSkeletonList.map((_detail, index) => (
          <div key={index} className={cn(nowInfoCardStyles.detailItem)}>
            <Skeleton className={_detail.icon} />
            <div className={cn(nowInfoCardStyles.detailText)}>
              <Skeleton className={_detail.category} />
              <Skeleton className={_detail.value} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
