import httpInstance from "./axiosClient";
import { Model } from "@/lib/models";

export const getAvailableModels = async () => {
  try {
    const response = await httpInstance.get("/models");
    if (response.status === 200 && response.data.length > 0) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      message: response.data.message || "No models found",
      data: [],
    };
  } catch (error) {
    return { success: false, message: error, data: [] };
  }
};

export const saveNewModel = async (modelData: Model) => {
  try {
    const response = await httpInstance.post("/models", modelData);
    if (response.status === 200 && response.data) {
      return { success: true, data: response.data };
    }
    return { success: false, data: response.data.message || "Model not found" };
  } catch (error) {
    return { success: false, error: error };
  }
};
