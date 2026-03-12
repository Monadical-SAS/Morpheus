import React from "react";
import { AuthOption, useAuth } from "@/context/AuthContext";

export const ToggleAuthOption = () => {
  const { authOption, setAuthOption } = useAuth();

  const getButtonStyles = (buttonName: string) => {
    const isActive = authOption === buttonName;
    return `base-1 white max-w-[259px] h-12 cursor-pointer flex justify-center items-center text-center gap-[10px] flex-1 select-none transition-all duration-200 border-none ${
      isActive ? "bg-[#252238] rounded-[6px]" : "bg-transparent"
    }`;
  };

  return (
    <div className="flex flex-row items-start p-1 w-[526px] h-14 bg-[#14172D] rounded-lg max-md:w-full">
      <button
        onClick={() => setAuthOption(AuthOption.Login)}
        className={getButtonStyles(AuthOption.Login)}
      >
        Sign In
      </button>
      <button
        onClick={() => setAuthOption(AuthOption.SignUp)}
        className={getButtonStyles(AuthOption.SignUp)}
      >
        Create account
      </button>
    </div>
  );
};
