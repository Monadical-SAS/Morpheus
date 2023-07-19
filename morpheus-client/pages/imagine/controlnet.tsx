import { NextPage } from "next";
import ImageGallery from "../../components/ImageGallery/ImageGallery";
import ImageDraggable from "../../components/ImageDraggable/ImageDraggable";
import ImagineInput from "../../components/ImagineInput/ImagineInput";
import PrivateRoute from "../../components/Auth/PrivateRoute/PrivateRoute";
import { useDiffusion } from "../../context/SDContext";
import { useImagine } from "../../context/ImagineContext";
import styles from "../../styles/pages/StableDiffusion.module.scss";

const ControlNetImg: NextPage = () => {
  const { prompt, colorPalette, controlNetType } = useDiffusion();
  const { img2imgFile, setImg2imgFile, generateImages, colorPaletteFile, setColorPaletteFile } = useImagine();
  const isFormValid = prompt.value.length > 0 && img2imgFile !== null;

  const handleGenerate = async () => {
    generateImages("controlnet");
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
                title="Input Image"
              />
              {colorPalette != "None" && controlNetType == "Image-to-Image" && (
                <div className={styles.inputImage}>
                  <ImageDraggable
                    imageFile={colorPaletteFile}
                    setImageFile={setColorPaletteFile}
                    styles={{ marginTop: "24px" }}
                    title="Color Palette"
                  />
                </div>
              )}
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

export default ControlNetImg;
