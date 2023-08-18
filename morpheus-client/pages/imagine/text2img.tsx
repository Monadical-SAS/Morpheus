import { NextPage } from "next";

import ImagineContainer from "@/layout/ImagineContainer/ImagineContainer";
import ImageGallery from "@/components/ImageGallery/ImageGallery";
import { CookiesStatus } from "@/utils/cookies";
import { useDiffusion } from "@/context/SDContext";
import { useImagine } from "@/context/ImagineContext";
import { useAnalytics } from "@/context/GoogleAnalyticsContext";
import styles from "@/styles/pages/StableDiffusion.module.scss";

const Text2img: NextPage = () => {
  const { prompt } = useDiffusion();
  const { cookiesStatus, sendAnalyticsRecord } = useAnalytics();
  const { generateImages } = useImagine();
  const isFormValid = prompt.value.length > 0;

  const handleGenerate = () => {
    generateImages("text2img");
    if (cookiesStatus === CookiesStatus.Accepted) {
      sendAnalyticsRecord("generate_images", {
        prompt: prompt.value,
        model: "text2img",
      });
    }
  };

  return (
    <ImagineContainer formValid={isFormValid} handleGenerate={handleGenerate}>
      <div className={styles.imagesContent}>
        <div className={`${styles.results} ${styles.fullWidth}`}>
          <ImageGallery />
        </div>
      </div>
    </ImagineContainer>
  );
};

export default Text2img;
