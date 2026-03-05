import React, { CSSProperties, Fragment, ReactNode, useEffect } from "react";
import { buildStringFromArray } from "@/utils/strings";
import { getInputValidators } from "../validators";

export interface TextState {
  value: string;
  validators?: (string | boolean)[];
}

export const initialText = {
  value: "",
  validators: [],
};

export const initializeText = (value: string) => {
  return {
    value: value,
    validators: [],
  };
};

export interface InputTextProps {
  id?: string;
  label?: string;
  placeholder?: string;
  text: TextState;
  setText?: (text: TextState) => void;
  minValueLength?: number;
  maxValueLength?: number;
  isRequired?: boolean;
  disabled?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  styles?: CSSProperties;
}

const InputText = (props: InputTextProps) => {
  const handleTextChange = (event: any) => {
    event.persist();
    const value = event.target.value;
    props.setText &&
      props.setText({
        value: value,
        validators: getInputValidators(
          value,
          props.isRequired,
          props.minValueLength,
          props.maxValueLength
        ),
      });
  };

  return (
    <Fragment>
      <div className="w-full flex flex-col box-border relative" style={props.styles}>
        {props.label && (
          <label htmlFor={props.id} className="base-2 white mb-[10px]">
            {props.label}
          </label>
        )}

        {props.iconLeft && (
          <span className="absolute top-4 left-4">{props.iconLeft}</span>
        )}

        <input
          id={props.id}
          type="text"
          placeholder={props.placeholder}
          disabled={props.disabled}
          onChange={(event) => handleTextChange(event)}
          className={`w-full flex-1 outline-none h-12 min-h-[48px] px-5 rounded-lg text-[#8B90B2] border border-[#312E47] bg-[#252238] focus:border-[#d9006d] transition-all duration-500 placeholder:text-[#8B90B2] ${props.iconLeft ? "pl-11" : ""} ${props.iconRight ? "pr-11" : ""}`}
          value={props.text.value}
        />

        {props.iconRight && (
          <span className="absolute top-3 right-4 cursor-pointer">{props.iconRight}</span>
        )}
      </div>

      <small className="caption-1 text-red-500">
        {buildStringFromArray(props.text.validators)}
      </small>
    </Fragment>
  );
};

export default InputText;
