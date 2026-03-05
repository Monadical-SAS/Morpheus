import React, { CSSProperties, Fragment } from "react";
import { buildStringFromArray } from "@/utils/strings";
import { getInputNumberValidators, isNumber } from "../validators";

export interface NumberState {
  value: number;
  validators?: (string | boolean)[];
}

export const initialNumber = {
  value: 0,
  validators: [],
};

export const initializeNumber = (value: number) => {
  return {
    value: value,
    validators: [],
  };
};

export interface InputNumberProps {
  id?: string;
  label?: string;
  number: NumberState;
  setNumber?: (number: NumberState) => void;
  step?: number;
  minValue?: number;
  maxValue?: number;
  isRequired?: boolean;
  disabled?: boolean;
  containerStyles?: CSSProperties;
  inputStyles?: CSSProperties;
}

const InputNumber = (props: InputNumberProps) => {
  const handleNumberChange = (event: any) => {
    event.persist();
    const value = event.target.value;
    if (isNumber(value) && props.setNumber) {
      props.setNumber({
        value: value,
        validators: getInputNumberValidators(
          value,
          props.isRequired,
          props.minValue,
          props.maxValue
        ),
      });
    }
  };

  return (
    <Fragment>
      <div className="w-full flex flex-col box-border relative" style={props.containerStyles}>
        {props.label && (
          <label className="body-2 white mb-[10px]" htmlFor={props.id}>
            {props.label}
          </label>
        )}

        <input
          id={props.id}
          type="number"
          value={props.number.value}
          disabled={props.disabled}
          onChange={(event) => handleNumberChange(event)}
          className="w-full flex-1 outline-none h-12 min-h-[48px] px-5 rounded-lg text-[#8B90B2] border border-[#312E47] bg-[#252238] focus:border-[#d9006d] transition-all duration-500 placeholder:text-[#8B90B2]"
          style={props.inputStyles}
          step={props.step || 1}
          min={props.minValue}
          max={props.maxValue}
        />

        {props.number.validators && (
          <small className="caption-1 text-red-500">
            {buildStringFromArray(props.number.validators)}
          </small>
        )}
      </div>
    </Fragment>
  );
};

export default InputNumber;
