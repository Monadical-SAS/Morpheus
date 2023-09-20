import { CSSProperties, ReactNode } from "react";
import Navbar from "../../components/organisms/Navbar/Navbar";
import Footer from "../../components/molecules/Footer/Footer";
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
