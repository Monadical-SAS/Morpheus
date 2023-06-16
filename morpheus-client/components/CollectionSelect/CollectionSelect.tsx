import React, { Fragment, useEffect, useState } from "react";
import InputSelect from "../Inputs/InputSelect/InputSelect";
import Loader from "../Loaders/LoaderCircle/Loader";
import { getUserCollections } from "@/services/collection";
import { Collection } from "@/models/models";

interface CollectionSelectProps {
  selectedCollectionId: string;
  setSelectedCollectionId: (id: string) => void;
}

const CollectionSelect = (props: CollectionSelectProps) => {
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionOptions, setCollectionOptions] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    getCollections()
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const getCollections = async () => {
    getUserCollections().then((response) => {
      if (response.success && response.data) {
        const collectionsData = response.data || [];
        setCollections(collectionsData);
        setCollectionOptions(
          collectionsData.map((collection: Collection) => collection.name)
        );
      }
    });
  };

  useEffect(() => {
    if (collections && selectedCollection) {
      console.log("selectedCollection", selectedCollection);
      console.log("collections", collections);
      props.setSelectedCollectionId(
        collections.find(
          (collection: Collection) => collection.name === selectedCollection
        )?.id || ""
      );
    }
  }, [props, collections, selectedCollection]);

  useEffect(() => {
    if (collections && props.selectedCollectionId) {
      setSelectedCollection(
        collections.find(
          (collection: Collection) =>
            collection.id === props.selectedCollectionId
        )?.name || ""
      );
    }
  }, [collections, props.selectedCollectionId]);

  return (
    <Fragment>
      <p className="body-2 white" style={{ marginBottom: "10px" }}>
        Select a collection
      </p>

      {loading ? (
        <Loader isLoading={loading} />
      ) : (
        <InputSelect
          label={"Select Collection"}
          options={collectionOptions}
          selected={selectedCollection || ""}
          setSelected={setSelectedCollection}
        />
      )}
    </Fragment>
  );
};

export default CollectionSelect;
