import React, { Fragment, useEffect, useState } from "react";
import CollectionCard from "../CollectionCard/CollectionCard";
import ButtonSecondary from "../buttons/ButtonSecondary/ButtonSecondary";
import Modal from "../Modal/Modal";
import CollectionForm from "../CollectionForm/CollectionForm";
import { Collection } from "@/models/models";
import { useAuth } from "@/context/AuthContext";
import { getUserCollections } from "@/services/collection";
import { useToastContext } from "@/context/ToastContext";

const Collections = () => {
  const { user } = useAuth();
  const { showErrorAlert } = useToastContext();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (user) {
      getCollections();
    }
  }, [user]);

  const getCollections = async () => {
    getUserCollections()
      .then((response: any) => {
        if (response && response.success) {
          setCollections(response.data);
        }
      })
      .catch(() => {
        showErrorAlert("Error loading collections, please try again");
      });
  };

  const handleAddCollection = () => {
    setShowForm(!showForm);
  };

  return (
    <Fragment>
      <div className="w-full h-auto flex flex-col my-12 max-md:mx-6 max-md:max-w-full">
        <div className="flex flex-row justify-between items-center">
          <p className="headline-2 white">Collections</p>
        </div>

        <div className="flex flex-row flex-wrap gap-6 mt-8">
          {collections.length > 0 ? (
            collections.map((collection: Collection, collectionId: number) => (
              <CollectionCard collection={collection} key={collectionId} />
            ))
          ) : (
            <p className="base-1 white -mt-6">
              No collections found
            </p>
          )}
        </div>

        <ButtonSecondary
          styles={{ marginTop: "24px", width: "220px" }}
          loading={false}
          text={"Create a new one"}
          onClick={handleAddCollection}
        />
      </div>

      <Modal
        showHeader={true}
        headerContent={<p className="headline-2 white">Create collection</p>}
        width={"600px"}
        height={"auto"}
        isOpen={showForm}
        toggleModal={() => setShowForm(!showForm)}
      >
        <CollectionForm
          closeForm={() => setShowForm(false)}
          reload={getCollections}
        />
      </Modal>
    </Fragment>
  );
};

export default Collections;
