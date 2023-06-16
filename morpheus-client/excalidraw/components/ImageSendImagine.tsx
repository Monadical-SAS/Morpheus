import React from "react";
import { useRouter } from "next/router";
import DropdownMenuItem from "./dropdownMenu/DropdownMenuItem";
import { exportToBlob } from "../packages/utils";
import { useImagine } from "../../context/ImagineContext";
import { getFileFromBlob } from "../../utils/images";
import { useApp, useExcalidrawAppState, useExcalidrawElements } from "./App";
import { ImageIcon } from "./icons";

export const SendImageTo = ({
  redirectPath = "img2img",
}: {
  redirectPath?: string;
}) => {
  const router = useRouter();
  const app = useApp();
  const elements = useExcalidrawElements();
  const appState = useExcalidrawAppState();
  const { setImg2imgFile } = useImagine();

  const handleSendTo = () => {
    const props = {
      elements,
      appState,
      files: app.files,
      exportPadding: 10,
      maxWidthOrHeight: 512,
      mimeType: "image/png",
    };
    exportToBlob(props).then((blob) => {
      setImg2imgFile(getFileFromBlob(blob, "excalidraw.png"));
      router.push(`/imagine/${redirectPath}`);
    });
  };

  return (
    <DropdownMenuItem
      style={{ width: "100%", padding: "0" }}
      icon={ImageIcon}
      data-testid="image-send-to"
      onSelect={handleSendTo}
    >
      Send to {redirectPath}
    </DropdownMenuItem>
  );
};
SendImageTo.displayName = "SendImageTo";
