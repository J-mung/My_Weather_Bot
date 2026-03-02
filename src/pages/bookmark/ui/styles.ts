export const bookmarkPageStyles = {
  page: "space-y-5",
  remainSlotWrap:
    "flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 shadow-lg shadow-gray-500/25",
  remainSlotContent: "text-sm font-semibold text-[var(--text-main)]",

  bookmarkListNodata:
    "rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-5 py-10 text-center text-sm text-[var(--text-sub)]",

  bookmarkListWrap: "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3",
  bookmarkCard:
    "rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm transition cursor-pointer hover:shadow-md",
  bookmarkCardHeader: "flex items-start justify-between gap-3",
  bookmarkCardTitle: "block text-xl font-bold leading-tight text-[var(--text-main)]",
  bookmarkCardLocation: "mt-1 block text-sm text-[var(--text-sub)]",
  bookmarkCardTemp: "block text-xs text-[var(--text-sub)]",

  bookmarkCardCaption: "",
  bookmarkCardAction: "mt-3 flex items-center justify-end gap-2",

  bookmarkMenuWrap: "relative",
  bookmarkMenuTrigger:
    "h-8 w-8 rounded-xl border border-[var(--line)] bg-white text-lg leading-none text-[var(--text-sub)] transition cursor-pointer hover:bg-slate-100",
  bookmarkMenuPanel:
    "absolute top-10 right-0 z-10 w-32 rounded-xl border border-[var(--line)] bg-white p-1 shadow-lg",
  bookmarkMenuItem:
    "w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-[var(--text-main)] transition cursor-pointer hover:bg-slate-100",
  bookmarkMenuItemDanger:
    "w-full rounded-lg border border-red-300 px-3 py-2 text-left text-sm font-semibold text-red-600 transition cursor-pointer hover:bg-red-50",
} as const;

export const bookmarkEditStyles = {
  bookmarkEditForm: "flex h-full flex-col justify-between",
  bookmarkEditInput:
    "w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--text-main)] outline-none ring-[var(--accent)] transition focus:ring-2",
  bookmarkEditButtonList: "mt-4 flex gap-2 justify-end",
  bookmarkEditSaveButton:
    "rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white transition cursor-pointer hover:opacity-90",
  bookmarkEditCancleButton:
    "rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--text-main)] transition cursor-pointer hover:bg-slate-50",
};

export const bookmarkSummaryStyles = {
  summaryWrap: "mt-4",
  summaryMainContent: "text-4xl font-semibold text-[var(--text-main)]",
  summarySubContent: "mt-2 text-base text-[var(--text-sub)]",
  summaryNodata: "mt-2 text-sm text-red-500",
};
