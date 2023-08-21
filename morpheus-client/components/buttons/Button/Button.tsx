import React, { CSSProperties } from "react";
import Loader from "../../Loaders/LoaderCircle/Loader";
import styles from "./Button.module.scss";
import { cn } from "@/utils/styles";

const buttonVariants = {
  primary: {
    button: {
      active: styles.buttonPrimary,
      disabled: styles.disabled,
    },
    text: {
      active: "base-1 white",
    },
  },
  secondary: {
    button: {
      active: styles.buttonSecondary,
      disabled: styles.disabled,
    },
    text: {
      active: "base-1 white",
    },
  },
  tertiary: {
    button: {
      active: styles.buttonTertiary,
      disabled: styles.disabled,
    },
    text: {
      active: "base-1",
    },
  },
};

type buttonVariant = keyof typeof buttonVariants;

const getVariantStyle = (variant?: buttonVariant) => {
  return buttonVariants[variant ? variant : "primary"];
};

interface ButtonProps {
  loading: boolean;
  disabled?: boolean;
  text: string;
  onClick: (event?: any) => any;
  styles?: CSSProperties;
  className?: any;
  loaderColor?: string;
  icon?: any;
  variant?: buttonVariant;
}

const Button = (props: ButtonProps) => {
  return (
    <button
      style={props.styles}
      disabled={props.disabled || props.loading}
      onClick={props.onClick}
      className={cn(
        getVariantStyle(props.variant).button.active,
        props.disabled && getVariantStyle(props.variant).button.disabled,
        props.className
      )}
    >
      {props.loading ? (
        <Loader isLoading={props.loading} color={props.loaderColor || "white"} width={30} height={30} />
      ) : (
        <span className={getVariantStyle(props.variant).text.active}>
          {props.icon && props.icon}
          {props.text}
        </span>
      )}
    </button>
  );
};

export default Button;
