import React from "react";
import ShareOptions from "./ShareOptions";
import { ShareButtonProps } from "./ShareButton";

interface ShareButtonsProps extends ShareButtonProps {
  closeForm: () => void;
}

const ShareOptionsModal = (props: ShareButtonsProps) => {
  return (
    <div className="w-[500px] h-auto flex flex-col px-6 max-md:w-full max-md:px-0">
      <ShareOptions
        url={props.artwork.image}
        message={props.artwork.title || props.artwork.prompt?.prompt || ""}
      />
    </div>
  );
};

export default ShareOptionsModal;
