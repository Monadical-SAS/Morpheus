import React from "react";

const Loader = () => {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full text-center max-md:mb-6">
      <span className="loader-layers"></span>
      <p className="body-1 white">
        ✨ hang tight... <br /> we're making the magic happen ✨
      </p>
    </div>
  );
};

export default Loader;
