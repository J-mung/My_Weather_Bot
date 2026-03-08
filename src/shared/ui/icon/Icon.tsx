import { cn } from "@/shared/lib/cn";
import { iconRegistry } from "./icon.registry";
import type { IconProps } from "./icon.types";
import { iconVariants } from "./icon.variants";

export const Icon = ({ name, size, tone, className, ...props }: IconProps) => {
  return (
    <span
      aria-hidden={"true"}
      className={cn(iconVariants({ size, tone }), className)}
      style={{
        mask: `url(${iconRegistry[name]}) center / contain no-repeat`,
        WebkitMask: `url(${iconRegistry[name]}) center / contain no-repeat`,
        backgroundColor: "currentColor", // 별도의 tone을 지정하지 않으면 버튼의 텍스트 색상을 상속
      }}
      {...props}
    />
  );
};
