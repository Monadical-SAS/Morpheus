import { useEffect, useState } from "react";
import useWindowDimensions from "./useWindowDimensions";
import { MOBILE_SCREEN_WIDTH } from "../utils/constants";

interface Size {
  width: number;
  height: number;
}

interface ImageGridSizesProps {
  urlList: string[];
  width: number;
  height: number;
}

const imagesGridSizes: { [key: number]: Size } = {
  1: { width: 1, height: 1 },
  2: { width: 2, height: 1 },
  3: { width: 3, height: 1 },
  4: { width: 2, height: 2 },
  5: { width: 3, height: 2 },
  6: { width: 3, height: 2 },
  7: { width: 4, height: 2 },
  8: { width: 4, height: 2 },
  9: { width: 3, height: 3 },
  10: { width: 4, height: 3 },
};

const imagesGridSizesMobile: { [key: number]: Size } = {
  1: { width: 1, height: 1 },
  2: { width: 1, height: 2 },
  3: { width: 2, height: 2 },
  4: { width: 2, height: 2 },
  5: { width: 2, height: 3 },
  6: { width: 2, height: 3 },
  7: { width: 2, height: 4 },
  8: { width: 2, height: 4 },
  9: { width: 2, height: 5 },
  10: { width: 2, height: 5 },
};

const useImageGridSizes = (props: ImageGridSizesProps) => {
  const { width } = useWindowDimensions();

  const [imageWidth, setImageWidth] = useState(200);
  const [imageHeight, setImageHeight] = useState(200);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(width < MOBILE_SCREEN_WIDTH);
  }, [width]);

  useEffect(() => {
    if (
      props.width &&
      props.height &&
      props.urlList &&
      props.urlList.length > 0
    ) {
      const imagesAmount = props.urlList.length;
      const { width, height } = isMobile
        ? imagesGridSizesMobile[imagesAmount]
        : imagesGridSizes[imagesAmount];

      setImageWidth((props.width / width) * 0.9);
      setImageHeight((props.height / height) * 0.9);
    }
  }, [props.width, props.height, props.urlList, isMobile]);

  return { imageWidth, imageHeight };
};

export default useImageGridSizes;
