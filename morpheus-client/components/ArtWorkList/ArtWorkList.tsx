import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ButtonSecondary from "../buttons/ButtonSecondary/ButtonSecondary";
import ArtworkCard from "../ArtworkCard/ArtworkCard";
import { ArtWork } from "@/models/models";

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
    <div className="w-full h-auto flex flex-col max-md:max-w-full">
      <div className="flex flex-row justify-between items-center">
        <p className="body-2 white mb-3">Newest</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 max-md:!grid-cols-[repeat(auto-fill,minmax(100%,1fr))] max-md:p-0">
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

      <ButtonSecondary
        styles={{ marginTop: "24px", width: "220px" }}
        loading={false}
        text={"Create a new artwork"}
        onClick={handleAddArtwork}
      />
    </div>
  );
};

export default ArtWorkList;
