import { sleep } from "@/utils/timer";
import httpInstance from "./httpClient";

interface IRequest {
  prompt: string;
  config?: any;
  image?: string;
}

const MAX_RETRY_COUNT = 32;

export const generateImageWithText2Img = async (request: IRequest) => {
  try {
    const response = await httpInstance.post(
      `/sdiffusion/text2img/prompt/`,
      {},
      {
        params: { ...request },
      }
    );
    return response.data;
  } catch (error) {
    return { success: false, message: error };
  }
};

export const sendImageRequestToSDBackend = async (
  request: IRequest,
  image: File | null,
  url: string
) => {
  try {
    const formData = new FormData();
    formData.append("image", image ?? "");
    const response = await httpInstance.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: { ...request },
    });
    return response.data;
  } catch (error) {
    return { success: false, error: error };
  }
};

export const generateImageWithImg2Img = async (
  request: IRequest,
  image: File | null
) => {
  return await sendImageRequestToSDBackend(
    request,
    image,
    "/sdiffusion/img2img/prompt/"
  );
};

export const generateImageWithControlNet = async (
  request: IRequest,
  image: File | null
) => {
  return await sendImageRequestToSDBackend(
    request,
    image,
    "/sdiffusion/controlnet/prompt/"
  );
};

export const generateImageWithPix2Pix = async (
  request: IRequest,
  image: File | null
) => {
  return await sendImageRequestToSDBackend(
    request,
    image,
    "/sdiffusion/pix2pix/prompt/"
  );
};

export const generateImageWithInpainting = async (
  request: IRequest,
  image: File | null,
  mask: File | null
) => {
  try {
    const formData = new FormData();
    formData.append("image", image ?? "");
    formData.append("mask", mask ?? "");

    const response = await httpInstance.post(
      "/sdiffusion/inpaint/prompt/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: { ...request },
      }
    );
    return response.data;
  } catch (error) {
    return { success: false, error: error };
  }
};

export const generateMagicPrompt = async (request: IRequest) => {
  try {
    const response = await httpInstance.post(
      "/sdiffusion/magicprompt/prompt/",
      request
    );
    return response.data;
  } catch (error) {
    return { success: false, error: error };
  }
};

export const fetchTaskResult = async (taskId: string) => {
  try {
    const response = await httpInstance.get(`/sdiffusion/results/${taskId}`);
    return response.data;
  } catch (error) {
    return { success: false, error: error };
  }
};

export const fetchDataWithRetry = async (
  taskId: string,
  retryCount: number,
  maxCount: number = MAX_RETRY_COUNT
): Promise<any> => {
  if (retryCount > maxCount) {
    return {
      success: false,
      message: "Failed to fetch data from server",
      data: null,
    };
  }

  try {
    await sleep(mapCounterToSleepTime(retryCount));
    const response = await fetchTaskResult(taskId);
    if (response?.status === "Failed") {
      return { success: false, message: response?.message, data: null };
    }
    if (response?.status === "Processing") {
      return fetchDataWithRetry(taskId, retryCount + 1, maxCount);
    } else {
      return { success: true, data: response.data, message: null };
    }
  } catch (error) {
    if (retryCount === maxCount) {
      return {
        success: false,
        message: "Failed to fetch data from server",
        data: null,
      };
    }
    await sleep(mapCounterToSleepTime(retryCount));
    return fetchDataWithRetry(taskId, retryCount + 1, maxCount);
  }
};

export const getGeneratedDataWithRetry = async (
  taskId: string,
  retryCount: number = 0,
  maxCount: number = MAX_RETRY_COUNT
): Promise<any> => {
  if (!taskId) return undefined;

  return await fetchDataWithRetry(taskId, retryCount, maxCount);
};

export const getGeneratedDiffusionImagesWithRetry = async (
  taskId: string,
  retryCount = 0,
  maxCount: number = MAX_RETRY_COUNT
): Promise<any> => {
  return await getGeneratedDataWithRetry(taskId, retryCount, maxCount);
};

export const getGeneratedMagicPromptWithRetry = async (
  taskId: string,
  retryCount = 0,
  maxCount: number = MAX_RETRY_COUNT
): Promise<any> => {
  return await getGeneratedDataWithRetry(taskId, retryCount, maxCount);
};

const mapCounterToSleepTime = (counter: number) => {
  if (counter <= 5) return 5000;
  if (counter <= 10) return 10000;
  if (counter <= 20) return 30000;
  return 5000;
};
