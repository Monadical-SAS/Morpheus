import { NextPage } from "next";
import ImageGallery from "../../components/ImageGallery/ImageGallery";
import PrivateRoute from "../../components/Auth/PrivateRoute/PrivateRoute";
import ImagineInput from "../../components/ImagineInput/ImagineInput";
import { useDiffusion } from "../../context/SDContext";
import { useImagine } from "../../context/ImagineContext";
import styles from "../../styles/pages/StableDiffusion.module.scss";

const Text2img: NextPage = () => {
  const { prompt } = useDiffusion();
  const { generateImages } = useImagine();
  const isFormValid = prompt.value.length > 0;

  const handleGenerate = () => {
    generateImages("text2img");
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
