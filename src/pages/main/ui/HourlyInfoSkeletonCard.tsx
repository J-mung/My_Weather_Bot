import { cn } from "@/shared/lib/cn";
import { Skeleton } from "@/shared/ui/skeleton";
import { hourlyInfoCardStyles } from "./styles";

export const HourlyInfoSkeletonCard = () => {
  const hourlySkeletonList = Array.from({ length: 8 }, (_, index) => ({
    key: `hourly-skeleton-${index}`,
    time: "h-6 w-10",
    icon: "h-6 w-6",
    temp: "h-6 w-10",
  }));

  return (
    <div className={cn(hourlyInfoCardStyles.wrapper)}>
      <div className={cn(hourlyInfoCardStyles.list)}>
        {hourlySkeletonList.map((hour) => (
          <div key={hour.key} className={cn(hourlyInfoCardStyles.detail)}>
            <Skeleton className={cn(hourlyInfoCardStyles.detailHour, hour.time)} />
            <Skeleton className={cn(hourlyInfoCardStyles.detailIcon, hour.icon)} />
            <Skeleton className={cn(hourlyInfoCardStyles.detailValue, hour.temp)} />
          </div>
        ))}
      </div>
    </div>
  );
};
