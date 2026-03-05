import React, { Fragment } from "react";
import ImagineMenu from "../../components/ImagineMenu/ImagineMenu";
import ImagineImageInput from "@/components/ImagineImageInput/ImagineImageInput";
import ImageGallery from "@/components/ImageGallery/ImageGallery";
import ImagineInput from "@/components/ImagineInput/ImagineInput";
import ImagineLayout from "@/layout/ImagineLayout/ImagineLayout";
import ImagineSettings from "@/components/ImagineSettings/ImagineSettings";
import ModelSelect from "@/components/ModelSelect/ModelSelect";
import { UploadMaskIcon } from "@/components/icons/uploadMask";
import { useImagine } from "@/context/ImagineContext";
import useWindowDimensions from "@/hooks/useWindowDimensions";


interface MainContainerProps {
  showImageInput?: boolean;
  showMaskInput?: boolean;
  showPaletteInput?: boolean;
  formValid: boolean;
  handleGenerate: () => void;
}

const ImagineBase = (props: MainContainerProps) => {
  const {
    img2imgFile,
    setImg2imgFile,
    maskFile,
    setMaskFile,
    colorPaletteFile,
    setColorPaletteFile,
  } = useImagine();
  const { isMobile } = useWindowDimensions();

  const ImagineInputInstance = (
    <ImagineInput
      isFormValid={props.formValid}
      handleGenerate={props.handleGenerate}
    />
  );

  const ImageInputs = (props.showImageInput || props.showMaskInput) && (
    <div className="w-full flex flex-wrap flex-row justify-start gap-6 flex-1 mb-12 max-md:mb-4">
      {props.showImageInput && (
        <ImagineImageInput
          label={"Base Image"}
          imageFile={img2imgFile}
          setImageFile={setImg2imgFile}
          showPaintImageLink={true}
          showColorPalette={false}
        />
      )}
      {props.showMaskInput && (
        <ImagineImageInput
          label={"Mask image"}
          imageFile={maskFile}
          setImageFile={setMaskFile}
          icon={<UploadMaskIcon />}
          showPaintMask={img2imgFile !== null}
          showColorPalette={false}
        />
      )}
      {props.showPaletteInput && (
        <ImagineImageInput
          label={"Palette image"}
          imageFile={colorPaletteFile}
          setImageFile={setColorPaletteFile}
          showPaintMask={false}
          showColorPalette={img2imgFile !== null}
        />
      )}
    </div>
  );

  return (
    <ImagineLayout>
      <main className="h-full flex-[1_auto] flex flex-col max-h-[calc(100vh-80px)] min-w-[300px] max-w-[100vw] max-md:flex-col max-md:max-h-full">
        {isMobile && (
          <Fragment>
            <ImagineMenu />
            {ImageInputs}
            {ImagineInputInstance}
          </Fragment>
        )}

        {!isMobile && (
          <div className="flex flex-row items-center justify-end pt-4 px-6 gap-4 bg-[#14172D]">
            <ModelSelect />
            <ImagineSettings />
          </div>
        )}

        <div className="w-full h-full flex flex-col p-6 max-h-[calc(100vh-180px)] overflow-y-auto rounded-bl-3xl bg-[#14172D] md:rounded-bl-none max-md:flex-col max-md:py-12 max-md:h-full max-md:max-h-full max-md:rounded-bl-none">
          {!isMobile && ImageInputs}

          <div className="w-full h-full flex-[2] flex flex-col">
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