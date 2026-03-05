import React from "react";

export const Separator = () => {
  return (
    <div className="w-full h-auto flex items-center text-center my-8">
      <div className="flex-1 border border-[#8B90B2]" />
      <span className="caption-1 white mx-6">OR</span>
      <div className="flex-1 border border-[#8B90B2]" />
    </div>
  );
};
