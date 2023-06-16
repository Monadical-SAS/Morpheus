import httpInstance from "./httpClient";

export const getAvailableSamplers = async () => {
  try {
    const response = await httpInstance.get(`/samplers`);
    if (response.status === 200 && response.data.length > 0) {
      return {success: true, data: response.data};
    }
    return {
      success: false,
      error: response.data.message || "Samplers not found",
    };
  } catch (error) {
    return {success: false, error: error};
  }
};