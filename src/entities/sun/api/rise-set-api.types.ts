type RiseSetInfoApiValue = string | number;

export interface RiseSetInfoItemType {
  locdate?: RiseSetInfoApiValue;
  location?: RiseSetInfoApiValue;
  locatioan?: RiseSetInfoApiValue;
  longitude?: RiseSetInfoApiValue;
  latitude?: RiseSetInfoApiValue;
  sunrise?: RiseSetInfoApiValue;
  suntransit?: RiseSetInfoApiValue;
  sunset?: RiseSetInfoApiValue;
  moonrise?: RiseSetInfoApiValue;
  moontransit?: RiseSetInfoApiValue;
  moonset?: RiseSetInfoApiValue;
  civilm?: RiseSetInfoApiValue;
  civile?: RiseSetInfoApiValue;
  nautm?: RiseSetInfoApiValue;
  naute?: RiseSetInfoApiValue;
  astm?: RiseSetInfoApiValue;
  aste?: RiseSetInfoApiValue;
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
