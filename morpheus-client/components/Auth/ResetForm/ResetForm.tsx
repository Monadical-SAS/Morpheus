import React, { useEffect, useState } from "react";

import { ArrowBackIcon } from "../../icons/arrowBack";
import ButtonPrimary from "../../buttons/ButtonPrimary/ButtonPrimary";
import InputEmail from "../../Inputs/InputEmail/InputEmail";
import { AuthOption, useAuth } from "@/context/AuthContext";
import { useToastContext } from "@/context/ToastContext";
import { isAllTrue } from "@/utils/arrays";
import { initialText, TextState } from "../../Inputs/InputText/InputText";

export const ResetForm = () => {
  const { setAuthOption, resetPassword } = useAuth();
  const { showSuccessAlert, showErrorAlert } = useToastContext();
  const [email, setEmail] = useState<TextState>(initialText);
  const [formValid, setFormValid] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormValid((email.value && isAllTrue(email.validators)) || false);
  }, [email]);

  const handleFormSubmit = (event: any) => {
    event.preventDefault();
    setLoading(true);

    resetPassword(email.value)
      .then(async () => {
        showSuccessAlert(
          `A recover link has been sent to the email ${email.value}`
        );
        setAuthOption(AuthOption.Login);
        setLoading(false);
      })
      .catch(() => {
        showErrorAlert(
          "An error occurred while resetting your password, please try again later."
        );
        setLoading(false);
      });
  };

  return (
    <div className="w-full">
      <div className="flex items-center">
        <span onClick={() => setAuthOption(AuthOption.Login)}>
          <ArrowBackIcon />
        </span>
        <h2 className="headline-5 white ml-4">
          Reset your Password
        </h2>
      </div>

      <form>
        <InputEmail id="inputEmailReset" email={email} setEmail={setEmail} />

        <ButtonPrimary
          disabled={!formValid}
          loading={loading}
          text={"Reset password"}
          onClick={handleFormSubmit}
        />
      </form>
    </div>
  );
};
