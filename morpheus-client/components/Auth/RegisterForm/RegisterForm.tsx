import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { isAllTrue } from "@/utils/arrays";
import ButtonPrimary from "../../buttons/ButtonPrimary/ButtonPrimary";
import { UserIcon } from "../../icons/user";
import InputEmail from "../../Inputs/InputEmail/InputEmail";
import InputPassword from "../../Inputs/InputPassword/InputPassword";
import InputText, {
  initialText,
  TextState,
} from "../../Inputs/InputText/InputText";
import { Separator } from "../Separator/Separator";
import { SignUpWithGoogle } from "../SocialSignUp/SignUpWithGoogle";
import styles from "./RegisterForm.module.scss";

export const RegisterForm = () => {
  const { registerWithEmailAndPassword } = useAuth();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState<TextState>(initialText);
  const [email, setEmail] = useState<TextState>(initialText);
  const [password, setPassword] = useState<TextState>(initialText);

  const [formValid, setFormValid] = useState(false);

  useEffect(() => {
    setFormValid(
      (name.value &&
        isAllTrue(name.validators) &&
        email.value &&
        isAllTrue(email.validators) &&
        password.value &&
        isAllTrue(password.validators)) ||
        false
    );
  }, [name, email, password]);

  const handleFormSubmit = async (event: any) => {
    event.preventDefault();
    const user = {
      name: name.value,
      email: email.value,
      password: password.value,
    };
    setLoading(true);
    registerWithEmailAndPassword(user)
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  return (
    <div className={styles.registerContainer}>
      <SignUpWithGoogle />
      <Separator />

      <form>
        <InputText
          id="inputTextUserName"
          text={name}
          setText={setName}
          isRequired={true}
          minValueLength={2}
          maxValueLength={50}
          placeholder={"Name"}
          iconLeft={<UserIcon />}
          styles={{ marginBottom: "8px" }}
        />
        <InputEmail
          id="inputEmailRegister"
          label={"Email"}
          email={email}
          setEmail={setEmail}
          styles={{ marginBottom: "8px" }}
        />
        <InputPassword
          id="inputPasswordRegister"
          password={password}
          setPassword={setPassword}
          disabled={false}
        />

        <ButtonPrimary
          disabled={!formValid}
          loading={loading}
          text={"Create account"}
          onClick={handleFormSubmit}
        />
      </form>

      <p className={`caption-1 secondary ${styles.caption}`}>
        By creating an account, you agree to our{" "}
        <a href="" className="app-link caption-1 white">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="" className="app-link caption-1 white">
          Privacy & Cookie Statement.
        </a>
      </p>
    </div>
  );
};
