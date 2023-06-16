import React, { CSSProperties } from "react";
import Loader from "../../Loaders/LoaderCircle/Loader";
import styles from "./ButtonPrimary.module.scss";

interface ButtonPrimaryProps {
  loading: boolean;
  disabled?: boolean;
  text: string;
  onClick: (event?: any) => any;
  styles?: CSSProperties;
  className?: any;
  loaderColor?: string;
}

const ButtonPrimary = (props: ButtonPrimaryProps) => {
  return (
    <button
      style={props.styles}
      disabled={props.disabled || props.loading}
      onClick={props.onClick}
      className={`${styles.buttonPrimary} ${
        props.disabled && styles.disabled
      } ${props.className}`}
    >
      {props.loading ? (
        <Loader
          isLoading={props.loading}
          color={props.loaderColor || "white"}
          width={30}
          height={30}
        />
      ) : (
        <span className="base-1 white">{props.text}</span>
      )}
    </button>
  );
};

export default ButtonPrimary;
