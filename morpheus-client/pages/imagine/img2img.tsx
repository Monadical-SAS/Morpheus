import { NextPage } from "next";

import ImagineBase from "@/components/ImagineBase/ImagineBase";
import { CookiesStatus } from "@/utils/cookies";
import { useDiffusion } from "@/context/SDContext";
import { useImagine } from "@/context/ImagineContext";
import { useAnalytics } from "@/context/GoogleAnalyticsContext";
import React from "react";

const Img2Img: NextPage = () => {
  const { prompt } = useDiffusion();
  const { cookiesStatus, sendAnalyticsRecord } = useAnalytics();
  const { img2imgFile, generateImages } = useImagine();
  const isFormValid = prompt.value.length > 0 && img2imgFile !== null;

  const handleGenerate = () => {
    generateImages("img2img");
    if (cookiesStatus === CookiesStatus.Accepted) {
      sendAnalyticsRecord("generate_images", {
        prompt: prompt.value,
        model: "img2img",
      });
    }
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

export default Img2Img;