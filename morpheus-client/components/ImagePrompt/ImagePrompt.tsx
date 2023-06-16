import { CSSProperties } from "react";
import AppImage from "@/components/AppImage/AppImage";
import styles from "./ImagePrompt.module.scss";

interface ImagePromptProps {
  image: string;
  prompt: string;
  styles?: CSSProperties;
}

const ImagePrompt = (props: ImagePromptProps) => {
  return (
    <div className={styles.imageContainer} style={props.styles}>
      <AppImage src={props.image} alt={props.prompt} />
      <div className={styles.promptContainer}>
        <p className="body-2 white">{props.prompt}</p>
      </div>
    </div>
  );
};

export default ImagePrompt;
