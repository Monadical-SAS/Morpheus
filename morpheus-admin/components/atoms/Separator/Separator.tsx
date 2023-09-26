import React from "react";
import styles from "./Separator.module.scss";

export const Separator = () => {
  return (
    <div className={styles.separator}>
      <div className={styles.separatorLine} />
      <span className={`caption-1 white ${styles.separatorText}`}>OR</span>
      <div className={styles.separatorLine} />
    </div>
  );
};
