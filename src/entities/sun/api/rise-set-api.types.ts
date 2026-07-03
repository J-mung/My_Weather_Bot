export interface RiseSetInfoItemType {
  locdate?: string;
  location?: string;
  locatioan?: string;
  longitude?: string;
  latitude?: string;
  sunrise?: string;
  suntransit?: string;
  sunset?: string;
  moonrise?: string;
  moontransit?: string;
  moonset?: string;
  civilm?: string;
  civile?: string;
  nautm?: string;
  naute?: string;
  astm?: string;
  aste?: string;
}

export interface RiseSetInfoResponseType {
  response: {
    header: {
      resultCode?: string;
      resultMsg?: string;
    };
    body?: {
      items?: {
        item?: RiseSetInfoItemType | RiseSetInfoItemType[];
      };
    };
  };
}
