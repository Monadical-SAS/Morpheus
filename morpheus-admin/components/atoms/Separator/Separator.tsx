import React from "react";

export const Separator = () => {
  return (
    <div className="w-full h-auto flex items-center text-center my-8">
      <div className="flex-1 border border-[#f1f1f1]" />
      <span className="caption-1 white mx-6">OR</span>
      <div className="flex-1 border border-[#f1f1f1]" />
    </div>
  );
};
