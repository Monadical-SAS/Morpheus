import { useMediaQuery } from "react-responsive";
import { FC, ReactNode } from "react";
import { MOBILE_SCREEN_WIDTH } from "@/utils/constants";

interface ResponsiveProps {
  children: ReactNode;
}

const useDesktop = () => useMediaQuery({ minWidth: MOBILE_SCREEN_WIDTH }) || false;
const useMobile = () => useMediaQuery({ maxWidth: MOBILE_SCREEN_WIDTH - 1 }) || false;

const Desktop: FC<ResponsiveProps> = ({ children }) => {
  const isDesktop = useDesktop();
  return isDesktop ? <>{children}</> : null;
};

const Mobile: FC<ResponsiveProps> = ({ children }) => {
  const isMobile = useMobile();
  return isMobile ? <>{children}</> : null;
};

export { Desktop, Mobile, useDesktop, useMobile };
