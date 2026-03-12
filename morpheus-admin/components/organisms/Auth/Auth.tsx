import React from "react";
import Brand from "@/components/atoms/Brand/Brand";
import { LoginForm } from "./LoginForm/LoginForm";
import { ResetForm } from "./ResetForm/ResetForm";
import { AuthOption, useAuth } from "@/context/AuthContext";
import { Typography, TypographyVariant } from "@/components/atoms/typography";

export const Auth = () => {
  const { authOption } = useAuth();

  return (
    <div className="h-screen w-screen flex flex-row items-center justify-end bg-[url('/images/landing.png')] bg-cover bg-no-repeat">
      <div className="absolute top-12 left-12 w-[600px] max-w-full h-auto bg-[#14172D] opacity-80 z-[1] p-6 rounded-2xl">
        <Typography variant={TypographyVariant.Subtitle}>
          The god janus protecting the entrance to a digital, futuristic,
          mythical, information system, dramatic lighting, cgsociety, realistic,
          hyper detailed, insane details, intricate, dramatic lighting,
          hypermaximalist, golden r
        </Typography>
      </div>

      <div className="w-full max-w-[500px] flex flex-col justify-center mr-[100px] py-16 px-12 bg-[#14172D] rounded-2xl">
        <Brand styles={{ textAlign: "center" }} />

        {authOption === AuthOption.Login && <LoginForm />}
        {authOption === AuthOption.Reset && <ResetForm />}
      </div>
    </div>
  );
};
