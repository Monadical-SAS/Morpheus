import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/buttons/Button/Button";
import { GoogleIcon } from "../../icons/google";

export const SignUpWithGoogle = () => {
  const [loading, setLoading] = useState(false);
  const { loginWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    setLoading(true);
    loginWithGoogle()
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  return (
    <Button
      className="base-1 white"
      loading={loading}
      text={"Continue with Google"}
      onClick={handleGoogleLogin}
      icon={<GoogleIcon />}
      variant="secondary"
    />
  );
};
