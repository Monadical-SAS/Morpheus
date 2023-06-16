import React from "react";
import Brand from "../Typography/Brand/Brand";
import { ToggleAuthOption } from "./ToggleAuth/ToggleAuth";
import { LoginForm } from "./LoginForm/LoginForm";
import { RegisterForm } from "./RegisterForm/RegisterForm";
import { ResetForm } from "./ResetForm/ResetForm";
import { AuthOption, useAuth } from "@/context/AuthContext";
import styles from "./Auth.module.scss";

export const Auth = () => {
  const { authOption } = useAuth();

  return (
    <div className={styles.authContainer}>
      <Brand styles={{ marginBottom: "30px" }} />

      {authOption !== AuthOption.Reset && <ToggleAuthOption />}

      {authOption === AuthOption.Login && <LoginForm />}
      {authOption === AuthOption.SignUp && <RegisterForm />}
      {authOption === AuthOption.Reset && <ResetForm />}
    </div>
  );
};
