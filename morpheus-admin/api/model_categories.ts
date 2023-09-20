import httpInstance from "./axiosClient";
import { Model } from "@/lib/models";

export const getAvailableCategories = async () => {
  try {
    const response = await httpInstance.get("/categories");
    if (response.status === 200 && response.data.length > 0) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      message: response.data.message || "Error loading model categories",
      data: [],
    };
  } catch (error) {
    return { success: false, message: error, data: [] };
  }
};

export const saveNewModel = async (categoryData: Model) => {
  try {
    const response = await httpInstance.post("/categories", categoryData);
    if (response.status === 200 && response.data) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      message: response.data.message || "Error saving model category",
    };
  } catch (error) {
    return { success: false, error: error };
  }
};
