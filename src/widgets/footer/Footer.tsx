import { footerClassStyles } from "./styles";

export default function Footer() {
  return (
    <footer className={footerClassStyles.shell} role="contentinfo">
      <div className={footerClassStyles.container}>
        <span>© 2026 My-Weather-Bot</span>
        <span className={footerClassStyles.versionBadge}>v1.0</span>
      </div>
    </footer>
  );
}
