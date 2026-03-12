import React, { CSSProperties } from "react";
import { EmailIcon } from "../../icons/email";
import { getInputValidators, validEmail } from "../validators";
import { buildStringFromArray } from "@/utils/strings";
import { TextState } from "../InputText/InputText";

export interface InputEMailProps {
  id?: string;
  label?: string;
  placeholder?: string;
  email: TextState;
  setEmail?: (email: TextState) => void;
  disabled?: boolean;
  isRequired?: boolean;
  minLength?: number;
  maxLength?: number;
  styles?: CSSProperties;
}

const InputEmail = (props: InputEMailProps) => {
  const handleEmailChange = (event: any) => {
    event.persist();
    const value = event.target.value;
    if (validEmail(value) && props.setEmail) {
      props.setEmail({
        value: value,
        validators: getInputValidators(
          value,
          props.isRequired,
          props.minLength,
          props.maxLength,
          true
        ),
      });
    }
  };

  return (
    <div className="w-full flex flex-col box-border relative" style={props.styles}>
      <span className="absolute top-4 left-4">
        <EmailIcon />
      </span>

      <input
        id={props.id}
        type="email"
        placeholder={"Username or email"}
        autoComplete="username"
        value={props.email.value}
        disabled={props.disabled}
        onChange={(event) => handleEmailChange(event)}
        className="w-full flex-1 outline-none h-12 min-h-[48px] pl-11 pr-5 rounded-lg text-[#8B90B2] border border-[#312E47] bg-[#252238] focus:border-[#d9006d] transition-all duration-500 placeholder:text-[#8B90B2]"
      />

      <small className="caption-1 text-red-500">
        {buildStringFromArray(props.email.validators)}
      </small>
    </div>
  );
};

export default InputEmail;
