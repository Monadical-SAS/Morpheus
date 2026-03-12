import { CSSProperties, ReactNode } from "react";
import Navbar from "../../components/organisms/Navbar/Navbar";
import Footer from "../../components/molecules/Footer/Footer";

interface MainContainerProps {
  children: ReactNode;
  style?: CSSProperties;
  showFooter?: boolean;
}

const MainLayout = (props: MainContainerProps) => {
  return (
    <div className="w-screen h-screen flex flex-col relative overflow-y-auto">
      <Navbar />

      <main className="relative flex flex-auto" style={props.style}>
        {props.children}
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
