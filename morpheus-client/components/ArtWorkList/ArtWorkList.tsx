import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Button from "../buttons/Button/Button";
import ArtworkCard from "../ArtworkCard/ArtworkCard";
import { ArtWork } from "@/models/models";
import styles from "./ArtWorkList.module.scss";

interface ArtWorkListProps {
  artworkList: ArtWork[];
  amount?: number;
  refreshArtworks?: () => void;
}

const ArtWorkList = (props: ArtWorkListProps) => {
  const router = useRouter();
  const [renderArtworks, setRenderArtworks] = useState<ArtWork[]>([]);

  useEffect(() => {
    if (props.artworkList && props.artworkList.length > 0) {
      let artworks = props.artworkList;
      if (props.amount && props.amount < props.artworkList.length) {
        artworks = props.artworkList.slice(0, props.amount);
      }
      setRenderArtworks(artworks);
    } else {
      setRenderArtworks([]);
    }
  }, [props.artworkList, props.amount]);

  const handleAddArtwork = () => {
    router.push("/imagine/text2img");
  };

  return (
    <div className={styles.artworksContainer}>
      <div className={styles.header}>
        <p className="mb-3 body-2 white">Newest</p>
      </div>

      <div className={styles.artworksList}>
        {renderArtworks.length > 0 ? (
          renderArtworks.map((artWork: ArtWork) => (
            <ArtworkCard
              key={artWork.id}
              artwork={artWork}
              isModalEnabled={true}
              refreshArtworks={props.refreshArtworks}
            />
          ))
        ) : (
          <p className="base-1 white">No artwork found</p>
        )}
      </div>

      <Button
        styles={{ marginTop: "24px", width: "220px" }}
        loading={false}
        text={"Create a new artwork"}
        onClick={handleAddArtwork}
        variant="secondary"
      />
    </div>
  );
};

export default ArtWorkList;
