import { cn } from "@/shared/lib/cn";
import { Skeleton } from "@/shared/ui/skeleton";
import { hourlyInfoCardStyles } from "./styles";

export const HourlyInfoSkeletonCard = () => {
  const hourlySkeletonList = Array(8).fill({
    time: "h-6 w-10",
    icon: "h-6 w-6",
    temp: "h-6 w-10",
  });
  return (
    <div className={cn(hourlyInfoCardStyles.wrapper)}>
      <div className={cn(hourlyInfoCardStyles.list)}>
        {hourlySkeletonList.map((_hour) => (
          <div key={_hour.key} className={cn(hourlyInfoCardStyles.detail)}>
            <Skeleton className={cn(hourlyInfoCardStyles.detailHour, _hour.time)} />
            <Skeleton className={cn(hourlyInfoCardStyles.detailIcon, _hour.icon)} />
            <Skeleton className={cn(hourlyInfoCardStyles.detailValue, _hour.temp)} />
          </div>
        ))}
      </div>
    </div>
  );
};
