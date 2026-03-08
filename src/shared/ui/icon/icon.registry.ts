const path = "/icons";

export const iconRegistry = {
  addCircle: `${path}/icon_add_circle.svg`,
  bookmarkAdd: `${path}/icon_bookmark_add.svg`,
  bookmard: `${path}/icon_bookmark.svg`,
  delete: `${path}/icon_delete.svg`,
  edit: `${path}/icon_edit.svg`,
  menu: `${path}/icon_menu.svg`,
  moreHoriz: `${path}/icon_more_horiz.svg`,
} as const;

export type IconName = keyof typeof iconRegistry;
