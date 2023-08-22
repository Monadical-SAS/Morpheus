import { CSSProperties, ReactNode } from "react";
import Footer from "@/components/Footer/Footer";
import Navbar from "@/components/Navbar/Navbar";
import styles from "./MainLayout.module.scss";
import PrivateRoute from "@/components/Auth/PrivateRoute/PrivateRoute";

interface MainContainerProps {
  children: ReactNode;
  style?: CSSProperties;
  showFooter?: boolean;
}

export const MainLayout = (props: MainContainerProps) => {
  return (
    <div className={styles.mainLayout}>
      <Navbar showBrand={true} />

      <main className={styles.mainContent} style={props.style}>
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
