import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { getFileBlobFromURL } from "@/utils/images";
import {
  generateImageWithControlNet,
  generateImageWithImg2Img,
  generateImageWithInpainting,
  generateImageWithPix2Pix,
  generateImageWithText2Img,
  generateImageWithUpscaling,
  getGeneratedDataWithRetry,
} from "@/services/sdiffusion";
import { useDiffusion } from "./DiffusionContext";
import { useControlNet } from "./CNContext";
import { ErrorResponse } from "@/utils/common";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToastContext } from "@/context/ToastContext";
import { Prompt, ServerResponse } from "@/models/models";
import { useRouter } from "next/router";
import {
  COLOR_PALETTES_CONTROLNET,
  COLOR_PALETTES_IMAGE_TO_IMAGE,
} from "@/utils/constants";

type ImagineOptions =
  | "text2img"
  | "img2img"
  | "controlnet"
  | "pix2pix"
  | "inpainting"
  | "upscaling";

export type ImagineResult = {
  prompt: Prompt;
  images: Array<string>;
};

export interface ImagineContextProps {
  isLoading: boolean;
  setImg2ImgURL: (image: string) => void;
  img2imgFile: File | null;
  setImg2imgFile: (image: File | null) => void;
  maskFile: File | null;
  setMaskFile: (image: File | null) => void;
  colorPaletteFile: File | null;
  setColorPaletteFile: (image: File | null) => void;
  generateImages: (option: ImagineOptions) => void;
  resultImages: Array<ImagineResult>;
  clearResults: () => void;
}

const ImagineContext = createContext<ImagineContextProps>(
  {} as ImagineContextProps
);

const ImagineProvider = (props: { children: ReactNode }) => {
  const { pathname } = useRouter();
  const {
    prompt,
    buildPrompt,
    restartSDSettings,
    paletteTechnique,
    setPaletteTechnique,
  } = useDiffusion();
  const { buildControlNetPrompt } = useControlNet();
  const { showErrorAlert } = useToastContext();

  // Image to image images
  const [img2ImgURL, setImg2ImgURL] = useState<string>("");
  const [img2imgFile, setImg2imgFile] = useState<File | null>(null);
  const [maskFile, setMaskFile] = useState<File | null>(null);
  const [colorPaletteFile, setColorPaletteFile] = useState<File | null>(null);

  // Image results
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resultImages, setResultImages] = useState<Array<ImagineResult>>([]);
  const [localResults, setLocalResults] = useLocalStorage<Array<ImagineResult>>(
    "results",
    []
  );

  useEffect(() => {
    if (img2ImgURL) {
      getFileBlobFromURL(img2ImgURL)
        .then((file: File) => {
          setImg2imgFile(file);
          setImg2ImgURL("");
        })
        .catch(() => {
          showErrorAlert("Error getting file from URL");
        });
    }
  }, [img2ImgURL]);

  useEffect(() => {
    maskFile && setMaskFile(null);
  }, [img2imgFile]);

  useEffect(() => {
    if (localResults.length > 0 && resultImages.length === 0) {
      setResultImages(localResults);
    }
  }, [localResults]);

  // Set default palette technique when changing color palette file
  useEffect(() => {
    console.log(paletteTechnique, pathname);
    if (colorPaletteFile) {
      if (pathname.endsWith("/img2img")) {
        const validPalette = COLOR_PALETTES_IMAGE_TO_IMAGE.find(
          (palette: string) => palette === paletteTechnique
        );
        if (!validPalette) {
          setPaletteTechnique(COLOR_PALETTES_IMAGE_TO_IMAGE[0]);
        }
      }
      if (pathname.endsWith("/controlnet")) {
        const validPalette = COLOR_PALETTES_CONTROLNET.find(
          (palette: string) => palette === paletteTechnique
        );
        if (!validPalette) {
          setPaletteTechnique(COLOR_PALETTES_CONTROLNET[0]);
        }
      }
    }
  }, [colorPaletteFile, paletteTechnique, pathname]);

  const generateImages = async (option: ImagineOptions) => {
    setIsLoading(true);
    restartSDSettings();

    const config =
      option === "controlnet" ? buildControlNetPrompt() : buildPrompt();
    const request = { prompt: prompt.value, ...config };

    const response: ServerResponse = await enqueueTaskRequest(option, request);
    if (!response.success) {
      setIsLoading(false);
      showErrorAlert(response.message || "Error generating image");
      return;
    }
    const taskId = response.data;
    const responseModel: ServerResponse = await getGeneratedDataWithRetry(
      taskId
    );
    console.log("responseModel", responseModel);
    if (!responseModel.success) {
      setIsLoading(false);
      showErrorAlert(
        responseModel.message || "An error occurred while generating the images"
      );
      return;
    }

    appendResults(request, responseModel.data.results);
    setIsLoading(false);
  };

  const enqueueTaskRequest = async (option: ImagineOptions, request: any) => {
    try {
      if (option === "text2img") {
        return await generateImageWithText2Img(request);
      } else if (option === "img2img") {
        return await generateImageWithImg2Img(
          request,
          img2imgFile,
          colorPaletteFile
        );
      } else if (option === "controlnet") {
        return await generateImageWithControlNet(
          request,
          img2imgFile,
          colorPaletteFile
        );
      } else if (option === "pix2pix") {
        return await generateImageWithPix2Pix(request, img2imgFile);
      } else if (option === "inpainting") {
        return await generateImageWithInpainting(
          request,
          img2imgFile,
          maskFile
        );
      } else if (option === "upscaling") {
        return await generateImageWithUpscaling(request, img2imgFile);
      } else {
        return ErrorResponse("Please select a valid option");
      }
    } catch (error: any) {
      return ErrorResponse(error.message);
    }
  };

  const appendResults = (request: any, results: string[]) => {
    if (results.length === 0) return;
    const lastResult = resultImages[0];
    let newResults: ImagineResult[];
    if (lastResult && lastResult.prompt.prompt === prompt.value) {
      lastResult.images = [...results, ...lastResult.images];
      newResults = [lastResult, ...resultImages.slice(1)];
    } else {
      const newResult = {
        prompt: request,
        images: results || [],
      };
      newResults = [newResult, ...resultImages];
    }
    setResultImages(newResults);
    setLocalResults(newResults);
  };

  const clearResults = () => {
    setResultImages([]);
    setLocalResults([]);
  };

  return (
    <ImagineContext.Provider
      value={{
        isLoading,
        setImg2ImgURL,
        img2imgFile,
        setImg2imgFile,
        maskFile,
        setMaskFile,
        colorPaletteFile,
        setColorPaletteFile,
        generateImages,
        resultImages,
        clearResults,
      }}
    >
      {props.children}
    </ImagineContext.Provider>
  );
};
const useImagine = () => {
  const context = useContext(ImagineContext);
  if (context === undefined) {
    throw new Error("useImagine must be used within a ImagineProvider");
  }
  return context;
};

export { ImagineProvider, useImagine };
