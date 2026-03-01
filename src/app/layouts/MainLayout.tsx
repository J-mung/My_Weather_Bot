import Footer from "@/widgets/footer/Footer";
import Header from "@/widgets/header/Header";
import { Outlet } from "react-router-dom";
import { layoutClassNameStyles } from "./styles";

export const MainLayout = () => {
  return (
    <div className={layoutClassNameStyles.container}>
      <Header />

      <main id="main" role="main" className={layoutClassNameStyles.content}>
        <div>{<Outlet />}</div>
      </main>

      <Footer />
    </div>
  );
};
