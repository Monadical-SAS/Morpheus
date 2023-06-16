import httpInstance from "./httpClient";
import { Collection } from "../models/models";

export const saveCollection = async (data: Collection) => {
  try {
    const response = await httpInstance.post("/collections", data);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error };
  }
};

export const getUserCollections = async () => {
  try {
    const response = await httpInstance.get(`/collections`);
    if (response.status === 200 && response.data.length > 0) {
      return { success: true, data: response.data };
    }
    return { success: false, error: "Collections not found" };
  } catch (error) {
    return { success: false, error: error };
  }
};

export const getCollectionDetails = async (collectionId: string) => {
  try {
    const response = await httpInstance.get(`/collections/${collectionId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error };
  }
};

export const updateCollection = async (data: Collection) => {
  try {
    const response = await httpInstance.put("/collections", data);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error };
  }
};

export const deleteCollection = async (collectionId: string) => {
  try {
    const response = await httpInstance.delete(`/collections/${collectionId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error };
  }
};
