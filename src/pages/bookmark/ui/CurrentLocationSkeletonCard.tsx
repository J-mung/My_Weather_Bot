import { cn } from "@/shared/lib/cn";
import { Skeleton } from "@/shared/ui/skeleton";
import { bookmarkCurrentLocationStyles } from "./styles";

export const CurrentLocationSkeletonCard = () => (
  <div className={cn(bookmarkCurrentLocationStyles.card)}>
    <div className={cn(bookmarkCurrentLocationStyles.header)}>
      <div className={"min-w-0 flex-1"}>
        <Skeleton className={"h-4 w-36"} />
        <Skeleton className={"mt-3 h-10 w-full max-w-80"} />
      </div>
      <Skeleton rounded={"full"} className={"h-14 w-14 shrink-0"} />
    </div>

    <div className={cn(bookmarkCurrentLocationStyles.body)}>
      <Skeleton className={"h-5 w-32"} />
      <Skeleton className={"mt-3 h-8 w-full max-w-80"} />
    </div>
  </div>
);
