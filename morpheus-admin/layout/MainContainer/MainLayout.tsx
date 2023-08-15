import { CSSProperties, ReactNode } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import styles from "./MainLayout.module.scss";

interface MainContainerProps {
  children: ReactNode;
  style?: CSSProperties;
  showFooter?: boolean;
}

const MainLayout = (props: MainContainerProps) => {
  return (
    <div className={styles.mainContainer}>
      <Navbar />

      <main className={styles.main} style={props.style}>
        {props.children}
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
