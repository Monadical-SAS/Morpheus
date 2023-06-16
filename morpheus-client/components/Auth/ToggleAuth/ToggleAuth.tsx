import React from "react";
import { AuthOption, useAuth } from "../../../context/AuthContext";
import styles from "./ToggleAuth.module.scss";

export const ToggleAuthOption = () => {
  const { authOption, setAuthOption } = useAuth();

  const getButtonStyles = (buttonName: string) => {
    return `base-1 white ${styles.toggleButton} ${
      authOption === buttonName && styles.active
    }`;
  };

  return (
    <div className={styles.toggleAuthContainer}>
      <button
        onClick={() => setAuthOption(AuthOption.Login)}
        className={getButtonStyles(AuthOption.Login)}
      >
        Sign In
      </button>
      <button
        onClick={() => setAuthOption(AuthOption.SignUp)}
        className={getButtonStyles(AuthOption.SignUp)}
      >
        Create account
      </button>
    </div>
  );
};
