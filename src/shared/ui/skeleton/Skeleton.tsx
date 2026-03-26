import { cn } from "@/shared/lib/cn";
import { skeletonRoundedStyles, skeletonStyles } from "./styles";
import { type SkeletonProps } from "./types";
export const Skeleton = ({ className, rounded = "md", ...props }: SkeletonProps) => {
  return (
    <div className={cn(skeletonStyles.base, skeletonRoundedStyles[rounded], className)} {...props}>
      <div className={cn(skeletonStyles.shimmer)} />
    </div>
  );
};
