import { ReactNode } from "react";
import Navbar from "../../components/Navbar/Navbar";
import ImagineMenu from "../../components/ImagineMenu/ImagineMenu";
import ImagineInput from "@/components/ImagineInput/ImagineInput";
import styles from "./ImagineContainer.module.scss";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { MOBILE_SCREEN_WIDTH } from "@/utils/constants";

interface MainContainerProps {
  children: ReactNode;
  formValid: boolean;
  handleGenerate: () => void;
}

const ImagineContainer = (props: MainContainerProps) => {
  const { width } = useWindowDimensions();
  const isMobile = width < MOBILE_SCREEN_WIDTH;

  return (
    <div className={styles.mainContainer}>
      {!isMobile && <ImagineMenu />}

      <div className={styles.container}>
        <Navbar />

        <main className={styles.main}>
          {isMobile && <ImagineMenu />}
          {props.children}
        </main>

        <ImagineInput
          isFormValid={props.formValid}
          handleGenerate={props.handleGenerate}
        />
      </div>
    </div>
  );
};

export default ImagineContainer;
