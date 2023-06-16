import React, { CSSProperties, Fragment } from "react";
import { useRouter } from "next/router";
import AppTooltip from "@/components/Tooltip/AppTooltip";
import ShareButton from "../ShareButton/ShareButton";
import ButtonSetImage2 from "../buttons/ButtonImg2Img/ButtonSetImage2";
import { DownloadIcon } from "@/components/icons/download";
import { PencilIcon } from "@/components/icons/pencil";
import { GalleryIcon } from "@/components/icons/gallery";
import { DeleteIcon } from "@/components/icons/delete";
import { SaveIcon } from "lucide-react";
import { InpaintingIcon } from "../icons/inpainting";
import { Pix2PixIcon } from "../icons/pix2pix";
import { ControlNetIcon } from "../icons/controlnet";
import { Img2ImgIcon } from "../icons/img2img";
import { useToastContext } from "@/context/ToastContext";
import { downloadImage } from "@/utils/images";
import { deleteArtWork } from "@/services/artworks";
import { ArtWork } from "@/models/models";
import styles from "./ArtworkActions.module.scss";

interface ImageActionsProps {
  artwork: ArtWork;
  refreshArtworks?: () => void;
  setShowForm?: (show: boolean) => void;
  showDelete?: boolean;
  styles?: CSSProperties;
  toggleModal?: () => void;
  showQuickActions?: boolean;
}

const ArtworkActions = (props: ImageActionsProps) => {
  const router = useRouter();
  const { showSuccessAlert, showWarningAlert, showErrorAlert } =
    useToastContext();

  const handleImageDownload = async () => {
    downloadImage(props.artwork.image)
      .then(() => {
        showSuccessAlert("Image downloaded successfully");
      })
      .catch(() => {
        showErrorAlert("An error occurred while downloading image");
      });
  };

  const handleDeleteArtwork = async () => {
    if (!props.artwork.id) {
      showWarningAlert(
        "Looks like the item you're attempting to delete is not an artwork."
      );
      return;
    }
    showWarningAlert(
      "Are you sure you want to delete this artwork?",
      "Confirm",
      deleteCallback
    );
  };

  const deleteCallback = () => {
    if (!props.artwork.id) return;
    deleteArtWork(props.artwork.id)
      .then((response) => {
        if (response && response.success) {
          showSuccessAlert("Artwork deleted successfully");
          props.refreshArtworks && props.refreshArtworks();
        }
      })
      .catch(() => {
        showErrorAlert(
          "An error occurred while deleting artwork, please try again later"
        );
      });
  };

  const redirectToGallery = () => {
    router.push(`/gallery`);
  };

  const showForm = () => {
    props.setShowForm && props.setShowForm(true);
  };

  return (
    <Fragment>
      <div className={styles.actionButtons} style={props.styles}>
        <div className={styles.artworkActions}>
          <AppTooltip content={"Download"} direction={"top"}>
            <span onClick={handleImageDownload}>
              <DownloadIcon width={"24"} height={"24"} />
            </span>
          </AppTooltip>

          {!props.showQuickActions &&
            (props.artwork.id ? (
              <AppTooltip content={"Edit"} direction={"top"}>
                <span onClick={showForm}>
                  <PencilIcon width={"24"} height={"24"} />
                </span>
              </AppTooltip>
            ) : (
              <AppTooltip content={"Save"} direction={"top"}>
                <span onClick={showForm}>
                  <SaveIcon width={"24"} height={"24"} />
                </span>
              </AppTooltip>
            ))}

          {props.showDelete && props.artwork.id && (
            <AppTooltip content={"Delete"} direction={"top"}>
              <span onClick={handleDeleteArtwork}>
                <DeleteIcon width={"24"} height={"24"} />
              </span>
            </AppTooltip>
          )}

          <ShareButton artwork={props.artwork} />

          <AppTooltip content={"Open gallery"} direction={"top"}>
            <span onClick={redirectToGallery}>
              <GalleryIcon width={"24"} height={"24"} />
            </span>
          </AppTooltip>
        </div>

        <div className={styles.imagineActions}>
          <ButtonSetImage2
            redirect={"img2img"}
            icon={<Img2ImgIcon width={"24"} height={"24"} color={"#6D6D94"} />}
            image={props.artwork.image}
            toggleModal={props.toggleModal}
          />

          <ButtonSetImage2
            redirect={"controlnet"}
            icon={
              <ControlNetIcon width={"24"} height={"24"} color={"#6D6D94"} />
            }
            image={props.artwork.image}
            toggleModal={props.toggleModal}
          />

          <ButtonSetImage2
            redirect={"pix2pix"}
            icon={<Pix2PixIcon width={"24"} height={"24"} color={"#6D6D94"} />}
            image={props.artwork.image}
            toggleModal={props.toggleModal}
          />

          <ButtonSetImage2
            redirect={"inpainting"}
            icon={
              <InpaintingIcon width={"24"} height={"24"} color={"#6D6D94"} />
            }
            image={props.artwork.image}
            toggleModal={props.toggleModal}
          />
        </div>
      </div>
    </Fragment>
  );
};

export default ArtworkActions;
