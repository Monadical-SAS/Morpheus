import { NextPage } from "next";

import { CookiesStatus } from "@/utils/cookies";
import ImageDraggable from "@/components/ImageDraggable/ImageDraggable";
import ImageGallery from "@/components/ImageGallery/ImageGallery";
import PrivateRoute from "@/components/Auth/PrivateRoute/PrivateRoute";
import ImagineInput from "@/components/ImagineInput/ImagineInput";
import { useDiffusion } from "@/context/SDContext";
import { useImagine } from "@/context/ImagineContext";
import { useAnalytics } from "@/context/GoogleAnalyticsContext";
import styles from "@/styles/pages/StableDiffusion.module.scss";

const Img2Img: NextPage = () => {
  const { prompt } = useDiffusion();
  const { cookiesStatus, sendAnalyticsRecord } = useAnalytics();
  const { img2imgFile, setImg2imgFile, generateImages } = useImagine();
  const isFormValid = prompt.value.length > 0 && img2imgFile !== null;

  const handleGenerate = () => {
    generateImages("img2img");
    if (cookiesStatus === CookiesStatus.Accepted) {
      sendAnalyticsRecord("generate_images", {
        prompt: prompt.value,
        model: "img2img",
      });
    }
  };

  return (
    <PrivateRoute showLeftBar={true}>
      <div className={styles.imagineContainer}>
        <div className={styles.SDOutputContainer}>
          <div className={styles.imagesContent}>
            <div className={styles.inputImage}>
              <ImageDraggable
                label={"Base Image"}
                imageFile={img2imgFile}
                setImageFile={setImg2imgFile}
                showPaintImageLink={true}
              />
            </div>

            <div className={styles.SDResults}>
              <ImageGallery />
            </div>
          </div>
        </div>

        <ImagineInput
          isFormValid={isFormValid}
          handleGenerate={handleGenerate}
        />
      </div>
    </PrivateRoute>
  );
};

export default Img2Img;
