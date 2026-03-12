import { CSSProperties } from "react";
import AppImage from "@/components/AppImage/AppImage";

interface ImagePromptProps {
  image: string;
  prompt: string;
  styles?: CSSProperties;
}

const ImagePrompt = (props: ImagePromptProps) => {
  return (
    <div className="group w-full max-w-[400px] flex justify-center items-center rounded-3xl relative max-md:max-w-full" style={props.styles}>
      <AppImage src={props.image} alt={props.prompt} />
      <div className="hidden group-hover:flex h-auto absolute bottom-0 left-0 right-0 p-6 bg-[rgba(0,0,0,0.8)]">
        <p className="body-2 white">{props.prompt}</p>
      </div>
    </div>
  );
};

export default ImagePrompt;
