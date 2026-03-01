import { NavLink } from "react-router-dom";
import { headerClassStyles } from "./styles";

export default function Header() {
  const links = [
    { key: 1, name: "Main", url: "/" },
    { key: 2, name: "Search", url: "/search" },
    { key: 3, name: "bookmark", url: "/bookmark" },
  ];

  return (
    <header className={headerClassStyles.shell} role="banner">
      <div className={headerClassStyles.container}>
        <NavLink className={headerClassStyles.brandLink} to="/">
          <span className={headerClassStyles.brandIcon}>☁</span>
          <span>MyWeatherBot</span>
        </NavLink>

        <nav className={headerClassStyles.navWrap}>
          {links.map((_link) => (
            <NavLink
              key={_link.key}
              className={({ isActive }) =>
                `${headerClassStyles.navItemBase} ${isActive ? headerClassStyles.navItemActive : headerClassStyles.navItemInactive}`
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
