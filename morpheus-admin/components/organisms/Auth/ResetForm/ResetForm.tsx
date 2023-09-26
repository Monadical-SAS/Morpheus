import React, { useState } from "react";

import { ArrowBackIcon } from "@/components/atoms/icons/arrowBack";
import { AuthOption, useAuth } from "@/context/AuthContext";
import { useToastContext } from "@/context/ToastContext";
import { TextInput } from "@/components/atoms/input";
import { Button, ButtonVariant } from "@/components/atoms/button";
import { useForm } from "react-hook-form";
import styles from "../LoginForm/LoginForm.module.scss";

interface ResetFormModel {
  email: string;
}

const defaultValues = {
  email: "",
};

export const ResetForm = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetFormModel>({ defaultValues });

  const { setAuthOption, resetPassword } = useAuth();
  const { showSuccessAlert, showErrorAlert } = useToastContext();
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = (data: any) => {
    setLoading(true);

    resetPassword(data)
      .then(async () => {
        showSuccessAlert(
          `A recover link has been sent to the email ${data.email}`,
        );
        setAuthOption(AuthOption.Login);
        setLoading(false);
      })
      .catch(() => {
        showErrorAlert(
          "An error occurred while resetting your password, please try again later.",
        );
        setLoading(false);
      });
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.titleContainer}>
        <span onClick={() => setAuthOption(AuthOption.Login)}>
          <ArrowBackIcon />
        </span>
        <h2 className={`headline-5 white ${styles.resetTitle}`}>
          Reset your Password
        </h2>
      </div>

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
