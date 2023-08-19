import { NextPage } from "next";

import ImagineContainer from "@/layout/ImagineContainer/ImagineContainer";
import ImageDraggable from "@/components/ImageDraggable/ImageDraggable";
import ImageGallery from "@/components/ImageGallery/ImageGallery";
import { CookiesStatus } from "@/utils/cookies";
import { UploadMaskIcon } from "@/components/icons/uploadMask";
import { useDiffusion } from "@/context/SDContext";
import { useImagine } from "@/context/ImagineContext";
import { useAnalytics } from "@/context/GoogleAnalyticsContext";
import styles from "@/styles/pages/StableDiffusion.module.scss";

const Inpainting: NextPage = () => {
  const { prompt } = useDiffusion();
  const { img2imgFile, setImg2imgFile, maskFile, setMaskFile, generateImages } =
    useImagine();
  const { cookiesStatus, sendAnalyticsRecord } = useAnalytics();
  const isFormValid =
    prompt.value.length > 0 && img2imgFile !== null && maskFile !== null;

  const handleGenerate = async () => {
    generateImages("inpainting");
    if (cookiesStatus === CookiesStatus.Accepted) {
      sendAnalyticsRecord("generate_images", {
        prompt: prompt.value,
        model: "inpainting",
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
            showEditImage={true}
            showPaintImageLink={true}
          />
          <ImageDraggable
            label={"Mask image"}
            imageFile={maskFile}
            setImageFile={setMaskFile}
            styles={{ marginTop: "24px" }}
            icon={<UploadMaskIcon />}
          />
        </div>

        <div className={styles.results}>
          <ImageGallery />
        </div>
      </div>
    </ImagineContainer>
  );
};

export default Inpainting;
