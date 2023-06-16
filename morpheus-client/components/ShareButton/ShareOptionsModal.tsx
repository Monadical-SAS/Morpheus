import React from "react";
import ShareOptions from "./ShareOptions";
import { ShareButtonProps } from "./ShareButton";
import styles from "./ShareButton.module.scss";

interface ShareButtonsProps extends ShareButtonProps {
  closeForm: () => void;
}

const ShareOptionsModal = (props: ShareButtonsProps) => {
  return (
    <div className={styles.modalContent}>
      <ShareOptions
        url={props.artwork.image}
        message={props.artwork.title || props.artwork.prompt?.prompt || ""}
      />
    </div>
  );
};

export default ShareOptionsModal;
