import React from "react";
import { useRouter } from "next/router";
import { exportToBlob } from "../../packages/utils";
import { useImagine } from "@/context/ImagineContext";
import { getFileFromBlob } from "@/utils/images";
import { useApp, useExcalidrawAppState, useExcalidrawElements } from "../App";
import ButtonPrimary from "@/components/buttons/ButtonPrimary/ButtonPrimary";

export const SendImageToImagine = () => {
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
      router.back();
    });
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="w-auto h-auto fixed bottom-6 right-6 flex gap-6 max-md:w-[calc(100%-48px)] [&>button]:max-w-[250px]">
      <ButtonPrimary loading={false} text={"Cancel"} onClick={handleCancel} />
      <ButtonPrimary
        loading={false}
        text={"Use on imagine"}
        onClick={handleSendTo}
      />
    </div>
  );
};
SendImageToImagine.displayName = "SendImageToImagine";
