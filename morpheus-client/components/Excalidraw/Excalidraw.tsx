import React from "react";
import dynamic from "next/dynamic";

const Excalidraw = () => {
  const Editor = dynamic(
    async () =>
      import("../../excalidraw/excalidraw-app/index").then(
        (mod) => mod.default
      ),
    { ssr: false }
  );

  return (
    <div className="w-full h-full max-h-[calc(100vh-180px)] max-md:mt-[60px] max-md:max-h-[calc(100vh-160px)]">
      <Editor />
    </div>
  );
};
export default React.memo(Excalidraw);
