import { getTimestamp } from "./timer";

const getImageBlob = async (url: string): Promise<any> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    return await response.blob();
  } catch (error) {
    return null;
  }
};

export const downloadImage = async (url: string): Promise<any> => {
  const blob = await getImageBlob(url);
  if (!blob) {
    return;
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = getImageFilename(url);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
};

export const getImageFilename = (url: string) => {
  const imageUrl = new URL(url);
  const fileName = imageUrl.pathname.split("/").pop();
  if (!fileName) {
    return `${getTimestamp()}.png`;
  }
  return fileName;
};

export const getFileBlobFromURL = async (url: string) => {
  const blob = await getImageBlob(url);
  const filename = getImageFilename(url);
  return new File([blob], filename, { type: "image/png" });
};

export const getFileFromBlob = (blob: Blob, filename: string) => {
  return new File([blob], filename, { type: "image/png" });
};

export const convertMaskToInpaintingMask = (imageData: ImageData) => {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    const isBlack = r === 0 && g === 0 && b === 0;
    const isTransparent = a === 0;

    if (isTransparent) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 255;
    } else if (isBlack) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    }
  }

  return imageData;
};

export const convertInpaintingMaskToMask = (imageData: ImageData) => {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const isWhite = r === 255 && g === 255 && b === 255;

    if (isWhite) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 255; // Fully opaque
    } else {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0; // Fully opaque
    }
  }

  return imageData;
};
