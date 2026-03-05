import React, { CSSProperties } from "react";
import Loader from "../../Loaders/LoaderCircle/Loader";

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
      className={`w-[526px] max-w-full h-12 box-border flex flex-row justify-center items-center gap-4 px-[57px] cursor-pointer bg-[#B3005E] border-none rounded-lg max-md:w-full max-md:px-0 ${
        props.disabled ? "!bg-[#6D6D94] cursor-not-allowed" : ""
      } ${props.className || ""}`}
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
