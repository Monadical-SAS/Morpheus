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
  getGeneratedDiffusionImagesWithRetry,
} from "@/services/sdiffusion";
import { useDiffusion } from "./SDContext";
import { useControlNet } from "./CNContext";
import { ErrorResponse } from "@/utils/common";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToastContext } from "@/context/ToastContext";
import { Prompt } from "@/models/models";

type ImagineOptions =
  | "text2img"
  | "img2img"
  | "controlnet"
  | "pix2pix"
  | "inpainting";

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
  generateImages: (option: ImagineOptions) => void;
  resultImages: Array<ImagineResult>;
  clearResults: () => void;
}

const defaultState = {
  isLoading: false,
  setImg2ImgURL: () => console.log("setImg2ImgURL"),
  img2imgFile: null,
  setImg2imgFile: () => console.log("setImg2imgFile"),
  maskFile: null,
  setMaskFile: () => console.log("setMaskFile"),
  generateImages: () => console.log("generateImages"),
  resultImages: [],
  clearResults: () => console.log("clearResults"),
};

const ImagineContext = createContext<ImagineContextProps>(defaultState);

const ImagineProvider = (props: { children: ReactNode }) => {
  const { prompt, buildPrompt, restartSDSettings } = useDiffusion();
  const { buildControlNetPrompt } = useControlNet();
  const { showErrorAlert } = useToastContext();

  // Images settings
  const [img2ImgURL, setImg2ImgURL] = useState<string>("");
  const [img2imgFile, setImg2imgFile] = useState<File | null>(null);
  const [maskFile, setMaskFile] = useState<File | null>(null);

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
        .catch((err) => {
          showErrorAlert("Error getting file from URL");
          console.log(err);
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

  const generateImages = async (option: ImagineOptions) => {
    setIsLoading(true);
    restartSDSettings();

    const config =
      option === "controlnet" ? buildControlNetPrompt() : buildPrompt();
    const request = { prompt: prompt.value, ...config };

    const response = await enqueueTaskRequest(option, request);
    if (!response || !response.success) {
      setIsLoading(false);
      showErrorAlert(response.message || "Error generating image");
      return;
    }
    const taskId = response.data;
    const responseModel = await getGeneratedDiffusionImagesWithRetry(taskId);
    if (!responseModel.success) {
      setIsLoading(false);
      showErrorAlert(
        responseModel.message || "An error occurred while generating the images"
      );
      return;
    }

    appendResults(request, responseModel.data);
    setIsLoading(false);
  };

  const enqueueTaskRequest = async (option: ImagineOptions, request: any) => {
    try {
      if (option === "text2img") {
        return await generateImageWithText2Img(request);
      } else if (option === "img2img") {
        return await generateImageWithImg2Img(request, img2imgFile);
      } else if (option === "controlnet") {
        return await generateImageWithControlNet(request, img2imgFile);
      } else if (option === "pix2pix") {
        return await generateImageWithPix2Pix(request, img2imgFile);
      } else if (option === "inpainting") {
        return await generateImageWithInpainting(
          request,
          img2imgFile,
          maskFile
        );
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
