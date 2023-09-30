import { sleep } from "@/utils/timer";
import httpInstance from "./httpClient";
import { ErrorResponse, SuccessResponse } from "@/utils/common";
import { ServerResponse } from "@/models/models";

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
    return ErrorResponse(String(error));
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
    return ErrorResponse(String(error));
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
    return ErrorResponse(String(error));
  }
};

export const generateMagicPrompt = async (request: IRequest) => {
  try {
    const response = await httpInstance.post(
      "/sdiffusion/magic_prompt/prompt/",
      request
    );
    return response.data;
  } catch (error) {
    return ErrorResponse(String(error));
  }
};

export const generateImageWithUpscaling = async (
  request: IRequest,
  image: File | null
) => {
  return await sendImageRequestToSDBackend(
    request,
    image,
    "/sdiffusion/upscale/prompt/"
  );
};

export const fetchTaskResult = async (taskId: string) => {
  try {
    const response = await httpInstance.get(`/sdiffusion/results/${taskId}`);
    return response.data;
  } catch (error) {
    return ErrorResponse(String(error));
  }
};

export const fetchDataWithRetry = async (
  taskId: string,
  retryCount: number,
  maxCount: number = MAX_RETRY_COUNT
): Promise<any> => {
  await sleep(5000);
  if (retryCount > maxCount) {
    return ErrorResponse(
      "Failed to fetch results from server after maximum retries exceeded"
    );
  }

  try {
    await sleep(mapCounterToSleepTime(retryCount));
    const response: ServerResponse = await fetchTaskResult(taskId);
    if (!response.success) return ErrorResponse(response.message);
    if (response.data.status === "FAILED") {
      return ErrorResponse(response.data.message);
    } else if (response.data.status === "COMPLETED") {
      return SuccessResponse(response.data, response.message);
    } else if (response.data.status === "PENDING") {
      return fetchDataWithRetry(taskId, retryCount + 1, maxCount);
    } else {
      return fetchDataWithRetry(taskId, retryCount + 1, maxCount);
    }
  } catch (error) {
    if (retryCount === maxCount) {
      return ErrorResponse("Failed to fetch results from server");
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

const mapCounterToSleepTime = (counter: number) => {
  if (counter <= 5) return 1000;
  if (counter <= 10) return 2000;
  if (counter <= 20) return 3000;
  return 1000;
};
