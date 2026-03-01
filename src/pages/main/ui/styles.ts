export const mainPageStyles = {
  page: "space-y-5",
  searchWrap: "rounded-xl shadow-lg shadow-gray-500/25",
  searchInput:
    "w-full rounded-xl bg-[var(--surface)] px-4 py-3 text-sm outline-none ring-[var(--accent)] transition focus:ring-2",
  dailySummary: "rounded-xl bg-white p-6 shadow-lg shadow-gray-500/25",
  dailySummarySub: "mt-2 text-blue-100",
  section: "rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm",
  sectionTitle: "mb-3 text-sm font-bold tracking-wide text-[var(--text-sub)] uppercase",
} as const;
