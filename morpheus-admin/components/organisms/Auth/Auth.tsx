import React from "react";
import Brand from "@/components/atoms/Brand/Brand";
import { LoginForm } from "./LoginForm/LoginForm";
import { ResetForm } from "./ResetForm/ResetForm";
import { AuthOption, useAuth } from "@/context/AuthContext";
import styles from "./Auth.module.scss";
import { Typography, TypographyVariant } from "@/components/atoms/typography";

export const Auth = () => {
  const { authOption } = useAuth();

  return (
    <div className={styles.authContainer}>
      <div className={styles.prompt}>
        <Typography variant={TypographyVariant.Subtitle}>
          The god janus protecting the entrance to a digital, futuristic,
          mythical, information system, dramatic lighting, cgsociety, realistic,
          hyper detailed, insane details, intricate, dramatic lighting,
          hypermaximalist, golden r
        </Typography>
      </div>

      <div className={styles.formsContainer}>
        <Brand styles={{ textAlign: "center" }} />

        {authOption === AuthOption.Login && <LoginForm />}
        {authOption === AuthOption.Reset && <ResetForm />}
      </div>
    </div>
  );
};
