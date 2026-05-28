import { cn } from "@/shared/lib/cn";

type ErrorCodeProps = {
  code: string | null | undefined;
  className?: string;
};

export const ErrorCode = ({ code, className }: ErrorCodeProps) => {
  if (!code) {
    return null;
  }

  return (
    <span
      className={cn(
        "mt-1 block text-xs font-bold tracking-[0.08em] text-[var(--text-muted)]",
        className,
      )}
    >
      에러 코드: <code className={cn("font-mono")}>{code}</code>
    </span>
  );
};
