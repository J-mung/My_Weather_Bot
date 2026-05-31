import { KakaoRegionMap } from "@/shared/ui/map";
import { useSearchParams } from "react-router-dom";
import { mapPageStyles } from "./styles";

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const location = searchParams.get("location")?.trim() ?? "";

  return (
    <KakaoRegionMap
      location={location}
      title={"날씨 지도"}
      mapClassName={mapPageStyles.mapCanvas.join(" ")}
      className={mapPageStyles.page.join(" ")}
      enableRadarView
    />
  );
}
