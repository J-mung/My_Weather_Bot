import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon";
import { NavLink } from "react-router-dom";
import { headerClassStyles } from "./styles";

export default function Header() {
  const links = [
    { key: 1, name: "홈", url: "/" },
    { key: 2, name: "검색", url: "/search" },
    { key: 3, name: "북마크", url: "/bookmark" },
  ];

  return (
    <header className={cn(headerClassStyles.shell)} role="banner">
      <div className={cn(headerClassStyles.container)}>
        <NavLink className={cn(headerClassStyles.brandLink)} to="/">
          <span className={cn(headerClassStyles.brandIcon)}>
            <Icon name={"cloud"} size={"lg"} />
          </span>
          <span>MyWeatherBot</span>
        </NavLink>

        <nav className={cn(headerClassStyles.navWrap)}>
          {links.map((_link) => (
            <NavLink
              key={_link.key}
              className={({ isActive }) =>
                `${cn(headerClassStyles.navItemBase)} ${isActive ? cn(headerClassStyles.navItemActive) : cn(headerClassStyles.navItemInactive)}`
              }
              to={_link.url}
            >
              {_link.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
