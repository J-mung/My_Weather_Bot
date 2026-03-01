export const headerClassStyles = {
  shell:
    "sticky top-0 z-20 border-b border-[var(--line)] bg-[color:var(--surface)]/90 backdrop-blur",
  container: "mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6",
  brandLink: "flex items-center gap-2 text-lg font-extrabold tracking-tight",
  brandIcon: "grid size-8 place-items-center rounded-xl bg-[var(--accent)] text-lg text-white",
  navWrap: "flex items-center gap-1 rounded-xl bg-[var(--surface-soft)] p-1",
  navItemBase: "rounded-lg px-3 py-1.5 text-sm font-semibold transition",
  navItemActive: "bg-white text-[var(--text-main)] shadow-sm",
  navItemInactive: "text-[var(--text-sub)] hover:text-[var(--text-main)]",
} as const;
