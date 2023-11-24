import { useEffect, useState } from "react";
import { MOBILE_SCREEN_WIDTH } from "@/utils/constants";

type WindowDimensions = {
  width: number | undefined;
  height: number | undefined;
  isMobile?: boolean;
};

const useWindowDimensions = (): WindowDimensions => {
  const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>({
    width: undefined,
    height: undefined,
    isMobile: undefined,
  });

  useEffect(() => {
    function handleResize(): void {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < MOBILE_SCREEN_WIDTH,
      });
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return (): void => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return windowDimensions;
};

export default useWindowDimensions;
