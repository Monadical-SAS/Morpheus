import { NextPage } from "next";

import ImagineBase from "@/components/ImagineBase/ImagineBase";
import { CookiesStatus } from "@/utils/cookies";
import { useDiffusion } from "@/context/SDContext";
import { useImagine } from "@/context/ImagineContext";
import { useAnalytics } from "@/context/GoogleAnalyticsContext";

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
    <ImagineBase
      formValid={isFormValid}
      showImageInput={false}
      showMaskInput={false}
      handleGenerate={handleGenerate}
    />
  );
};

export default Text2img;
