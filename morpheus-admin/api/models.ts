import httpInstance from "./axiosClient";
import { Model } from "@/lib/models";

interface ResponseProps {
  success: boolean;
  data?: any[];
  message?: object | string | Error;
}

const createResponse = ({ success, data = [], message }: ResponseProps) => {
  const responseMap: { [key: string]: { success: boolean; message: string; data: any[] } } = {
    Error: { success: false, message: message instanceof Error ? message.message : "", data },
    string: { success, message: typeof message === "string" ? message : "", data },
    object: { success, message: typeof message === "object" ? JSON.stringify(message) : "", data },
    default: { success, message: "", data },
  };
  return responseMap[typeof message] || responseMap["default"];
};

export const getAvailableModels = async () => {
  try {
    const response = await httpInstance.get("/models?only_active=false");
    if (response.status === 200 && response.data.length > 0) {
      return createResponse({ success: true, data: response.data });
    }
    return createResponse({
      success: false,
      message: response.data.message || "No models found",
      data: [],
    });
  } catch (error) {
    return createResponse({ success: false, message: error as Error, data: [] });
  }
};

export const saveNewModel = async (modelData: Model) => {
  try {
    const response = await httpInstance.post("/models", modelData);
    if (response.status === 200 && response.data) {
      return createResponse({ success: true, data: response.data });
    }
    return createResponse({
      success: false,
      message: response.data.message || "Error saving model",
    });
  } catch (error) {
    createResponse({ success: false, message: error as Error });
  }
};

export const updateModel = async (modelData: Model) => {
  try {
    const response = await httpInstance.put("/models", modelData);
    if (response.status === 200 && response.data) {
      return createResponse({ success: true, data: response.data });
    }
    return createResponse({
      success: false,
      message: response.data.message || "Error updating model",
    });
  } catch (error) {
    return createResponse({ success: false, message: error as Error });
  }
};

export const deleteModel = async (modelSource: string) => {
  try {
    const model_source = modelSource;
    const response = await httpInstance.delete(`/models/${model_source}`);
    if (response.status === 200 && response.data) {
      return createResponse({ success: true, data: response.data });
    }
    return createResponse({
      success: false,
      message: response.data.message || "Error deleting model",
    });
  } catch (error) {
    return createResponse({ success: false, message: error as Error });
  }
}
