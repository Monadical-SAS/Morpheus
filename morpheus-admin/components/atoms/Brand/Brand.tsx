import React, { CSSProperties } from "react";
import styles from "./Brand.module.scss";

interface BrandProps {
  onClick?: () => void;
  styles?: CSSProperties;
}

const Brand = (props: BrandProps) => {
  return (
    <h2
      onClick={props.onClick}
      className={`headline-1 ${styles.morpheusTitle}`}
      style={props.styles}
    >
      Morpheus
    </h2>
  );
};

export default Brand;
