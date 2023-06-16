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
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
      className="custom-styles"
    >
      <Editor />
    </div>
  );
};
export default Excalidraw;
