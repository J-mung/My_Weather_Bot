import Footer from "@/widgets/Footer";
import Header from "@/widgets/Header";
import { Outlet } from "react-router-dom";

export const MainLayout = () => {
  return (
    <div>
      <Header />

      <main id="main" role="main">
        <div>{<Outlet />}</div>
      </main>

      <Footer />
    </div>
  );
};
