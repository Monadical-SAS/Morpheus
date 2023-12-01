import { NextPage } from "next";

import ImagineBase from "@/components/ImagineBase/ImagineBase";
import { useDiffusion } from "@/context/DiffusionContext";
import { useImagine } from "@/context/ImagineContext";
import { useAnalytics } from "@/context/GoogleAnalyticsContext";

const Img2Img: NextPage = () => {
  const { prompt } = useDiffusion();
  const { sendAnalyticsRecord } = useAnalytics();
  const { img2imgFile, generateImages } = useImagine();
  const isFormValid = prompt.value.length > 0 && img2imgFile !== null;

  const handleGenerate = async () => {
    generateImages("pix2pix");
    sendAnalyticsRecord("generate_images", {
      prompt: prompt.value,
      model: "pix2pix",
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

export default Img2Img;
