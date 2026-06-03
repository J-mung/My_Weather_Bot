export const layoutClassNameStyles = {
  container: [
    "min-h-screen",
    "min-w-[var(--app-min-width)]",
    "w-full",
    "flex",
    "flex-col",
    "bg-[var(--bg)]",
    "text-[var(--text-main)]",
  ],
  content: [
    "mx-auto",
    "min-w-0",
    "w-full",
    "max-w-6xl",
    "flex-1",
    "px-4",
    "py-6",
    "pb-24",
    "sm:px-6",
    "sm:py-8",
    "sm:pb-8",
  ],
} as const;
