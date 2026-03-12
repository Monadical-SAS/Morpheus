import React, { CSSProperties } from "react";

interface BrandProps {
  onClick?: () => void;
  styles?: CSSProperties;
}

const Brand = (props: BrandProps) => {
  return (
    <h2
      onClick={props.onClick}
      className="morpheus-title"
      style={props.styles}
    >
      Morpheus Admin
    </h2>
  );
};

export default Brand;
