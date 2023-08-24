import { Fragment, ReactNode, useState } from "react";
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
import { useModels } from "@/context/ModelsContext";
import { Model } from "@/models/models";
import { Accordion } from "@/components/atoms/accordion/Accordion";

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

        <p className={`base-1 ${props.active ? "main" : "secondary"}`}>
          {props.title}
        </p>
      </div>
    </AppTooltip>
  );
};

interface ImagineMenuFeaturesProps {
  model: Model;
}

const ImagineMenuFeatures = (props: ImagineMenuFeaturesProps) => {
  const router = useRouter();
  const currentPath = router.pathname;

  const getItemActive = (option: SDOption | string) => {
    const lastPath = currentPath.split("/").pop();
    return lastPath === option;
  };

  const getIconColor = (option: SDOption | string) => {
    const isActive = getItemActive(option);
    return isActive ? "#B3005E" : "#6D6D94";
  };

  return (
    <Fragment>
      {props.model.text2img && (
        <ImagineMenuItem
          title={"Text To Image"}
          description={<Text2ImgDescription className="body-2 white" />}
          active={getItemActive(SDOption.Text2Image)}
          icon={
            <Text2ImgIcon
              height={"18px"}
              width={"18px"}
              color={getIconColor(SDOption.Text2Image)}
            />
          }
          option={SDOption.Text2Image}
        />
      )}
      {props.model.img2img && (
        <ImagineMenuItem
          title={"Image to Image"}
          description={<Img2ImgDescription className="body-2 white" />}
          active={getItemActive(SDOption.Image2Image)}
          icon={
            <Img2ImgIcon
              height={"18px"}
              width={"18px"}
              color={getIconColor(SDOption.Image2Image)}
            />
          }
          option={SDOption.Image2Image}
        />
      )}
      {props.model.pix2pix && (
        <ImagineMenuItem
          title={"Pix2Pix"}
          description={<Pix2PixDescription className="body-2 white" />}
          active={getItemActive(SDOption.Pix2Pix)}
          icon={
            <Pix2PixIcon
              height={"18px"}
              width={"18px"}
              color={getIconColor(SDOption.Pix2Pix)}
            />
          }
          option={SDOption.Pix2Pix}
        />
      )}
      {props.model.controlnet && (
        <ImagineMenuItem
          title={"ControlNet"}
          description={<ControlNetDescription className="body-2 white" />}
          active={getItemActive(SDOption.ControlNet)}
          icon={
            <ControlNetIcon
              height={"18px"}
              width={"18px"}
              color={getIconColor(SDOption.ControlNet)}
            />
          }
          option={SDOption.ControlNet}
        />
      )}
      {props.model.inpainting && (
        <ImagineMenuItem
          title={"In-painting"}
          description={<InpaintingDescription className="body-2 white" />}
          active={getItemActive(SDOption.Inpainting)}
          icon={
            <InpaintingIcon
              height={"18px"}
              width={"18px"}
              color={getIconColor(SDOption.Inpainting)}
            />
          }
          option={SDOption.Inpainting}
        />
      )}
      {props.model.upscaling && (
        <ImagineMenuItem
          title={"Upscaling"}
          description={<UpscalingDescription className="body-2 white" />}
          active={getItemActive(SDOption.Upscaling)}
          icon={
            <EnhanceIcon
              width={"18px"}
              height={"18px"}
              color={getIconColor(SDOption.Upscaling)}
            />
          }
          option={SDOption.Upscaling}
        />
      )}
    </Fragment>
  );
};

const ImagineMenu = () => {
  const { models, setSelectedModel } = useModels();
  const [openItem, setOpenItem] = useState<string>(models[0]?.name);

  const handleOnOpen = (item: string) => {
    const selectedModel = models.find((model: Model) => model.name === item);
    setSelectedModel(selectedModel?.source || "");
    setOpenItem(item);
  }

  return (
    <div className={styles.imagineMenu}>
      <div className={styles.brandContainer}>
        <Brand />
      </div>

      <p className="base-1 white">Models</p>

      {models.map((model: Model) => (
        <Accordion
          key={model.source}
          title={model.name}
          setOpenedItem={handleOnOpen}
          isOpen={openItem === model.name}
        >
          <ImagineMenuFeatures model={model} />
        </Accordion>
      ))}

      <OpenSource />
    </div>
  );
};

export default ImagineMenu;
