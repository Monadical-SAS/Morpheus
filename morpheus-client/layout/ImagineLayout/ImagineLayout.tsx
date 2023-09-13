import React from "react";
import ImagineMenu from "@/components/ImagineMenu/ImagineMenu";
import Navbar from "@/components/Navbar/Navbar";
import PrivateRoute from "@/components/Auth/PrivateRoute/PrivateRoute";
import { Desktop } from "@/components/ResponsiveHandlers/Responsive";
import styles from "./ImagineLayout.module.scss";

interface ImagineContainerProps {
  children: React.ReactNode;
}

const ImagineLayout = (props: ImagineContainerProps) => {
  return (
    <PrivateRoute>
      <div className={styles.imagineLayout}>
        <Desktop>
          <ImagineMenu />
        </Desktop>
        <div className={styles.imagineContent}>
          <Navbar />
          {props.children}
        </div>
      </div>
    </PrivateRoute>
  );
};

export default ImagineLayout;
