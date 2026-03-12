import React, { CSSProperties } from "react";
import Loader from "../../Loaders/LoaderCircle/Loader";

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
      className={`cursor-pointer box-border flex flex-row justify-center items-center p-4 gap-4 w-[526px] h-14 bg-[#252238] border border-[#312E47] rounded-lg flex-none flex-grow-0 max-md:w-full max-md:px-0 ${
        props.className || ""
      }`}
    >
      {props.loading ? (
        <Loader
          isLoading={props.loading}
          color={"white"}
          width={30}
          height={30}
        />
      ) : (
        <span className="base-1 white w-full flex justify-center items-center gap-4">
          {props.icon && props.icon}
          {props.text}
        </span>
      )}
    </button>
  );
};

export default ButtonSecondary;
