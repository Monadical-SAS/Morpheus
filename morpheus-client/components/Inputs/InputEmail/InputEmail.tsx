import React, { CSSProperties, Fragment } from "react";
import { EmailIcon } from "../../icons/email";
import { getInputValidators, validEmail } from "../validators";
import { buildStringFromArray } from "@/utils/strings";
import { TextState } from "../InputText/InputText";
import styles from "../Input.module.scss";

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
    <Fragment>
      <div className={styles.inputIconContainer} style={props.styles}>
        <span className={styles.iconLeft}>
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
        />
      </div>

      <small className={styles.error}>
        {buildStringFromArray(props.email.validators)}
      </small>
    </Fragment>
  );
};

export default InputEmail;
