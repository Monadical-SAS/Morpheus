import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { SignUpWithGoogle } from "../SocialSignUp/SignUpWithGoogle";
import InputEmail from "../../Inputs/InputEmail/InputEmail";
import InputPassword from "../../Inputs/InputPassword/InputPassword";
import ButtonPrimary from "../../buttons/ButtonPrimary/ButtonPrimary";
import { useToastContext } from "@/context/ToastContext";
import { Separator } from "../Separator/Separator";
import { AuthOption, useAuth } from "@/context/AuthContext";
import { isAllTrue } from "@/utils/arrays";
import { initialText, TextState } from "../../Inputs/InputText/InputText";
import styles from "./LoginForm.module.scss";

export const LoginForm = () => {
  const router = useRouter();
  const { setAuthOption, loginWithEmailAndPassword } = useAuth();
  const { showSuccessAlert } = useToastContext();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<TextState>(initialText);
  const [password, setPassword] = useState<TextState>(initialText);
  const [formValid, setFormValid] = useState(false);

  const pathname = router.pathname;

  useEffect(() => {
    setFormValid(
      (email.value &&
        isAllTrue(email.validators) &&
        password.value &&
        isAllTrue(password.validators)) ||
        false
    );
  }, [email, password]);

  const handleFormSubmit = (event: any) => {
    event.preventDefault();
    setLoading(true);
    const data = { email: email.value, password: password.value };
    loginWithEmailAndPassword(data)
      .then(async (response) => {
        setLoading(false);
        if (response) {
          showSuccessAlert("User authenticated successfully");
          const url = pathname !== "/" ? pathname : "/profile";
          await router.push(url);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };

  return (
    <div className={styles.loginContainer}>
      <SignUpWithGoogle />
      <Separator />

      <form>
        <InputEmail
          id="inputEmailLogin"
          label={"Email"}
          email={email}
          setEmail={setEmail}
          styles={{ marginBottom: "8px" }}
        />

        <InputPassword
          id="inputPasswordLogin"
          password={password}
          setPassword={setPassword}
          disabled={false}
        />
        <a
          className={`app-link body-3 main ${styles.linkForget}`}
          onClick={() => setAuthOption(AuthOption.Reset)}
        >
          Forgot password?
        </a>

        <ButtonPrimary
          styles={{ marginTop: "32px" }}
          disabled={!formValid}
          loading={loading}
          text={"Sign in with Morpheus"}
          onClick={handleFormSubmit}
        />
      </form>
    </div>
  );
};
