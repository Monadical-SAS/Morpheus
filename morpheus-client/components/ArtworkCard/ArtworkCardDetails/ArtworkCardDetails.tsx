import React, { useState } from "react";
import AppImage from "@/components/AppImage/AppImage";
import ArtworkActions from "@/components/ArtworkActions/ArtworkActions";
import ArtworkDetails from "@/components/ArtworkCard/ArtworkDetails/ArtworkDetails";
import { ArtWork } from "@/models/models";

interface ArtworkCardDetailsProps {
  artwork: ArtWork;
  toggleModal?: () => void;
  refreshArtworks?: () => void;
}

const ArtworkCardDetails = (props: ArtworkCardDetailsProps) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="w-full h-full max-h-full flex flex-col gap-4 xl:flex-row xl:gap-12">
      <div className="flex flex-col h-full w-full flex-[2] xl:min-w-[512px] xl:min-h-[512px]">
        <AppImage src={props.artwork.image} alt={props.artwork.title} />

        <ArtworkActions
          artwork={props.artwork}
          setShowForm={setShowForm}
          toggleModal={props.toggleModal}
          showDelete={true}
          refreshArtworks={props.refreshArtworks}
        />
      </div>

      <div className="flex-1 pb-4 max-w-none xl:min-w-[380px]">
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
