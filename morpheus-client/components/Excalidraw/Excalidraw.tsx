import React from "react";
import dynamic from "next/dynamic";
import styles from "./Excalidraw.module.scss";

const Excalidraw = () => {
  const Editor = dynamic(
    async () =>
      import("../../excalidraw/excalidraw-app/index").then(
        (mod) => mod.default
      ),
    { ssr: false }
  );

  return (
    <div className={styles.paintContainer}>
      <Editor />
    </div>
  );
};
export default React.memo(Excalidraw);
