import { cn } from "@/shared/lib/cn";
import { Skeleton } from "@/shared/ui/skeleton";
import { mainPageStyles } from "./styles";

type MetricSkeletonCardProps = {
  showBadge?: boolean;
  className?: string;
};

export const MetricSkeletonCard = ({ showBadge = false, className }: MetricSkeletonCardProps) => {
  return (
    <div className={cn(mainPageStyles.metricCard, className)} aria-hidden={"true"}>
      <div className={cn(mainPageStyles.metricHeader)}>
        <Skeleton className={"h-4 w-20"} />
        {showBadge && <Skeleton rounded={"full"} className={"h-5 w-12"} />}
      </div>
      <div className={cn(mainPageStyles.metricValue)}>
        <Skeleton className={"h-10 w-24"} />
      </div>
      <div className={cn(mainPageStyles.metricDescription)}>
        <Skeleton className={"h-4 w-full"} />
        <Skeleton className={"mt-2 h-4 w-4/5"} />
      </div>
    </div>
  );
};
