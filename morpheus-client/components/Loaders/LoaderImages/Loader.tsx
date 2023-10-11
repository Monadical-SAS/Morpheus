import React from "react";
import styles from "./Loader.module.scss";

const Loader = () => {
  return (
    <div className={styles.loaderContainer}>
      <span className={styles.loaderLayers}></span>
      <p className="body-1 white">
        ✨ hang tight... <br /> we're making the magic happen ✨
      </p>
    </div>
  );
};

export default Loader;
