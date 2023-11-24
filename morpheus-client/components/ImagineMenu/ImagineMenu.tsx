import React, { Fragment, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";

import Brand from "../Typography/Brand/Brand";
import { ModelCategory, useModels } from "@/context/ModelsContext";
import { Accordion } from "@/components/atoms/accordion/Accordion";
import { Text2ImgIcon } from "../icons/text2img";
import { Img2ImgIcon } from "../icons/img2img";
import { ControlNetIcon } from "../icons/controlnet";
import { Pix2PixIcon } from "../icons/pix2pix";
import { InpaintingIcon } from "../icons/inpainting";
import { OpenSource } from "@/components/OpenSource/OpenSource";
import { EnhanceIcon } from "../icons/enhance";
import AppTooltip from "@/components/Tooltip/AppTooltip";
import ButtonPrimary from "@/components/buttons/ButtonPrimary/ButtonPrimary";
import Modal from "@/components/Modal/Modal";
import {
  ControlNetDescription,
  Img2ImgDescription,
  InpaintingDescription,
  Pix2PixDescription,
  Text2ImgDescription,
  UpscalingDescription,
} from "@/components/ImagineActionsDescription/ImagineActionsDescription";
import { Model } from "@/models/models";
import styles from "./ImagineMenu.module.scss";
import useWindowDimensions from "@/hooks/useWindowDimensions";

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
  const [showModelsModal, setShowModelsModal] = useState(false);
  const { isMobile } = useWindowDimensions();

  useEffect(() => {
    if (!router.pathname.endsWith("paint")) {
      const currentModelSupportsFeature =
        selectedModel &&
        selectedModel.categories &&
        selectedModel.categories.some(
          (category) => category.name === imagineOptionPath
        );

      if (currentModelSupportsFeature) {
        setActiveLink({
          model: selectedModel,
          feature: imagineOptionPath as ModelCategory,
        });
      } else {
        setActiveLink({
          model: findValidModelForFeature(imagineOptionPath as ModelCategory),
          feature: imagineOptionPath as ModelCategory,
        });
      }
    }
  }, [imagineOptionPath]);

  const getMobileTitle = () => {
    if (activeLink.model && activeLink.feature) {
      return `${activeLink.model.name} / ${activeLink.feature}`;
    } else {
      return "No models found";
    }
  };

  const ModelsAccordion = models.map((model: Model) => (
    <Accordion
      key={model.source}
      itemId={model.source}
      title={model.name}
      setOpenedItem={setOpenItem}
      isOpen={
        openItem === model.source || activeLink.model.source === model.source
      }
    >
      <ModelMenuFeatures model={model} />
    </Accordion>
  ));

  return isMobile ? (
    <Fragment>
      <ButtonPrimary
        text={getMobileTitle()}
        onClick={() => setShowModelsModal(true)}
        loading={false}
        className={styles.mobileButton}
      />
      <Modal
        width={"610px"}
        height={"auto"}
        isOpen={showModelsModal}
        toggleModal={() => setShowModelsModal(!showModelsModal)}
      >
        {ModelsAccordion}
      </Modal>
    </Fragment>
  ) : (
    <div className={styles.imagineMenu}>
      <div className={styles.brandContainer}>
        <Brand />
      </div>

      <p className="base-1 white">Models</p>
      {ModelsAccordion}

      <OpenSource />
    </div>
  );
};

interface ImagineMenuFeaturesProps {
  model: Model;
}

const ModelMenuFeatures = (props: ImagineMenuFeaturesProps) => {
  const { activeLink } = useModels();

  const getItemActive = (option: ModelCategory | string) => {
    return (
      activeLink.model.source === props.model.source &&
      activeLink.feature === option
    );
  };

  const getIconColor = (option: ModelCategory | string) => {
    return getItemActive(option) ? "#B3005E" : "#6D6D94";
  };

  const categoryConfigs = [
    {
      name: ModelCategory.Text2Image,
      title: "Text To Image",
      description: <Text2ImgDescription className="body-2 white" />,
      icon: <Text2ImgIcon height={"18px"} width={"18px"} />,
    },
    {
      name: ModelCategory.Image2Image,
      title: "Image to Image",
      description: <Img2ImgDescription className="body-2 white" />,
      icon: <Img2ImgIcon height={"18px"} width={"18px"} />,
    },
    {
      name: ModelCategory.Pix2Pix,
      title: "Pix2Pix",
      description: <Pix2PixDescription className="body-2 white" />,
      icon: <Pix2PixIcon height={"18px"} width={"18px"} />,
    },
    {
      name: ModelCategory.ControlNet,
      title: "ControlNet",
      description: <ControlNetDescription className="body-2 white" />,
      icon: <ControlNetIcon height={"18px"} width={"18px"} />,
    },
    {
      name: ModelCategory.Inpainting,
      title: "In-painting",
      description: <InpaintingDescription className="body-2 white" />,
      icon: <InpaintingIcon height={"18px"} width={"18px"} />,
    },
    {
      name: ModelCategory.Upscaling,
      title: "Upscaling",
      description: <UpscalingDescription className="body-2 white" />,
      icon: <EnhanceIcon width={"18px"} height={"18px"} />,
    },
  ];

  return (
    <Fragment>
      {categoryConfigs.map(
        (category) =>
          props.model.categories.some(
            (modelCategory) => modelCategory.name === category.name
          ) && (
            <ImagineMenuItem
              key={`${props.model.source}-${category.name}-menu-item`}
              title={category.title}
              description={category.description}
              icon={React.cloneElement(category.icon, {
                color: getIconColor(category.name),
              })}
              active={getItemActive(category.name)}
              option={category.name}
              model={props.model}
            />
          )
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
  const { setActiveLink, activeLink } = useModels();
  const { isMobile } = useWindowDimensions();

  const getItemStyles = () => {
    return `${styles.menuItem}  ${props.active && styles.active}`;
  };

  const handleOnClick = () => {
    setActiveLink({
      model: props.model,
      feature: props.option as ModelCategory,
    });
  };

  useEffect(() => {
    if (!router.pathname.endsWith("paint")) {
      const baseUrl = !router.pathname.startsWith("imagine") ? "/imagine" : "";
      router.push(`${baseUrl}/${activeLink.feature}`);
    }
  }, [activeLink]);

  return (
    <AppTooltip
      title={props.title}
      content={isMobile ? null : props.description}
      direction={isMobile ? "bottom" : "right"}
    >
      <div className={getItemStyles()} onClick={handleOnClick}>
        <span className={styles.icon}>{props.icon}</span>

        <span className={`base-1 ${props.active ? "main" : "secondary"}`}>
          {props.title}
        </span>
      </div>
    </AppTooltip>
  );
};

export default ImagineMenu;
