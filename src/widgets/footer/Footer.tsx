import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon";
import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { footerClassStyles } from "./styles";

export default function Footer() {
  const [isMobileNavVisible, setIsMobileNavVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 10만큼 이동이 감지되면 숨김
      if (currentScrollY <= 10) {
        setIsMobileNavVisible(true);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollYRef.current) {
        setIsMobileNavVisible(false);
      } else if (currentScrollY < lastScrollYRef.current) {
        setIsMobileNavVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  return (
    <>
      <footer className={cn(footerClassStyles.desktopShell)} role="contentinfo">
        <div className={cn(footerClassStyles.desktopContainer)}>
          <span>© 2026 My-Weather-Bot</span>
          <span className={cn(footerClassStyles.versionBadge)}>v1.0</span>
        </div>
      </footer>

      <nav
        aria-label="Mobile navigation"
        className={cn(
          footerClassStyles.mobileNavShell,
          isMobileNavVisible
            ? footerClassStyles.mobileNavVisible
            : footerClassStyles.mobileNavHidden,
        )}
      >
        <div className={cn(footerClassStyles.mobileNavContainer)}>
          <NavLink
            to="/bookmark"
            className={({ isActive }) =>
              cn(
                `${footerClassStyles.mobileNavItemBase} ${isActive ? footerClassStyles.mobileNavItemActive : footerClassStyles.mobileNavItemInactive}`,
              )
            }
          >
            <Icon name="bookmark" size={"lg"} tone={"default"} />
          </NavLink>
          <NavLink
            to="/search"
            className={({ isActive }) =>
              cn(
                `${footerClassStyles.mobileNavItemBase} ${isActive ? footerClassStyles.mobileNavItemActive : footerClassStyles.mobileNavItemInactive}`,
              )
            }
          >
            <Icon name={"search"} size={"lg"} tone={"default"} />
          </NavLink>
        </div>
      </nav>
    </>
  );
}
