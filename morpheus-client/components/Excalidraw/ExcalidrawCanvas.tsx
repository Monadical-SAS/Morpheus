import { useRef } from "react";
import { flushSync } from "react-dom";
import { Excalidraw, exportToBlob } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/dist/types/excalidraw/types";
import { useRouter } from "next/router";
import { useImagine } from "@/context/ImagineContext";
import { getFileFromBlob } from "@/utils/images";
import ButtonPrimary from "@/components/buttons/ButtonPrimary/ButtonPrimary";

const ExcalidrawCanvas = () => {
  const excalidrawAPI = useRef<ExcalidrawImperativeAPI | null>(null);
  const router = useRouter();
  const { setImg2imgFile } = useImagine();

  const handleSendTo = async () => {
    console.log("[Excalidraw] handleSendTo called, api ready:", !!excalidrawAPI.current);
    if (!excalidrawAPI.current) {
      router.back();
      return;
    }
    try {
      const elements = excalidrawAPI.current.getSceneElements();
      console.log("[Excalidraw] exporting", elements.length, "elements");
      const blob = await exportToBlob({
        elements,
        appState: excalidrawAPI.current.getAppState(),
        files: excalidrawAPI.current.getFiles(),
        exportPadding: 10,
        maxWidthOrHeight: 512,
        mimeType: "image/png",
      });
      console.log("[Excalidraw] blob size:", blob?.size, "type:", blob?.type);
      flushSync(() => {
        setImg2imgFile(getFileFromBlob(blob, "excalidraw.png"));
      });
      console.log("[Excalidraw] img2imgFile set, navigating back");
    } catch (error) {
      console.error("[Excalidraw] export failed:", error);
    }
    router.back();
  };

  const handleCancel = () => router.back();

  return (
    <div className="relative w-full h-full">
      <Excalidraw excalidrawAPI={(api) => { excalidrawAPI.current = api; }} />
      <div className="w-auto h-auto fixed bottom-6 right-6 flex gap-6 max-md:w-[calc(100%-48px)] [&>button]:max-w-[250px]">
        <ButtonPrimary loading={false} text="Cancel" onClick={handleCancel} />
        <ButtonPrimary loading={false} text="Use on imagine" onClick={handleSendTo} />
      </div>
    </div>
  );
};

export default ExcalidrawCanvas;
