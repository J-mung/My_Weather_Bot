import { cn } from "@/shared/lib/cn";
import { ErrorCode } from "@/shared/ui/error-code";
import { Icon, type IconName } from "@/shared/ui/icon";

type MetricStateTone = "neutral" | "info";

const DEFAULT_METRIC_STATE_IMAGE_SRC = "/images/no_data_image.png";

const getDescriptionSentences = (description: string): string[] =>
  description
    .split(/\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

const metricStateToneClass: Record<
  MetricStateTone,
  {
    root: string[];
    icon: string[];
  }
> = {
  neutral: {
    root: ["border-[var(--line)]", "bg-[#F8FAFC]"],
    icon: ["border-[var(--color-slate-200)]", "bg-white/80", "text-[var(--text-sub)]"],
  },
  info: {
    root: ["border-[var(--color-blue-100)]", "bg-[#F8FAFC]"],
    icon: ["border-[var(--color-blue-200)]", "bg-white/80", "text-[var(--color-blue-700)]"],
  },
};

export type MetricStateCardProps = {
  title: string;
  description: string;
  code?: string | null;
  codeLabel?: string;
  iconName?: IconName;
  imageAlt?: string;
  imageSrc?: string | null;
  tone?: MetricStateTone;
};

export const MetricStateCard = ({
  title,
  description,
  code,
  codeLabel,
  iconName = "cloudAlert",
  imageAlt = "",
  imageSrc = DEFAULT_METRIC_STATE_IMAGE_SRC,
  tone = "neutral",
}: MetricStateCardProps) => {
  const toneClass = metricStateToneClass[tone];
  const hasImage = Boolean(imageSrc);
  const descriptionSentences = getDescriptionSentences(description);

  return (
    <div
      className={cn(
        "mt-6 flex min-h-[9rem] flex-1 flex-col items-center justify-center rounded-2xl border px-5 py-6 text-center",
        toneClass.root,
      )}
    >
      {hasImage ? (
        <img
          src={imageSrc ?? undefined}
          alt={imageAlt}
          width={180}
          className={cn("aspect-video w-[180px] max-w-full object-contain")}
          loading={"lazy"}
          decoding={"async"}
        />
      ) : (
        <span
          className={cn("grid h-11 w-11 place-items-center rounded-full border", toneClass.icon)}
        >
          <Icon name={iconName} size={"md"} tone={"current"} />
        </span>
      )}
      <span
        className={cn(
          hasImage ? "mt-4" : "mt-3",
          "block text-sm font-extrabold leading-5 text-[var(--text-main)]",
        )}
      >
        {title}
      </span>
      <span
        className={cn(
          "mt-1.5 flex max-w-md flex-col gap-0.5 text-sm leading-6 text-[var(--text-sub)]",
        )}
      >
        {descriptionSentences.map((sentence, index) => (
          <span
            key={`${sentence}-${index}`}
            className={cn("block [overflow-wrap:normal] [word-break:keep-all]")}
          >
            {sentence}
          </span>
        ))}
        <ErrorCode code={code} label={codeLabel} />
      </span>
    </div>
  );
};
