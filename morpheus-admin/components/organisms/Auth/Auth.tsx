import React from "react";
import Brand from "@/components/atoms/Brand/Brand";
import {LoginForm} from "./LoginForm/LoginForm";
import {ResetForm} from "./ResetForm/ResetForm";
import {AuthOption, useAuth} from "@/context/AuthContext";
// import styles from "./Auth.module.scss";

export const Auth = () => {
  const { authOption } = useAuth();

  return (
    <div className={"grid h-screen place-items-center"}>
      <Brand styles={{ marginBottom: "30px" }} />

      <div className={"max-w-[500px] w-full self-center"}>
        {authOption === AuthOption.Login && <LoginForm />}
        {authOption === AuthOption.Reset && <ResetForm />}
      </div>
    </div>
  );
};
