export const searchPageStyles = {
  page: "space-y-5",
  searchWrap: "rounded-xl shadow-lg shadow-gray-500/25",
  searchInput:
    "w-full rounded-xl bg-[var(--surface)] px-4 py-3 text-sm outline-none ring-[var(--accent)] transition focus:ring-2",
  section: "mb-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm",
  candidate:
    "mb-3 flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm transition cursor-pointer hover:shadow-md",
  candidateContent: "min-w-0 cursor-pointer",
  candidateName: "truncate text-sm font-semibold text-[var(--text-main)]",
} as const;
