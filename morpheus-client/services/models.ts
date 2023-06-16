import httpInstance from "./httpClient";

export const getAvailableModels = async (url: string) => {
  try {
    const response = await httpInstance.get(url);
    if (response.status === 200 && response.data.length > 0) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      error: response.data.message || "Models not found",
    };
  } catch (error) {
    return { success: false, error: error };
  }
};

export const getModelDetails = async (url: string, modelId: string) => {
  try {
    const response = await httpInstance.get(`${url}${modelId}`);
    if (response.status === 200 && response.data) {
      return { success: true, data: response.data };
    }
    return { success: false, data: response.data.message || "Model not found" };
  } catch (error) {
    return { success: false, error: error };
  }
};
