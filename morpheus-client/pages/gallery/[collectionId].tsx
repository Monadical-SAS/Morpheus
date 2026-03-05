import React, { Fragment, useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";

import Loader from "@/components/Loaders/LoaderCircle/Loader";
import CollectionForm from "@/components/CollectionForm/CollectionForm";
import Modal from "@/components/Modal/Modal";
import { MainLayoutPrivate } from "@/layout/MainLayout/MainLayout";
import ArtWorkList from "@/components/ArtWorkList/ArtWorkList";
import { getCollectionArtWorks } from "@/services/artworks";
import { deleteCollection, getCollectionDetails } from "@/services/collection";
import { useToastContext } from "@/context/ToastContext";
import { useAnalytics } from "@/context/GoogleAnalyticsContext";
import { ArtWork, Collection } from "@/models/models";

const CollectionDetail: NextPage = () => {
  const router = useRouter();
  const { showSuccessAlert, showWarningAlert, showErrorAlert } =
    useToastContext();
  const { collectionId } = router.query;

  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [collection, setCollection] = useState<Collection>();
  const [artWorks, setArtWorks] = useState<ArtWork[]>([]);
  const { sendAnalyticsRecord } = useAnalytics();

  useEffect(() => {
    if (collectionId) {
      setIsLoading(true);
      getCollectionDetails(collectionId as string)
        .then((response: any) => {
          if (response && response.success) {
            setCollection(response.data);
          }
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
          showErrorAlert("Error loading collection, please try again");
        });

      getCollectionArtWorks(collectionId as string)
        .then((response: any) => {
          if (response && response.success) {
            setArtWorks(response.data);
          }
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
          showErrorAlert("Error loading artworks, please try again");
        });
    }
  }, [collectionId]);

  useEffect(() => {
    sendAnalyticsRecord("page_view", {
      page_location: window.location.href,
      page_title: document?.title,
      page_name: `Collection ${collection?.name} detail`,
    });
  }, [collection]);

  const handleEdit = () => {
    setShowForm(true);
  };

  const handleDelete = () => {
    showWarningAlert(
      "Are you sure you want to delete this collection?",
      "Confirm",
      deleteCallback
    );
  };

  const deleteCallback = () => {
    deleteCollection(collectionId as string)
      .then((response: any) => {
        if (response && response.success) {
          showSuccessAlert("Collection deleted successfully");
          router.push("/gallery");
        }
      })
      .catch(() => {
        showErrorAlert("Error deleting collection, please try again");
      });
  };

  const reload = () => {
    router.push(`/gallery/${collectionId}`);
  };

  return (
    <MainLayoutPrivate>
      {isLoading ? (
        <Loader
          isLoading={isLoading}
          message={"Loading collection data..."}
          styles={{ width: "100%", height: "100%" }}
          color={"white"}
        />
      ) : (
        <Fragment>
          <div className="w-full h-full flex flex-col items-center mt-6">
            <div className="w-full max-w-[1280px] h-auto">
              <div className="w-full flex flex-row items-center max-md:flex-col max-md:items-center">
                <div className="w-[250px] h-[250px] flex justify-center items-center max-md:w-[150px] max-md:h-[150px]">
                  <img
                    src={collection?.image || "/images/avatar.png"}
                    alt={collection?.name}
                    loading="lazy"
                    className="w-[200px] h-[200px] p-2 object-cover rounded-full border-2 border-[#B3005E] max-md:w-[150px] max-md:h-[150px]"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/images/avatar.png"; }}
                  />
                </div>

                <div className="w-full h-full p-6 max-md:text-center">
                  <h2 className="headline-1 white capitalize">{collection?.name}</h2>
                  <p className="body-2 white">{collection?.description}</p>
                </div>

                <div className="w-[100px] h-auto flex justify-end items-center">
                  <span
                    className="material-symbols-outlined cursor-pointer text-white text-[28px] ml-4 hover:text-[#B3005E] transition-colors"
                    onClick={handleEdit}
                  >
                    edit
                  </span>

                  <span
                    className="material-symbols-outlined cursor-pointer text-white text-[28px] ml-4 hover:text-[#B3005E] transition-colors"
                    onClick={handleDelete}
                  >
                    delete
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full max-w-[1280px] mt-12 max-md:mt-6 max-md:p-6">
              <ArtWorkList artworkList={artWorks} />
            </div>
          </div>

          <Modal
            showHeader={true}
            headerContent={
              <p className="headline-2 white">
                {collection ? "Edit collection" : "Create collection"}
              </p>
            }
            width={"600px"}
            height={"auto"}
            isOpen={showForm}
            toggleModal={() => setShowForm(!showForm)}
          >
            <CollectionForm
              collection={collection}
              closeForm={() => setShowForm(false)}
              reload={reload}
            />
          </Modal>
        </Fragment>
      )}
    </MainLayoutPrivate>
  );
};

export default CollectionDetail;
