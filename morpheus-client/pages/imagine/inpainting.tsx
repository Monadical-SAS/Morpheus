import { NextPage } from "next";
import ImageDraggable from "@/components/ImageDraggable/ImageDraggable";
import ImageGallery from "@/components/ImageGallery/ImageGallery";
import { UploadMaskIcon } from "@/components/icons/uploadMask";
import ImagineInput from "@/components/ImagineInput/ImagineInput";
import PrivateRoute from "@/components/Auth/PrivateRoute/PrivateRoute";
import { useDiffusion } from "@/context/SDContext";
import { useImagine } from "@/context/ImagineContext";
import styles from "../../styles/pages/StableDiffusion.module.scss";

const Inpainting: NextPage = () => {
  const { prompt } = useDiffusion();
  const { img2imgFile, setImg2imgFile, maskFile, setMaskFile, generateImages } =
    useImagine();
  const isFormValid =
    prompt.value.length > 0 && img2imgFile !== null && maskFile !== null;

  const handleGenerate = async () => {
    generateImages("inpainting");
  };

  return (
    <PrivateRoute showLeftBar={true}>
      <div className={styles.imagineContainer}>
        <div className={styles.SDOutputContainer}>
          <div className={styles.imagesContent}>
            <div className={styles.inputImage}>
              <ImageDraggable
                imageFile={img2imgFile}
                setImageFile={setImg2imgFile}
                showEditImage={true}
              />
              <ImageDraggable
                imageFile={maskFile}
                setImageFile={setMaskFile}
                styles={{ marginTop: "24px" }}
                icon={<UploadMaskIcon />}
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

export default Inpainting;
