import React from "react";
import ImagineMenu from "@/components/ImagineMenu/ImagineMenu";
import Navbar from "@/components/Navbar/Navbar";
import PrivateRoute from "@/components/Auth/PrivateRoute/PrivateRoute";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import styles from "./ImagineLayout.module.scss";

interface ImagineContainerProps {
  children: React.ReactNode;
}

const ImagineLayout = (props: ImagineContainerProps) => {
  const { isMobile } = useWindowDimensions();

  return (
    <PrivateRoute>
      <div className={styles.imagineLayout}>
        {!isMobile && <ImagineMenu />}
        <div className={styles.imagineContent}>
          <Navbar />
          {props.children}
        </div>
      </div>
    </PrivateRoute>
  );
};

export default ImagineLayout;
