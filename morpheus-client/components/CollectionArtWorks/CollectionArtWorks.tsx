import React, { useEffect, useState } from "react";
import { ArtWork } from "@/models/models";
import { getCollectionArtWorks } from "@/services/artworks";
import ArtWorkList from "../ArtWorkList/ArtWorkList";
import { useToastContext } from "@/context/ToastContext";

interface CollectionArtWorksProps {
  collectionId: string;
}

const CollectionArtWorks = (props: CollectionArtWorksProps) => {
  const { showErrorAlert } = useToastContext();
  const [artworks, setArtworks] = useState<ArtWork[]>([]);

  useEffect(() => {
    if (props.collectionId) {
      getCollectionArtWorks(props.collectionId)
        .then((response: any) => {
          if (response && response.success) {
            setArtworks(response.data);
          }
        })
        .catch(() => {
          showErrorAlert("Error loading artworks, please try again");
        });
    }
  }, [props.collectionId]);

  return (
    <div>
      <ArtWorkList artworkList={artworks} />
    </div>
  );
};

export default CollectionArtWorks;
