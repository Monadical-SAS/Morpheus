import React, { CSSProperties, Fragment } from "react";
import { buildStringFromArray } from "../../../utils/strings";
import { CheckIcon } from "../../icons/check";


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
        className="min-w-[250px] flex flex-row items-center cursor-pointer"
        style={props.styles}
        onClick={handleCheckboxChange}
      >
        <div
          className={`w-4 h-4 flex flex-row justify-center items-center rounded ${props.checked.value ? "bg-[#B3005E] border-0" : "text-[#8B90B2] border border-[#8B90B2] bg-[#252238]"}`}
        >
          {props.checked.value && <CheckIcon />}
        </div>

        {props.label && (
          <label className="caption-1 white ml-2" htmlFor={props.id}>
            {props.label}
          </label>
        )}
      </div>

      <small>{buildStringFromArray(props.checked.validators)}</small>
    </Fragment>
  );
};

export default InputCheckbox;