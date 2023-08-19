import { NextPage } from "next";

import ImagineContainer from "@/layout/ImagineContainer/ImagineContainer";
import ImageDraggable from "@/components/ImageDraggable/ImageDraggable";
import ImageGallery from "@/components/ImageGallery/ImageGallery";
import { CookiesStatus } from "@/utils/cookies";
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
    <ImagineContainer formValid={isFormValid} handleGenerate={handleGenerate}>
      <div className={styles.imagesContent}>
        <div className={styles.inputImage}>
          <ImageDraggable
            label={"Base Image"}
            imageFile={img2imgFile}
            setImageFile={setImg2imgFile}
            showPaintImageLink={true}
          />
        </div>

        <div className={styles.results}>
          <ImageGallery />
        </div>
      </div>
    </ImagineContainer>
  );
};

export default Img2Img;
