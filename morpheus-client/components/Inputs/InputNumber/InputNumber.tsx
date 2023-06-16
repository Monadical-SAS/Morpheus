import React, { CSSProperties, Fragment } from "react";
import { buildStringFromArray } from "@/utils/strings";
import { getInputNumberValidators, isNumber } from "../validators";
import styles from "../Input.module.scss";

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
      <div className={styles.inputContainer} style={props.containerStyles}>
        {props.label && (
          <label className="body-2 white" htmlFor={props.id}>
            {props.label}
          </label>
        )}

        <input
          id={props.id}
          type="number"
          value={props.number.value}
          disabled={props.disabled}
          onChange={(event) => handleNumberChange(event)}
          style={props.inputStyles}
          step={props.step || 1}
          min={props.minValue}
          max={props.maxValue}
        />

        {props.number.validators && (
          <small className={styles.error}>
            {buildStringFromArray(props.number.validators)}
          </small>
        )}
      </div>
    </Fragment>
  );
};

export default InputNumber;
