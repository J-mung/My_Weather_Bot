const path = "/icons";

export const iconRegistry = {
  addCircle: `${path}/icon_add_circle.svg`,
  arrowDown: `${path}/icon_arrow_downward.svg`,
  arrowUp: `${path}/icon_arrow_upward.svg`,
  bookmark: `${path}/icon_bookmark.svg`,
  bookmarkAdd: `${path}/icon_bookmark_add.svg`,
  cloudAlert: `${path}/icon_cloud_alert.svg`,
  cloud: `${path}/icon_cloud.svg`,
  delete: `${path}/icon_delete.svg`,
  edit: `${path}/icon_edit.svg`,
  menu: `${path}/icon_menu.svg`,
  moreHoriz: `${path}/icon_more_horiz.svg`,
  partlyCloudyDay: `${path}/icon_partly_cloudy_day.svg`,
  rainy: `${path}/icon_rainy.svg`,
  rainyHeavy: `${path}/icon_rainy_heavy.svg`,
  rainyLight: `${path}/icon_rainy_light.svg`,
  rainySnow: `${path}/icon_rainy_snow.svg`,
  refresh: `${path}/icon_refresh.svg`,
  search: `${path}/icon_search.svg`,
  snowing: `${path}/icon_snowing.svg`,
  snowingHeavy: `${path}/icon_snowing_heavy.svg`,
  waterDrop: `${path}/icon_water_drop.svg`,
  weatherMix: `${path}/icon_weather_mix.svg`,
  weatherSnowy: `${path}/icon_weather_snowy.svg`,
  wbSunny: `${path}/icon_wb_sunny.svg`,
} as const;

export type IconName = keyof typeof iconRegistry;
