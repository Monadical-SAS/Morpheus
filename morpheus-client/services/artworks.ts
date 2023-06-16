import httpInstance from "./httpClient";
import { ArtWork } from "../models/models";

export const saveArtWorks = async (data: ArtWork[]) => {
  try {
    const response = await httpInstance.post("/artworks/multiple", data);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error };
  }
};

export const saveArtWork = async (data: ArtWork) => {
  try {
    const response = await httpInstance.post("/artworks", data);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error };
  }
};

export const getUserArtWorks = async () => {
  try {
    const response = await httpInstance.get("/artworks");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error };
  }
};

export const searchArtWorks = async (searchText: string) => {
  try {
    const response = await httpInstance.get(
      `/artworks/search?search=${searchText}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error };
  }
};

export const getCollectionArtWorks = async (collectionId: string) => {
  try {
    const response = await httpInstance.get(
      `/artworks/collection/${collectionId}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error };
  }
};

export const getArtWorkDetails = async (artWorkId: string) => {
  try {
    const response = await httpInstance.get(`/artworks/${artWorkId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error };
  }
};

export const updateArtWork = async (data: ArtWork) => {
  try {
    const response = await httpInstance.put("/artworks", data);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error };
  }
};

export const deleteArtWork = async (artWorkId: string) => {
  try {
    const response = await httpInstance.delete(`/artworks/${artWorkId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error };
  }
};
