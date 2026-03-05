import React from "react";
import { useRouter } from "next/router";
import { Collection } from "../../models/models";

interface CollectionCardProps {
  collection: Collection;
}

const CollectionCard = (props: CollectionCardProps) => {
  const router = useRouter();

  const handleCollectionClick = async () => {
    await router.push(`/gallery/${props.collection.id}`);
  };

  return (
    <div className="w-[46%] h-[100px] flex flex-row border border-[#312E47] rounded-lg cursor-pointer max-md:w-full max-md:mb-3" onClick={handleCollectionClick}>
      <div className="w-[100px] h-[100px] object-cover rounded-2xl flex justify-center items-center">
        <img
          src={props.collection.image || "/images/avatar.png"}
          alt={"Collection Image"}
          loading="lazy"
          className="w-full h-full object-cover rounded-lg"
          onError={(e) => { (e.target as HTMLImageElement).src = "/images/avatar.png"; }}
        />
      </div>

      <div className="w-[calc(100%-100px)] h-full flex flex-col justify-center p-3 last:pr-3">
        <p className="headline-4 white whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
          {props.collection.name}
        </p>
        <p className="body-2 secondary whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
          {props.collection.description}
        </p>
      </div>
    </div>
  );
};

export default CollectionCard;
