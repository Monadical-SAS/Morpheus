import { CSSProperties, ReactNode } from "react";
import Footer from "../../components/Footer/Footer";
import Navbar from "../../components/Navbar/Navbar";
import PrivateRoute from "@/components/Auth/PrivateRoute/PrivateRoute";
import styles from "./MainContainer.module.scss";

interface MainContainerProps {
  children: ReactNode;
  style?: CSSProperties;
  showFooter?: boolean;
}

export const MainContainer = (props: MainContainerProps) => {
  return (
    <div className={styles.mainContainer}>
      <Navbar showBrand={true} />

      <main className={styles.mainContent} style={props.style}>
        {props.children}
      </main>

      {props.showFooter && <Footer />}
    </div>
  );
};

export const MainContainerPrivate = (props: MainContainerProps) => {
  return (
    <PrivateRoute>
      <MainContainer {...props}>{props.children}</MainContainer>
    </PrivateRoute>
  );
};
