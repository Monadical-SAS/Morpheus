import { NextPage } from "next";

import ImagineBase from "@/components/ImagineBase/ImagineBase";
import { useDiffusion } from "@/context/SDContext";
import { useImagine } from "@/context/ImagineContext";
import { useAnalytics } from "@/context/GoogleAnalyticsContext";

const Text2img: NextPage = () => {
  const { prompt } = useDiffusion();
  const { sendAnalyticsRecord } = useAnalytics();
  const { generateImages } = useImagine();
  const isFormValid = prompt.value.length > 0;

  const handleGenerate = () => {
    generateImages("text2img");
    sendAnalyticsRecord("generate_images", {
      prompt: prompt.value,
      model: "text2img",
    });
  };

  return (
    <ImagineBase
      formValid={isFormValid}
      showImageInput={false}
      showMaskInput={false}
      handleGenerate={handleGenerate}
    />
  );
};

export default Text2img;
