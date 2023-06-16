import { CSSProperties, useState } from "react";
import styles from "./AppImage.module.scss";

interface AppImageProps {
  src: string;
  alt?: string;
  onClick?: () => void;
  style?: CSSProperties;
}

const AppImage = (props: AppImageProps) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={styles.imageContainer}>
      {isLoading && <div className={styles.loadingOverlay} />}

      <img
        onClick={props.onClick}
        src={props.src}
        alt={props.alt}
        onLoad={handleImageLoad}
        style={{ opacity: isLoading ? 0 : 1, ...props.style }}
        loading="lazy"
      />
    </div>
  );
};

export default AppImage;
