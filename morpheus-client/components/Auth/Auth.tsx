import React from "react";
import Brand from "../Typography/Brand/Brand";
import { ToggleAuthOption } from "./ToggleAuth/ToggleAuth";
import { LoginForm } from "./LoginForm/LoginForm";
import { RegisterForm } from "./RegisterForm/RegisterForm";
import { ResetForm } from "./ResetForm/ResetForm";
import { AuthOption, useAuth } from "@/context/AuthContext";

export const Auth = () => {
  const { authOption } = useAuth();

  return (
    <div className="w-full h-auto flex flex-col justify-center items-center max-w-[526px] max-md:w-full max-md:h-full max-md:p-6">
      <Brand styles={{ marginBottom: "30px" }} />

      {authOption !== AuthOption.Reset && <ToggleAuthOption />}

      {authOption === AuthOption.Login && <LoginForm className="mt-6" />}
      {authOption === AuthOption.SignUp && <RegisterForm className="mt-6" />}
      {authOption === AuthOption.Reset && <ResetForm />}
    </div>
  );
};
