import { CurrentWeatherTester } from "@/features/get-current-weather/ui/CurrentWeatherTester";
import { ShortFcstWeatherTester } from "@/features/get-current-weather/ui/ShortFcstWeatherTester";

export default function MainPage() {
  return (
    <div>
      메인화면 입니다.
      <div>hello world</div>
      <CurrentWeatherTester />
      <ShortFcstWeatherTester />
    </div>
  );
}
