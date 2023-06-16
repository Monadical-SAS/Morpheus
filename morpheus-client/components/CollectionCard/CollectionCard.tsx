import React from "react";
import { useRouter } from "next/router";
import { Collection } from "../../models/models";
import styles from "./CollectionCard.module.scss";

interface CollectionCardProps {
  collection: Collection;
}

const CollectionCard = (props: CollectionCardProps) => {
  const router = useRouter();

  const handleCollectionClick = async () => {
    await router.push(`/gallery/${props.collection.id}`);
  };

  return (
    <div className={styles.collectionCard} onClick={handleCollectionClick}>
      <div className={styles.collectionImage}>
        {props.collection.image ? (
          <img
            src={props.collection.image}
            alt={"Collection Image"}
            loading="lazy"
          />
        ) : (
          <span className="material-icons">folder</span>
        )}
      </div>

      <div className={styles.collectionText}>
        <p className={`headline-4 white ${styles.ellipsis}`}>
          {props.collection.name}
        </p>
        <p className={`body-2 secondary ${styles.ellipsis}`}>
          {props.collection.description}
        </p>
      </div>
    </div>
  );
};

export default CollectionCard;
