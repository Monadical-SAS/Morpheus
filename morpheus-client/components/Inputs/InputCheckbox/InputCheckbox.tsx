import React, { CSSProperties, Fragment } from "react";
import { buildStringFromArray } from "../../../utils/strings";
import { CheckIcon } from "../../icons/check";
import styles from "./InputCheckbox.module.scss";


export interface CheckboxState {
  value: boolean;
  validators?: (string | boolean)[];
}

interface InputCheckboxProps {
  id: string;
  label?: string;
  checked: CheckboxState;
  setChecked: (value: CheckboxState) => void;
  styles?: CSSProperties;
}

export const initializeCheckbox = (value: boolean): CheckboxState => {
  return {
    value: value,
    validators: [],
  };
};

const InputCheckbox = (props: InputCheckboxProps) => {
  const handleCheckboxChange = () => {
    props.setChecked({
      value: !props.checked.value,
      validators: [],
    });
  };

  return (
    <Fragment>
      <div
        className={styles.inputCheckboxContainer}
        style={props.styles}
        onClick={handleCheckboxChange}
      >
        <div
          className={`${styles.checkbox} ${
            props.checked.value && styles.checked
          }`}
        >
          {props.checked.value && <CheckIcon />}
        </div>

        {props.label && (
          <label className="caption-1 white" htmlFor={props.id}>
            {props.label}
          </label>
        )}
      </div>

      <small>{buildStringFromArray(props.checked.validators)}</small>
    </Fragment>
  );
};

export default InputCheckbox;