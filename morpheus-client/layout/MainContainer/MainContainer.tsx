import { CSSProperties, ReactNode } from "react";
import Navbar from "../../components/Navbar/Navbar";
import ImagineMenu from "../../components/ImagineMenu/ImagineMenu";
import Footer from "../../components/Footer/Footer";
import styles from "./MainContainer.module.scss";

interface MainContainerProps {
  showLeftBar?: boolean;
  children: ReactNode;
  style?: CSSProperties;
  showFooter?: boolean;
}

const MainContainer = (props: MainContainerProps) => {
  return (
    <div className={styles.mainContainer}>
      {props.showLeftBar && <ImagineMenu />}
      <div
        className={`${styles.container} ${props.showLeftBar && styles.leftBar}`}
      >
        <Navbar />
        <main className={styles.main} style={props.style}>
          {props.children}
        </main>

        {props.showFooter && <Footer />}
      </div>
    </div>
  );
};

export default MainContainer;
