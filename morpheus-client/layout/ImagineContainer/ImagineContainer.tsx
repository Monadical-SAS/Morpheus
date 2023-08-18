import { ReactNode } from "react";
import Navbar from "../../components/Navbar/Navbar";
import ImagineMenu from "../../components/ImagineMenu/ImagineMenu";
import ImagineInput from "@/components/ImagineInput/ImagineInput";
import styles from "./ImagineContainer.module.scss";

interface MainContainerProps {
  children: ReactNode;
  formValid: boolean;
  handleGenerate: () => void;
}

const ImagineContainer = (props: MainContainerProps) => {
  return (
    <div className={styles.mainContainer}>
      <ImagineMenu />

      <div className={styles.container}>
        <Navbar />

        <main>{props.children}</main>

        <ImagineInput
          isFormValid={props.formValid}
          handleGenerate={props.handleGenerate}
        />
      </div>
    </div>
  );
};

export default ImagineContainer;
