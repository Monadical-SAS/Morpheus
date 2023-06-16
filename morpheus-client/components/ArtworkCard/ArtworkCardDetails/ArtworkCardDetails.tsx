import React, { useState } from "react";
import AppImage from "@/components/AppImage/AppImage";
import ArtworkActions from "@/components/ArtworkActions/ArtworkActions";
import ArtworkDetails from "@/components/ArtworkCard/ArtworkDetails/ArtworkDetails";
import { ArtWork } from "@/models/models";
import styles from "./ArtworkCardDetails.module.scss";

interface ArtworkCardDetailsProps {
  artwork: ArtWork;
  toggleModal?: () => void;
  refreshArtworks?: () => void;
}

const ArtworkCardDetails = (props: ArtworkCardDetailsProps) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className={styles.artworkDetails}>
      <div className={styles.artworkImageContent}>
        <AppImage src={props.artwork.image} alt={props.artwork.title} />

        <ArtworkActions
          artwork={props.artwork}
          setShowForm={setShowForm}
          toggleModal={props.toggleModal}
          showDelete={true}
          refreshArtworks={props.refreshArtworks}
        />
      </div>

      <div className={styles.details}>
        <ArtworkDetails
          artwork={props.artwork}
          toggleModal={props.toggleModal}
          showForm={showForm}
          setShowForm={setShowForm}
          refreshArtworks={props.refreshArtworks}
        />
      </div>
    </div>
  );
};

export default ArtworkCardDetails;
