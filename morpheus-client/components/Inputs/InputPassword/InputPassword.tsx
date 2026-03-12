import React, { Fragment, useState } from "react";
import { buildStringFromArray } from "@/utils/strings";
import { LookIcon } from "../../icons/lock";
import { TextState } from "../InputText/InputText";
import { matchPassword, maxLength, minLength, required } from "../validators";

interface InputPasswordProps {
  id?: string;
  password: TextState;
  comparePassword?: string;
  setPassword: any;
  disabled: boolean;
}

const InputPassword = (props: InputPasswordProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordChange = (event: any) => {
    event.persist();
    const value = event.target.value;
    props.setPassword({
      value: event.target.value,
      validators: [
        required(value),
        minLength(value, 8),
        maxLength(value, 128),
        props.comparePassword
          ? matchPassword(props.comparePassword, value)
          : true,
      ],
    });
  };

  return (
    <Fragment>
      <div className="w-full flex flex-col box-border relative">
        <span className="absolute top-4 left-4">
          <LookIcon />
        </span>

        <input
          id={props.id}
          type={showPassword ? "text" : "password"}
          placeholder={"Password"}
          autoComplete="current-password"
          value={props.password.value}
          disabled={props.disabled}
          onChange={(event) => handlePasswordChange(event)}
          className="w-full flex-1 outline-none h-12 min-h-[48px] pl-11 pr-11 rounded-lg text-[#8B90B2] border border-[#312E47] bg-[#252238] focus:border-[#d9006d] transition-all duration-500 placeholder:text-[#8B90B2]"
        />

        <span className="absolute top-3 right-4 cursor-pointer">
          {showPassword ? (
            <i
              className="material-icons text-[#B3005E]"
              onClick={() => setShowPassword(false)}
            >
              visibility
            </i>
          ) : (
            <i className="material-icons" onClick={() => setShowPassword(true)}>
              visibility_off
            </i>
          )}
        </span>
      </div>

      <small className="caption-1 text-red-500">
        {buildStringFromArray(props.password.validators)}
      </small>
    </Fragment>
  );
};

export default InputPassword;
