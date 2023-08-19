import { ReactNode } from "react";
import { useRouter } from "next/router";

import Brand from "../Typography/Brand/Brand";
import { SDOption } from "@/context/SDContext";
import { Text2ImgIcon } from "../icons/text2img";
import { Img2ImgIcon } from "../icons/img2img";
import { ControlNetIcon } from "../icons/controlnet";
import { Pix2PixIcon } from "../icons/pix2pix";
import { InpaintingIcon } from "../icons/inpainting";
import { OpenSource } from "@/components/OpenSource/OpenSource";
import { EnhanceIcon } from "../icons/enhance";
import AppTooltip from "@/components/Tooltip/AppTooltip";
import {
  ControlNetDescription,
  Img2ImgDescription,
  InpaintingDescription,
  Pix2PixDescription,
  Text2ImgDescription,
  UpscalingDescription,
} from "@/components/ImagineActionsDescription/ImagineActionsDescription";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { MOBILE_SCREEN_WIDTH } from "@/utils/constants";
import styles from "./ImagineMenu.module.scss";

interface LongItemProps {
  active?: boolean;
  icon: ReactNode;
  title: string;
  description: ReactNode;
  option: string;
}

const ImagineMenuItem = (props: LongItemProps) => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < MOBILE_SCREEN_WIDTH;

  const getItemStyles = () => {
    return `${styles.menuItem}  ${props.active && styles.active}`;
  };

  const handleOnClick = () => {
    router.push(`/imagine/${props.option}`);
  };

  return (
    <AppTooltip
      title={props.title}
      content={props.description}
      direction={isMobile ? "bottom" : "right"}
    >
      <div className={getItemStyles()} onClick={handleOnClick}>
        <span className={styles.icon}>{props.icon}</span>

        <p className={`base-1 ${props.active ? "primary" : "secondary"}`}>
          {props.title}
        </p>
      </div>
    </AppTooltip>
  );
};

const ImagineMenu = () => {
  const router = useRouter();
  const currentPath = router.pathname;

  const getItemActive = (option: SDOption | string) => {
    const lastPath = currentPath.split("/").pop();
    return lastPath === option;
  };

  const getIconColor = (option: SDOption | string) => {
    const isActive = getItemActive(option);
    return isActive ? "#ffffff" : "#6D6D94";
  };

  return (
    <div className={styles.imagineMenu}>
      <div className={styles.brandContainer}>
        <Brand />
      </div>

      <p className="base-1 white">Models</p>

      <ImagineMenuItem
        title={"Text To Image"}
        description={<Text2ImgDescription className="body-2 white" />}
        active={getItemActive(SDOption.Text2Image)}
        icon={<Text2ImgIcon color={getIconColor(SDOption.Text2Image)} />}
        option={SDOption.Text2Image}
      />
      <ImagineMenuItem
        title={"Image to Image"}
        description={<Img2ImgDescription className="body-2 white" />}
        active={getItemActive(SDOption.Image2Image)}
        icon={<Img2ImgIcon color={getIconColor(SDOption.Image2Image)} />}
        option={SDOption.Image2Image}
      />
      <ImagineMenuItem
        title={"Pix2Pix"}
        description={<Pix2PixDescription className="body-2 white" />}
        active={getItemActive(SDOption.Pix2Pix)}
        icon={<Pix2PixIcon color={getIconColor(SDOption.Pix2Pix)} />}
        option={SDOption.Pix2Pix}
      />
      <ImagineMenuItem
        title={"ControlNet"}
        description={<ControlNetDescription className="body-2 white" />}
        active={getItemActive(SDOption.ControlNet)}
        icon={<ControlNetIcon color={getIconColor(SDOption.ControlNet)} />}
        option={SDOption.ControlNet}
      />
      <ImagineMenuItem
        title={"In-painting"}
        description={<InpaintingDescription className="body-2 white" />}
        active={getItemActive(SDOption.Inpainting)}
        icon={<InpaintingIcon color={getIconColor(SDOption.Inpainting)} />}
        option={SDOption.Inpainting}
      />
      <ImagineMenuItem
        title={"Upscaling"}
        description={<UpscalingDescription className="body-2 white" />}
        active={getItemActive(SDOption.Upscaling)}
        icon={
          <EnhanceIcon
            color={getIconColor(SDOption.Upscaling)}
            width={"24"}
            height={"24"}
          />
        }
        option={SDOption.Upscaling}
      />

      <OpenSource />
    </div>
  );
};

export default ImagineMenu;
