import React from "react";
import { Tooltip } from "@/excalidraw/components/Tooltip";
import { MainMenu } from "../../packages/excalidraw/index";
import { SendImageTo } from "../../components/ImageSendImagine";
import styles from "./AppImagineMenu.module.scss";

export const AppImagineMenu = () => {
  return (
    <div className={styles.AppImagineMenu}>
      <Tooltip label="Send to img2img">
        <MainMenu.ItemCustom className={styles["dropdown-menu-item-base"]}>
          <SendImageTo redirectPath={"img2img"} />
        </MainMenu.ItemCustom>
      </Tooltip>
    </div>
  );
};
