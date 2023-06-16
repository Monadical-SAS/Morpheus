import React, { Fragment, useState } from "react";
import Modal from "../Modal/Modal";
import ShareOptionsModal from "./ShareOptionsModal";
import AppTooltip from "@/components/Tooltip/AppTooltip";
import { ShareIcon } from "@/components/icons/share";
import { getFileBlobFromURL } from "@/utils/images";
import { useToastContext } from "@/context/ToastContext";
import { ArtWork } from "@/models/models";

export interface ShareButtonProps {
  artwork: ArtWork;
}

const ShareButton = (props: ShareButtonProps) => {
  const { showInfoAlert } = useToastContext();
  const [showModal, setShowModal] = useState(false);

  const handleShareArtwork = async () => {
    const image = await getFileBlobFromURL(props.artwork.image);
    const filesArray = [image];
    if (navigator.canShare && navigator.canShare({ files: filesArray })) {
      navigator
        .share({
          files: filesArray,
          title: props.artwork.title,
          text: props.artwork.prompt?.prompt,
        })
        .then(() => console.log("Share was successful."))
        .catch((error) => console.log("Sharing failed", error));
    } else {
      showInfoAlert(`Your system doesn't support sharing files.`);
      setShowModal(true);
    }
  };

  return (
    <Fragment>
      <AppTooltip content={"Share"} direction={"top"}>
        <span onClick={handleShareArtwork}>
          <ShareIcon width={"24"} height={"24"} />
        </span>
      </AppTooltip>

      <Modal
        showHeader={true}
        headerContent={<h2 className="headline-4 white">Share your Artwork</h2>}
        width={"auto"}
        height={"auto"}
        isOpen={showModal}
        toggleModal={() => setShowModal(!showModal)}
      >
        <ShareOptionsModal
          artwork={props.artwork}
          closeForm={() => setShowModal(false)}
        />
      </Modal>
    </Fragment>
  );
};

export default ShareButton;
