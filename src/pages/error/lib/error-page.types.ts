import type { AppErrorMeta } from "@/shared/api/types";
import type { IconName } from "@/shared/ui/icon";

export type ErrorPageProps = {
  notFound?: boolean;
};

export type ErrorPageRetryTarget = "home" | "search" | "reload";

export type ErrorPagePrimaryAction = {
  label: string;
  loadingLabel: string;
  iconName: IconName;
  shouldSpinIcon: boolean;
};

export type ErrorPageResolution = {
  meta: AppErrorMeta;
  retryTarget: ErrorPageRetryTarget;
};
