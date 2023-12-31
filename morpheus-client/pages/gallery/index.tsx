import { useEffect, useState } from "react";
import { NextPage } from "next";

import Loader from "@/components/Loaders/LoaderCircle/Loader";
import SearchForm from "@/components/SearchForm/SearchForm";
import ArtWorkList from "@/components/ArtWorkList/ArtWorkList";
import Collections from "@/components/Collections/Collections";
import { MainLayoutPrivate } from "@/layout/MainLayout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { useAnalytics } from "@/context/GoogleAnalyticsContext";
import { getUserArtWorks } from "@/services/artworks";
import { isEmptyObject } from "@/utils/object";
import { useToastContext } from "@/context/ToastContext";
import { ArtWork } from "@/models/models";
import styles from "@/styles/pages/Gallery.module.scss";

const Gallery: NextPage = () => {
  const { user } = useAuth();
  const { showErrorAlert } = useToastContext();
  const [isLoading, setIsLoading] = useState(false);
  const { sendAnalyticsRecord } = useAnalytics();
  const [artWorks, setArtWorks] = useState<ArtWork[]>([]);

  useEffect(() => {
    if (isEmptyObject(user)) return;
    loadUserArtWorks();
  }, [user]);

  useEffect(() => {
    sendAnalyticsRecord("page_view", {
      page_location: window.location.href,
      page_title: document?.title,
      page_name: "Gallery",
    });
  }, []);

  const loadUserArtWorks = async () => {
    setIsLoading(true);
    getUserArtWorks()
      .then((response) => {
        if (response.success) {
          setArtWorks(response.data);
        }
        setIsLoading(false);
      })
      .catch(() => {
        showErrorAlert("Error while getting user images, please try again");
        setIsLoading(false);
      });
  };

  return (
    <MainLayoutPrivate>
      {isLoading ? (
        <Loader
          isLoading={isLoading}
          message={"Loading images..."}
          styles={{ width: "100%", height: "100%" }}
          fontColor={"white"}
        />
      ) : (
        <div className={styles.container}>
          <SearchForm setUserArtWorks={setArtWorks} />

          <ArtWorkList
            artworkList={artWorks}
            amount={20}
            refreshArtworks={loadUserArtWorks}
          />

          <Collections />
        </div>
      )}
    </MainLayoutPrivate>
  );
};

export default Gallery;
