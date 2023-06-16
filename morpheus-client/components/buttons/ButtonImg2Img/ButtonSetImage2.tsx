import React, { ReactNode } from "react";
import AppTooltip from "@/components/Tooltip/AppTooltip";
import { useRouter } from "next/router";
import { useImagine } from "@/context/ImagineContext";

type ButtonImg2ImgProps = {
  image: string;
  icon: ReactNode;
  redirect: string;
  toggleModal?: () => void;
};

const ButtonSetImage2 = (props: ButtonImg2ImgProps) => {
  const router = useRouter();
  const { setImg2ImgURL } = useImagine();

  const handleSetToImgToImg = () => {
    setImg2ImgURL(props.image);
    props.toggleModal && props.toggleModal();
    router.push(`/imagine/${props.redirect}`);
  };

  return (
    <AppTooltip content={`Use in ${props.redirect}`} direction="top">
      <span onClick={handleSetToImgToImg}>{props.icon}</span>
    </AppTooltip>
  );
};

export default ButtonSetImage2;
