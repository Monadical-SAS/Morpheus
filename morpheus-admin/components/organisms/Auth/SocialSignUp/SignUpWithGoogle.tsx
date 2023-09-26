import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { GoogleIcon } from "@/components/atoms/icons/google";
import { Button, ButtonVariant } from "@/components/atoms/button";

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
      variant={ButtonVariant.Secondary}
      icon={<GoogleIcon />}
    />
  );
};
