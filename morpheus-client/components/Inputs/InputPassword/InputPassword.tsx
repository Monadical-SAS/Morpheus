import React, { Fragment, useState } from "react";
import { buildStringFromArray } from "@/utils/strings";
import { LookIcon } from "../../icons/lock";
import styles from "../Input.module.scss";
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
      <div className={styles.inputIconContainer}>
        <span className={styles.iconLeft}>
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
        />

        <span className={styles.iconRight}>
          {showPassword ? (
            <i
              className={`material-icons ${styles.active}`}
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

      <small className={styles.error}>
        {buildStringFromArray(props.password.validators)}
      </small>
    </Fragment>
  );
};

export default InputPassword;
