import React, { CSSProperties } from "react";
import Loader from "../../Loaders/LoaderCircle/Loader";
import styles from "./ButtonSecondary.module.scss";

interface ButtonSecondaryProps {
  loading: boolean;
  disabled?: boolean;
  text: string;
  onClick: (event?: any) => any;
  styles?: CSSProperties;
  className?: any;
  icon?: any;
}

const ButtonSecondary = (props: ButtonSecondaryProps) => {
  return (
    <button
      style={props.styles}
      disabled={props.disabled || props.loading}
      onClick={props.onClick}
      className={`${styles.buttonSecondary} ${
        props.disabled && styles.disabled
      } ${props.className}`}
    >
      {props.loading ? (
        <Loader
          isLoading={props.loading}
          color={"white"}
          width={30}
          height={30}
        />
      ) : (
        <span className="base-1 white">
          {props.icon && props.icon}
          {props.text}
        </span>
      )}
    </button>
  );
};

export default ButtonSecondary;
