import { cn } from "@/shared/lib/cn";
import Footer from "@/widgets/footer/Footer";
import Header from "@/widgets/header/Header";
import { Outlet } from "react-router-dom";
import { layoutClassNameStyles } from "./styles";

export const MainLayout = () => {
  return (
    <div className={cn(layoutClassNameStyles.container)}>
      <Header />

      <main id="main" role="main" className={cn(layoutClassNameStyles.content)}>
        <div>{<Outlet />}</div>
      </main>

      <Footer />
    </div>
  );
};
