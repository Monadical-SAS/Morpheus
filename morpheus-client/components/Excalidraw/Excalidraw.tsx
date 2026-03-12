import React from "react";
import dynamic from "next/dynamic";

const ExcalidrawCanvas = dynamic(() => import("./ExcalidrawCanvas"), { ssr: false });

const Excalidraw = () => (
  <div className="w-full h-full max-h-[calc(100vh-180px)] max-md:mt-[60px] max-md:max-h-[calc(100vh-160px)]">
    <ExcalidrawCanvas />
  </div>
);

export default React.memo(Excalidraw);
