import { ReactNode, useState } from "react";
import { useRouter } from "next/router";

import Brand from "../Typography/Brand/Brand";
import { SDOption } from "@/context/SDContext";
import { Text2ImgIcon } from "../icons/text2img";
import { Img2ImgIcon } from "../icons/img2img";
import { ControlNetIcon } from "../icons/controlnet";
import { Pix2PixIcon } from "../icons/pix2pix";
import { InpaintingIcon } from "../icons/inpainting";
import { HelpIcon } from "../icons/help";
import { HamburgerMenuIcon } from "../icons/hamburgerMenu";
import { CloseIcon } from "../icons/close";
import AppTooltip from "@/components/Tooltip/AppTooltip";
import {
  ControlNetDescription,
  Img2ImgDescription,
  InpaintingDescription,
  Pix2PixDescription,
  Text2ImgDescription,
} from "@/components/ImagineActionsDescription/ImagineActionsDescription";
import styles from "./ImagineMenu.module.scss";

interface LongItemProps {
  active?: boolean;
  expanded: boolean;
  icon: ReactNode;
  title: string;
  description: ReactNode;
  option: string;
}

const ImagineMenuItem = (props: LongItemProps) => {
  const router = useRouter();

  const getItemStyles = () => {
    return `${styles.menuItem} ${props.expanded && styles.expanded} ${
      props.active && styles.active
    }`;
  };

  const handleOnClick = () => {
    router.push(`/imagine/${props.option}`);
  };

  return (
    <AppTooltip
      title={props.title}
      content={props.description}
      direction={"right"}
    >
      <div className={getItemStyles()} onClick={handleOnClick}>
        <span className={styles.icon}>{props.icon}</span>

        {props.expanded && (
          <p className={`base-1 ${props.active ? "primary" : "secondary"}`}>
            {props.title}
          </p>
        )}
      </div>
    </AppTooltip>
  );
};

const ImagineMenu = () => {
  const router = useRouter();
  const currentPath = router.pathname;
  const [expanded, setExpanded] = useState(false);

  const getItemActive = (option: SDOption | string) => {
    const lastPath = currentPath.split("/").pop();
    return lastPath === option;
  };

  const getIconColor = (option: SDOption | string) => {
    const isActive = getItemActive(option);
    return isActive ? "#ffffff" : "#6D6D94";
  };

  return (
    <div className={`${styles.imagineMenu} ${expanded && styles.barExpanded}`}>
      <div
        onClick={() => setExpanded(!expanded)}
        className={`${styles.menuIcon} ${expanded && styles.expanded}`}
      >
        {!expanded ? (
          <HamburgerMenuIcon color={"white"} />
        ) : (
          <div className={styles.closeTitle}>
            <CloseIcon width={"24px"} height={"24px"} />
            <Brand styles={{ marginLeft: "16px", fontSize: "20px" }} />
          </div>
        )}
      </div>

      <ImagineMenuItem
        title={"Text To Image"}
        description={<Text2ImgDescription className="body-2 white" />}
        expanded={expanded}
        active={getItemActive(SDOption.Text2Image)}
        icon={<Text2ImgIcon color={getIconColor(SDOption.Text2Image)} />}
        option={SDOption.Text2Image}
      />
      <ImagineMenuItem
        title={"Image to Image"}
        description={<Img2ImgDescription className="body-2 white" />}
        expanded={expanded}
        active={getItemActive(SDOption.Image2Image)}
        icon={<Img2ImgIcon color={getIconColor(SDOption.Image2Image)} />}
        option={SDOption.Image2Image}
      />
      <ImagineMenuItem
        title={"Pix2Pix"}
        description={<Pix2PixDescription className="body-2 white" />}
        expanded={expanded}
        active={getItemActive(SDOption.Pix2Pix)}
        icon={<Pix2PixIcon color={getIconColor(SDOption.Pix2Pix)} />}
        option={SDOption.Pix2Pix}
      />
      <ImagineMenuItem
        title={"ControlNet"}
        description={<ControlNetDescription className="body-2 white" />}
        expanded={expanded}
        active={getItemActive(SDOption.ControlNet)}
        icon={<ControlNetIcon color={getIconColor(SDOption.ControlNet)} />}
        option={SDOption.ControlNet}
      />
      <ImagineMenuItem
        title={"In-painting"}
        description={<InpaintingDescription className="body-2 white" />}
        expanded={expanded}
        active={getItemActive(SDOption.Inpainting)}
        icon={<InpaintingIcon color={getIconColor(SDOption.Inpainting)} />}
        option={SDOption.Inpainting}
      />
      <ImagineMenuItem
        title={"Help"}
        description={"Get help and support"}
        expanded={expanded}
        active={getItemActive("help")}
        icon={<HelpIcon color={getIconColor("help")} />}
        option={"help"}
      />
    </div>
  );
};

export default ImagineMenu;
