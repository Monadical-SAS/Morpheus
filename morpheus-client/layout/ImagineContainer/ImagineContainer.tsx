import { ReactNode } from "react";
import Navbar from "../../components/Navbar/Navbar";
import ImagineMenu from "../../components/ImagineMenu/ImagineMenu";
import ImagineInput from "@/components/ImagineInput/ImagineInput";
import PrivateRoute from "@/components/Auth/PrivateRoute/PrivateRoute";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { MOBILE_SCREEN_WIDTH } from "@/utils/constants";
import styles from "./ImagineContainer.module.scss";

interface MainContainerProps {
  children: ReactNode;
  formValid: boolean;
  handleGenerate: () => void;
}

const ImagineContainer = (props: MainContainerProps) => {
  const { width } = useWindowDimensions();
  const isMobile = width < MOBILE_SCREEN_WIDTH;

  const ImagineInputInstance = (
    <ImagineInput
      isFormValid={props.formValid}
      handleGenerate={props.handleGenerate}
    />
  );

  return (
    <PrivateRoute>
      <div className={styles.imagineContainer}>
        {!isMobile && <ImagineMenu />}

        <div className={styles.imagineContent}>
          <Navbar />

          <main className={styles.mainContent}>
            {isMobile && <ImagineMenu />}
            {isMobile && ImagineInputInstance}
            {props.children}
          </main>

          {!isMobile && ImagineInputInstance}
        </div>
      </div>
    </PrivateRoute>
  );
};

export default ImagineContainer;
