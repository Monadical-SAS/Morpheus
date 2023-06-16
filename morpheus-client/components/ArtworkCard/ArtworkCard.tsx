import React, { CSSProperties, Fragment } from "react";
import Modal from "../Modal/Modal";
import ArtworkCreator from "./ArtworkCreator/ArtworkCreator";
import AppImage from "@/components/AppImage/AppImage";
import ArtworkCardDetails from "@/components/ArtworkCard/ArtworkCardDetails/ArtworkCardDetails";
import ArtworkActions from "@/components/ArtworkActions/ArtworkActions";
import { ImageIcon } from "../icons/image";
import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/hooks/useModal";
import { ArtWork } from "@/models/models";
import styles from "./ArtworkCard.module.scss";

interface ImageCardProps {
  artwork: ArtWork;
  width?: string;
  height?: string;
  isModalEnabled?: boolean;
  styles?: CSSProperties;
  refreshArtworks?: () => void;
}

const ArtworkCard = (props: ImageCardProps) => {
  const { user } = useAuth();
  const { isOpen, toggleModal } = useModal();

  const initialStyles = {
    width: props.width,
    height: props.height,
    ...props.styles,
  };

  const handleClick = () => {
    if (props.isModalEnabled) {
      toggleModal();
      return;
    }
  };

  return (
    <Fragment>
      <div className={styles.artworkCard} style={initialStyles}>
        {props.artwork?.image ? (
          <AppImage
            onClick={handleClick}
            src={props.artwork.image}
            alt={props.artwork.title}
          />
        ) : (
          <span>
            <ImageIcon />
          </span>
        )}

        <div className={styles.smallActions}>
          <ArtworkActions
            artwork={props.artwork}
            showDelete={false}
            refreshArtworks={props.refreshArtworks}
            styles={{ marginTop: "0" }}
            showQuickActions={true}
          />
        </div>
      </div>

      {props.isModalEnabled && (
        <Modal
          width={"auto"}
          height={"auto"}
          showHeader={true}
          isOpen={isOpen}
          toggleModal={toggleModal}
          headerContent={<ArtworkCreator creator={user} />}
        >
          <div className={styles.modalContent}>
            <ArtworkCardDetails
              artwork={props.artwork}
              toggleModal={toggleModal}
              refreshArtworks={props.refreshArtworks}
            />
          </div>
        </Modal>
      )}
    </Fragment>
  );
};

export default ArtworkCard;
