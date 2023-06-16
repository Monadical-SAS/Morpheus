import React, { CSSProperties, Fragment, ReactNode } from "react";
import { buildStringFromArray } from "@/utils/strings";
import { getInputValidators } from "../validators";
import styles from "../Input.module.scss";

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
      <div className={styles.inputIconContainer} style={props.styles}>
        {props.label && (
          <label htmlFor={props.id} className="base-2 white">
            {props.label}
          </label>
        )}

        {props.iconLeft && (
          <span className={styles.iconLeft}>{props.iconLeft}</span>
        )}

        <input
          id={props.id}
          type="text"
          placeholder={props.placeholder}
          value={props.text.value}
          disabled={props.disabled}
          onChange={(event) => handleTextChange(event)}
          className={`${props.iconLeft && styles.pLeft} ${
            props.iconRight && styles.pRight
          }`}
        />

        {props.iconRight && (
          <span className={styles.iconRight}>{props.iconRight}</span>
        )}
      </div>

      <small className={styles.error}>
        {buildStringFromArray(props.text.validators)}
      </small>
    </Fragment>
  );
};

export default InputText;
