import Loader from "../Loaders/LoaderImages/Loader";
import ArtworkCard from "../ArtworkCard/ArtworkCard";
import { ImageIcon } from "../icons/image";
import { ImagineResult, useImagine } from "@/context/ImagineContext";
import { Fragment } from "react";
import styles from "./ImageGallery.module.scss";

const ImageGallery = () => {
  const { isLoading, resultImages } = useImagine();

  return (
    <Fragment>
      {isLoading && (
        <div
          className={`${styles.centeredContainer} ${
            resultImages.length > 0 && styles.small
          }`}
        >
          <Loader />
        </div>
      )}

      {resultImages?.length > 0 ? (
        <div className={styles.galleryContainer}>
          {resultImages.map((result: ImagineResult, indexParent: number) => (
            <div className={styles.promptResults} key={indexParent}>
              <p className="body-2 white mb-4">{result.prompt.prompt}</p>
              <div className={styles.galleryRow}>
                {result.images.map((image: string, index: number) => (
                  <ArtworkCard
                    key={`${image}-${indexParent}-${index}`}
                    artwork={{ image: image || "", prompt: result.prompt }}
                    isModalEnabled={true}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className={`${styles.centeredContainer} ${isLoading && styles.hide}`}
        >
          <ImageIcon />
        </div>
      )}
    </Fragment>
  );
};

export default ImageGallery;
