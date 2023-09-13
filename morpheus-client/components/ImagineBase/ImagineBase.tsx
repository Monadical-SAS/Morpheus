import React, { Fragment } from "react";
import ImagineMenu from "../../components/ImagineMenu/ImagineMenu";
import ImagineImageInput from "@/components/ImagineImageInput/ImagineImageInput";
import ImageGallery from "@/components/ImageGallery/ImageGallery";
import ImagineInput from "@/components/ImagineInput/ImagineInput";
import ImagineLayout from "@/layout/ImagineLayout/ImagineLayout";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { UploadMaskIcon } from "@/components/icons/uploadMask";
import { useImagine } from "@/context/ImagineContext";
import { MOBILE_SCREEN_WIDTH } from "@/utils/constants";
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
  const isMobile = width < MOBILE_SCREEN_WIDTH && width !== 0;

  const ImagineInputInstance = (
    <ImagineInput
      isFormValid={props.formValid}
      handleGenerate={props.handleGenerate}
    />
  );

  const ImageInputs = (props.showImageInput || props.showMaskInput) && (
    <div className={styles.imageInputsContainer}>
      {props.showImageInput && (
        <ImagineImageInput
          label={"Base Image"}
          imageFile={img2imgFile}
          setImageFile={setImg2imgFile}
          showEditImage={props.showMaskInput}
          showPaintImageLink={true}
        />
      )}
      {props.showMaskInput && (
        <ImagineImageInput
          label={"Mask image"}
          imageFile={maskFile}
          setImageFile={setMaskFile}
          icon={<UploadMaskIcon />}
          showPaintMask={img2imgFile !== null}
        />
      )}
    </div>
  );

  return (
    <ImagineLayout>
      <main className={styles.imagineBase}>
        {isMobile && (
          <Fragment>
            <ImagineMenu />
            {ImageInputs}
            {ImagineInputInstance}
          </Fragment>
        )}

        <div className={styles.imagesContent}>
          {!isMobile && ImageInputs}

          <div className={styles.results}>
            <ImageGallery />
            <br />
          </div>
        </div>

        {!isMobile && ImagineInputInstance}
      </main>
    </ImagineLayout>
  );
};

export default ImagineBase;
