import { NextPage } from "next";

import { CookiesStatus } from "../../utils/cookies";
import ImageGallery from "../../components/ImageGallery/ImageGallery";
import PrivateRoute from "../../components/Auth/PrivateRoute/PrivateRoute";
import ImagineInput from "../../components/ImagineInput/ImagineInput";
import { useDiffusion } from "../../context/SDContext";
import { useImagine } from "../../context/ImagineContext";
import { useAnalytics } from "../../context/GoogleAnalyticsContext";
import styles from "../../styles/pages/StableDiffusion.module.scss";

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
    <PrivateRoute showLeftBar={true}>
      <div className={styles.imagineContainer}>
        <div className={styles.SDOutputContainer}>
          <div className={styles.imagesContent}>
            <div className={`${styles.SDResults} ${styles.fullWidth}`}>
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

export default Text2img;
