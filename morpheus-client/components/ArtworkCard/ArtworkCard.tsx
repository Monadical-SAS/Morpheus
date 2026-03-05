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
      <div className="group overflow-hidden rounded-lg cursor-pointer relative hover:border hover:border-[#312E47]" style={initialStyles} onClick={handleClick}>
        {props.artwork?.image ? (
          <AppImage
            src={props.artwork.image}
            alt={props.artwork.title}
          />
        ) : (
          <span>
            <ImageIcon />
          </span>
        )}

        <div className="h-[60px] w-full absolute top-0 left-0 right-0 hidden group-hover:flex justify-center items-center bg-[#14172D] border-b border-[#312E47] transition-all duration-500 ease-in-out max-md:hidden">
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
          <div className="flex-1">
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
