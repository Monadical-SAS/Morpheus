import React from "react";
import ImagineMenu from "../../components/ImagineMenu/ImagineMenu";
import ImageDraggable from "@/components/ImageDraggable/ImageDraggable";
import ImageGallery from "@/components/ImageGallery/ImageGallery";
import ImagineInput from "@/components/ImagineInput/ImagineInput";
import IntroductoryWalkthroughApp from "@/components/IntroductoryWalkthroughApp/IntroductoryWalkthroughApp";
import ImagineLayout from "@/layout/ImagineLayout/ImagineLayout";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { UploadMaskIcon } from "@/components/icons/uploadMask";
import { useImagine } from "@/context/ImagineContext";
import { MOBILE_SCREEN_WIDTH } from "@/utils/constants";
import { useAuth } from "@/context/AuthContext";
import styles from "./ImagineBase.module.scss";

interface MainContainerProps {
  showImageInput?: boolean;
  showMaskInput?: boolean;
  formValid: boolean;
  handleGenerate: () => void;
}

const ImagineBase = (props: MainContainerProps) => {
  const { img2imgFile, setImg2imgFile, maskFile, setMaskFile } = useImagine();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const isMobile = width < MOBILE_SCREEN_WIDTH;

  const ImagineInputInstance = (
    <ImagineInput
      isFormValid={props.formValid}
      handleGenerate={props.handleGenerate}
    />
  );

  return (
    <ImagineLayout>
      <main className={styles.imagineBase}>
        {isMobile && <ImagineMenu />}
        {isMobile && ImagineInputInstance}

        <div className={styles.imagesContent}>
          {(props.showImageInput || props.showMaskInput) && (
            <div className={styles.inputImage}>
              {props.showImageInput && (
                <ImageDraggable
                  label={"Base Image"}
                  imageFile={img2imgFile}
                  setImageFile={setImg2imgFile}
                  showEditImage={props.showMaskInput}
                  showPaintImageLink={true}
                />
              )}
              {props.showMaskInput && (
                <ImageDraggable
                  label={"Mask image"}
                  imageFile={maskFile}
                  setImageFile={setMaskFile}
                  icon={<UploadMaskIcon />}
                  showPaintMask={img2imgFile !== null}
                />
              )}
            </div>
          )}

          <div className={styles.results}>
            <ImageGallery />
            <br />
          </div>
        </div>

        {!isMobile && ImagineInputInstance}
      </main>
      {user?.is_new_user && <IntroductoryWalkthroughApp />}
    </ImagineLayout>
  );
};

export default ImagineBase;