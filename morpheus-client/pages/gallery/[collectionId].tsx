import React, { Fragment, useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";

import { CookiesStatus } from "@/utils/cookies";
import Loader from "@/components/Loaders/LoaderCircle/Loader";
import CollectionForm from "@/components/CollectionForm/CollectionForm";
import Modal from "@/components/Modal/Modal";
import ArtWorkList from "@/components/ArtWorkList/ArtWorkList";
import { MainContainerPrivate } from "@/layout/MainContainer/MainContainer";
import { getCollectionArtWorks } from "@/services/artworks";
import { deleteCollection, getCollectionDetails } from "@/services/collection";
import { useToastContext } from "@/context/ToastContext";
import { useAnalytics } from "@/context/GoogleAnalyticsContext";
import { ArtWork, Collection } from "@/models/models";
import styles from "@/styles/pages/CollectionDetails.module.scss";

const CollectionDetail: NextPage = () => {
  const router = useRouter();
  const { showSuccessAlert, showWarningAlert, showErrorAlert } =
    useToastContext();
  const { collectionId } = router.query;

  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [collection, setCollection] = useState<Collection>();
  const [artWorks, setArtWorks] = useState<ArtWork[]>([]);
  const { cookiesStatus, sendAnalyticsRecord } = useAnalytics();

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
    if (cookiesStatus === CookiesStatus.Accepted && collection) {
      sendAnalyticsRecord("page_view", {
        page_location: window.location.href,
        page_title: document?.title,
        page_name: `Collection ${collection?.name} detail`,
      });
    }
  }, [cookiesStatus, sendAnalyticsRecord, collection]);

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
    <MainContainerPrivate>
      {isLoading ? (
        <Loader
          isLoading={isLoading}
          message={"Loading collection data..."}
          styles={{ width: "100%", height: "100%" }}
          color={"white"}
        />
      ) : (
        <Fragment>
          <div className={styles.mainContainer}>
            <div className={styles.collectionContainer}>
              <div className={styles.collectionInfo}>
                <div className={styles.imageContainer}>
                  <img
                    src={collection?.image}
                    alt={collection?.name}
                    loading="lazy"
                  />
                </div>

                <div className={styles.textContainer}>
                  <h2 className="headline-1 white">{collection?.name}</h2>
                  <p className="body-2 white">{collection?.description}</p>
                </div>

                <div className={styles.actionIcons}>
                  <span
                    className="material-symbols-outlined"
                    onClick={handleEdit}
                  >
                    edit
                  </span>

                  <span
                    className="material-symbols-outlined"
                    onClick={handleDelete}
                  >
                    delete
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.artworksContent}>
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
    </MainContainerPrivate>
  );
};

export default CollectionDetail;
