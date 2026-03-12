import React from "react";
import ImagineMenu from "@/components/ImagineMenu/ImagineMenu";
import Navbar from "@/components/Navbar/Navbar";
import PrivateRoute from "@/components/Auth/PrivateRoute/PrivateRoute";
import useWindowDimensions from "@/hooks/useWindowDimensions";

interface ImagineContainerProps {
  children: React.ReactNode;
}

const ImagineLayout = (props: ImagineContainerProps) => {
  const { isMobile } = useWindowDimensions();

  return (
    <PrivateRoute>
      <div className="w-full max-w-[100vw] h-full max-h-screen flex flex-wrap flex-row bg-[#252238]">
        {!isMobile && <ImagineMenu />}
        <div className="flex-1 flex flex-col">
          <Navbar />
          {props.children}
        </div>
      </div>
    </PrivateRoute>
  );
};

export default ImagineLayout;
