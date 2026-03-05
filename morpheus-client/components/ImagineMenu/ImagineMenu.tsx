import React, { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

import Brand from "../Typography/Brand/Brand";
import { ModelCategory, useModels } from "@/context/ModelsContext";
import { Text2ImgIcon } from "../icons/text2img";
import { Img2ImgIcon } from "../icons/img2img";
import { ControlNetIcon } from "../icons/controlnet";
import { Pix2PixIcon } from "../icons/pix2pix";
import { InpaintingIcon } from "../icons/inpainting";
import { OpenSource } from "@/components/OpenSource/OpenSource";
import { EnhanceIcon } from "../icons/enhance";
import ButtonPrimary from "@/components/buttons/ButtonPrimary/ButtonPrimary";
import Modal from "@/components/Modal/Modal";
import { useToastContext } from "@/context/ToastContext";
import styles from "./ImagineMenu.module.scss";
import useWindowDimensions from "@/hooks/useWindowDimensions";

const categoryConfigs = [
  {
    name: ModelCategory.Text2Image,
    title: "Text To Image",
    icon: <Text2ImgIcon height={"18px"} width={"18px"} />,
  },
  {
    name: ModelCategory.Image2Image,
    title: "Image to Image",
    icon: <Img2ImgIcon height={"18px"} width={"18px"} />,
  },
  {
    name: ModelCategory.Pix2Pix,
    title: "Pix2Pix",
    icon: <Pix2PixIcon height={"18px"} width={"18px"} />,
  },
  {
    name: ModelCategory.ControlNet,
    title: "ControlNet",
    icon: <ControlNetIcon height={"18px"} width={"18px"} />,
  },
  {
    name: ModelCategory.Inpainting,
    title: "In-painting",
    icon: <InpaintingIcon height={"18px"} width={"18px"} />,
  },
  {
    name: ModelCategory.Upscaling,
    title: "Upscaling",
    icon: <EnhanceIcon width={"18px"} height={"18px"} />,
  },
];

const ImagineMenu = () => {
  const router = useRouter();
  const { models, selectedModel, activeLink, setActiveLink, findValidModelForFeature } = useModels();
  const { showInfoAlert } = useToastContext();
  const imagineOptionPath = router.pathname.split("/").pop();
  const [showMobileModal, setShowMobileModal] = useState(false);
  const { isMobile } = useWindowDimensions();
  const lastShownAlertRef = useRef<string | null>(null);

  useEffect(() => {
    if (!router.pathname.endsWith("paint")) {
      const currentModelSupportsFeature = selectedModel?.categories?.some(
        (c) => c.name === imagineOptionPath
      );

      if (currentModelSupportsFeature) {
        setActiveLink({
          model: selectedModel,
          feature: imagineOptionPath as ModelCategory,
        });
      } else {
        const compatibleModel = findValidModelForFeature(imagineOptionPath as ModelCategory);
        setActiveLink({
          model: compatibleModel,
          feature: imagineOptionPath as ModelCategory,
        });
      }
    }
  }, [imagineOptionPath]);

  const activeFeatureLabel =
    categoryConfigs.find((c) => c.name === activeLink.feature)?.title ||
    activeLink.feature ||
    "Select feature";

  const visibleFeatures = categoryConfigs.filter((f) =>
    models.some((m) => m.categories.some((c) => c.name === f.name))
  );

  const FeatureList = (
    <Fragment>
      {visibleFeatures.map((feature) => (
        <FeatureItem
          key={feature.name}
          title={feature.title}
          icon={feature.icon}
          feature={feature.name}
          active={activeLink.feature === feature.name}
        />
      ))}
    </Fragment>
  );

  return isMobile ? (
    <Fragment>
      <ButtonPrimary
        text={activeFeatureLabel}
        onClick={() => setShowMobileModal(true)}
        loading={false}
        className={styles.mobileButton}
      />
      <Modal
        width={"610px"}
        height={"auto"}
        isOpen={showMobileModal}
        toggleModal={() => setShowMobileModal(!showMobileModal)}
      >
        {FeatureList}
      </Modal>
    </Fragment>
  ) : (
    <div className={styles.imagineMenu}>
      <div className={styles.brandContainer}>
        <Brand />
      </div>

      <p className="base-1 white">Features</p>
      {FeatureList}

      <OpenSource />
    </div>
  );
};

interface FeatureItemProps {
  title: string;
  icon: ReactNode;
  feature: ModelCategory | string;
  active: boolean;
}

const FeatureItem = (props: FeatureItemProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/imagine/${props.feature}`);
  };

  return (
    <div
      className={`${styles.menuItem} ${props.active ? styles.active : ""}`}
      onClick={handleClick}
    >
      <span className={styles.icon}>
        {React.cloneElement(props.icon as React.ReactElement, {
          color: props.active ? "#B3005E" : "#6D6D94",
        })}
      </span>
      <span className={`base-1 ${props.active ? "main" : "secondary"}`}>
        {props.title}
      </span>
    </div>
  );
};

export default ImagineMenu;