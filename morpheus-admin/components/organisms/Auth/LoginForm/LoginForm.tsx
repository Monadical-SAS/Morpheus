import React, { useState } from "react";
import { useRouter } from "next/router";
import { useToastContext } from "@/context/ToastContext";
import { AuthOption, useAuth } from "@/context/AuthContext";
import { TextInput } from "@/components/atoms/input";
import { useForm } from "react-hook-form";
import { Button, ButtonVariant } from "@/components/atoms/button";
import styles from "./LoginForm.module.scss";

export interface LoginFormModel {
  email: string;
  password: string;
}

const defaultValues = {
  email: "",
  password: "",
};

export const LoginForm = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormModel>({ defaultValues });
  const { setAuthOption, loginWithEmailAndPassword } = useAuth();
  const { showSuccessAlert } = useToastContext();

  const [loading, setLoading] = useState(false);

  const pathname = router.pathname;

  const handleFormSubmit = async (data: any) => {
    setLoading(true);
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
      <h1 className="text-2xl text-center mt-[100px]">Login Form</h1>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-2">
        <TextInput
          name={"email"}
          label={"Email"}
          placeholder={"Email"}
          register={register}
          validationSchema={{
            required: true,
            minLength: 2,
            maxLength: 64,
          }}
          errors={errors.email}
          setValue={setValue}
        />

        <TextInput
          name={"password"}
          label={"Password"}
          placeholder={"*********"}
          type={"password"}
          register={register}
          validationSchema={{
            required: true,
            minLength: 2,
            maxLength: 64,
          }}
          errors={errors.email}
          setValue={setValue}
        />

        <a
          className={`app-link body-3 main ${styles.linkForget}`}
          onClick={() => setAuthOption(AuthOption.Reset)}
        >
          Forgot password?
        </a>

        <Button
          text={"Submit"}
          variant={ButtonVariant.Primary}
          className={"w-full"}
          loading={loading}
        />
      </form>
    </div>
  );
};
