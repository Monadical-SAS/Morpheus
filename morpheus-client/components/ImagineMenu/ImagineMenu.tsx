import { Fragment, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";

import Brand from "../Typography/Brand/Brand";
import { SDOption } from "@/context/SDContext";
import { ModelFeature, useModels } from "@/context/ModelsContext";
import { Accordion } from "@/components/atoms/accordion/Accordion";
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
import { Model } from "@/models/models";
import { MOBILE_SCREEN_WIDTH } from "@/utils/constants";
import styles from "./ImagineMenu.module.scss";

const ImagineMenu = () => {
  const router = useRouter();
  const {
    models,
    selectedModel,
    activeLink,
    setActiveLink,
    findValidModelForFeature,
  } = useModels();
  const imagineOptionPath = router.pathname.split("/").pop();
  const [openItem, setOpenItem] = useState<string>();

  useEffect(() => {
    if (imagineOptionPath) {
      if (!selectedModel.features.includes(imagineOptionPath)) {
        const validModel = findValidModelForFeature(
          imagineOptionPath as ModelFeature
        );

        setActiveLink({
          model: validModel,
          feature: imagineOptionPath as ModelFeature,
        });
      } else {
        setActiveLink({
          model: selectedModel,
          feature: imagineOptionPath as ModelFeature,
        });
      }
    }
  }, []);

  return (
    <div className={styles.imagineMenu}>
      <div className={styles.brandContainer}>
        <Brand />
      </div>

      <p className="base-1 white">Models</p>

      {models.map((model: Model) => (
        <Accordion
          key={model.source}
          itemId={model.source}
          title={model.name}
          setOpenedItem={setOpenItem}
          isOpen={
            openItem === model.source ||
            activeLink.model.source === model.source
          }
        >
          <ModelMenuFeatures model={model} />
        </Accordion>
      ))}

      <OpenSource />
    </div>
  );
};

interface ImagineMenuFeaturesProps {
  model: Model;
}

const ModelMenuFeatures = (props: ImagineMenuFeaturesProps) => {
  const { activeLink } = useModels();

  const getItemActive = (option: SDOption | string) => {
    return (
      activeLink.model.source === props.model.source &&
      activeLink.feature === option
    );
  };

  const getIconColor = (option: SDOption | string) => {
    return getItemActive(option) ? "#B3005E" : "#6D6D94";
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
          model={props.model}
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
          model={props.model}
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
          model={props.model}
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
          model={props.model}
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
          model={props.model}
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
          model={props.model}
        />
      )}
    </Fragment>
  );
};

interface ImagineMenuItemProps {
  active?: boolean;
  icon: ReactNode;
  title: string;
  description: ReactNode;
  option: string;
  model: Model;
}

const ImagineMenuItem = (props: ImagineMenuItemProps) => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { setActiveLink } = useModels();
  const isMobile = width < MOBILE_SCREEN_WIDTH;

  const getItemStyles = () => {
    return `${styles.menuItem}  ${props.active && styles.active}`;
  };

  const handleOnClick = () => {
    setActiveLink({
      model: props.model,
      feature: props.option as ModelFeature,
    });
    router.push(props.option);
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

export default ImagineMenu;
