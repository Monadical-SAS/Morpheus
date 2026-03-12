import { CSSProperties, useState } from "react";

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
    <div className="relative w-full pb-[100%]">
      {isLoading && <div className="image-loading-overlay absolute top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.2)] flex justify-center items-center z-[1] rounded-lg" />}

      <img
        onClick={props.onClick}
        src={props.src}
        alt={props.alt}
        onLoad={handleImageLoad}
        style={{ opacity: isLoading ? 0 : 1, ...props.style }}
        loading="lazy"
        className="absolute top-0 left-0 w-full h-full object-cover rounded-lg transition-opacity duration-500 ease-in-out"
      />
    </div>
  );
};

export default AppImage;
