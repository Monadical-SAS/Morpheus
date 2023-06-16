import httpInstance from "./httpClient";

export const uploadFileToServer = async (file: File, destFolder: string) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await httpInstance.post("files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: { folder: destFolder },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error };
  }
};

export const uploadMultipleFilesToServer = async (files: File[]) => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    const response = await httpInstance.post(
      "files/upload/multiple",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error };
  }
};
