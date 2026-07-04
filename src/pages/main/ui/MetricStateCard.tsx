import { cn } from "@/shared/lib/cn";
import { ErrorCode } from "@/shared/ui/error-code";
import { Icon, type IconName } from "@/shared/ui/icon";

type MetricStateTone = "neutral" | "info";

const metricStateToneClass: Record<
  MetricStateTone,
  {
    root: string[];
    icon: string[];
  }
> = {
  neutral: {
    root: [
      "border-[var(--line)]",
      "bg-[var(--surface-soft)]",
    ],
    icon: [
      "border-[var(--color-slate-200)]",
      "bg-white/80",
      "text-[var(--text-sub)]",
    ],
  },
  info: {
    root: [
      "border-[var(--color-blue-100)]",
      "bg-[var(--color-blue-50)]",
    ],
    icon: [
      "border-[var(--color-blue-200)]",
      "bg-white/80",
      "text-[var(--color-blue-700)]",
    ],
  },
};

export type MetricStateCardProps = {
  title: string;
  description: string;
  code?: string | null;
  iconName?: IconName;
  tone?: MetricStateTone;
};

export const MetricStateCard = ({
  title,
  description,
  code,
  iconName = "cloudAlert",
  tone = "neutral",
}: MetricStateCardProps) => {
  const toneClass = metricStateToneClass[tone];

  return (
    <div
      className={cn(
        "mt-6 flex min-h-[9rem] flex-1 flex-col items-center justify-center rounded-2xl border px-5 py-6 text-center",
        toneClass.root,
      )}
    >
      <span className={cn("grid h-11 w-11 place-items-center rounded-full border", toneClass.icon)}>
        <Icon name={iconName} size={"md"} tone={"current"} />
      </span>
      <p className={cn("mt-3 text-sm font-extrabold leading-5 text-[var(--text-main)]")}>
        {title}
      </p>
      <p
        className={cn(
          "mt-1.5 max-w-sm break-words whitespace-pre-line text-sm leading-6 text-[var(--text-sub)]",
        )}
      >
        {description}
        <ErrorCode code={code} />
      </p>
    </div>
  );
};
