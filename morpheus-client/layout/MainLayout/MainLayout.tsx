import { CSSProperties, ReactNode } from "react";
import Footer from "@/components/Footer/Footer";
import Navbar from "@/components/Navbar/Navbar";
import PrivateRoute from "@/components/Auth/PrivateRoute/PrivateRoute";

interface MainContainerProps {
  children: ReactNode;
  style?: CSSProperties;
  showFooter?: boolean;
}

export const MainLayout = (props: MainContainerProps) => {
  return (
    <div className="w-full max-w-[100vw] h-full flex flex-col items-center bg-[#14172D] overflow-y-auto">
      <Navbar showBrand={true} />

      <main className="w-full flex flex-col items-center flex-auto" style={props.style}>
        {props.children}
      </main>

      {props.showFooter && <Footer />}
    </div>
  );
};

export const MainLayoutPrivate = (props: MainContainerProps) => {
  return (
    <PrivateRoute>
      <MainLayout {...props}>{props.children}</MainLayout>
    </PrivateRoute>
  );
};
