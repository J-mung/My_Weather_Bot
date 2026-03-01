export const bookmarkPageStyles = {
  page: "space-y-6",
  remainSlotWrap:
    "flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-5 py-4 shadow-sm",
  remainSlotContent: "text-sm font-semibold text-[var(--text-main)]",

  bookmarkListNodata:
    "rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-5 py-10 text-center text-sm text-[var(--text-sub)]",

  bookmarkListWrap: "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3",
  bookmarkCard:
    "h-36 grid grod-cols-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
  bookmarkCardTitle: "block text-xl font-bold leading-tight text-[var(--text-main)]",
  bookmarkCardTemp: "mt-2 block text-sm text-[var(--text-sub)]",

  bookmarkCardCaption: "relative flex justify-between mt-5",
  bookmarkMenuWrap: "",
  bookmarkMenuTrigger:
    "h-8 w-8 rounded-xl border border-[var(--line)] bg-white text-lg leading-none text-[var(--text-sub)] transition hover:bg-slate-100",
  bookmarkMenuPanel:
    "absolute top-10 right-0 z-10 w-32 rounded-xl border border-[var(--line)] bg-white p-1 shadow-lg",
  bookmarkMenuItem:
    "w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-[var(--text-main)] transition hover:bg-slate-100",
  bookmarkMenuItemDanger:
    "w-full rounded-lg border border-red-300 px-3 py-2 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50",

  bookmarkEditInput:
    "w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--text-main)] outline-none ring-[var(--accent)] transition focus:ring-2",
  bookmarkEditButtonList: "mt-4 flex gap-2",
  bookmarkEditSaveButton:
    "rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90",
  bookmarkEditCancleButton:
    "rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--text-main)] transition hover:bg-slate-50",
} as const;
