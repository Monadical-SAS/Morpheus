import { NextPage } from "next";
import ImagineBase from "@/components/ImagineBase/ImagineBase";
import { useDiffusion } from "@/context/DiffusionContext";
import { useImagine } from "@/context/ImagineContext";
import { useAnalytics } from "@/context/GoogleAnalyticsContext";

const Upscale: NextPage = () => {
  const { prompt } = useDiffusion();
  const { sendAnalyticsRecord } = useAnalytics();
  const { img2imgFile, generateImages } = useImagine();
  const isFormValid = prompt.value.length > 0 && img2imgFile !== null;

  const handleGenerate = () => {
    generateImages("upscaling");
    sendAnalyticsRecord("generate_images", {
      prompt: prompt.value,
      model: "upscaling",
    });
  };

  return (
    <ImagineBase
      formValid={isFormValid}
      showImageInput={true}
      showMaskInput={false}
      handleGenerate={handleGenerate}
    />
  );
};

export default Upscale;
