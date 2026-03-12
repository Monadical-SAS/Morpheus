import React, { useEffect, useState } from "react";
import ArtworkForm from "../ArtworkForm/ArtworkForm";
import { CopyIcon } from "../../icons/copy";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import { useToastContext } from "@/context/ToastContext";
import { ArtWork } from "@/models/models";
import useWindowDimensions from "@/hooks/useWindowDimensions";

interface ArtworkDetailProps {
  artwork?: ArtWork;
  toggleModal?: () => void;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  refreshArtworks?: () => void;
}

interface ImageResolution {
  width: number;
  height: number;
}

const ArtworkDetails = (props: ArtworkDetailProps) => {
  const { copyToClipboard } = useCopyToClipboard();
  const { showInfoAlert } = useToastContext();
  const { isMobile } = useWindowDimensions();

  const [config, setConfig] = useState<any[]>([]);
  const [imageResolution, setImageResolution] = useState<ImageResolution>({
    width: 0,
    height: 0,
  });

  const imageUrl = props.artwork?.image || "";

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageResolution({ width: img.width, height: img.height });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (props.artwork && props.artwork.prompt) {
      const prompt = props.artwork.prompt;
      const promptConfig = [
        { key: "Model", value: prompt.model },
        { key: "Sampler", value: prompt.sampler },
        {
          key: "size",
          value: `${imageResolution.width}x${imageResolution.height}`,
        },
        { key: "Steps", value: prompt.num_inference_steps },
        { key: "Guidance Scale", value: prompt.guidance_scale },
        { key: "Seed", value: prompt.generator },
      ];
      setConfig(promptConfig);
    }
  }, [props.artwork, imageResolution]);

  const handleCopy = async () => {
    await copyToClipboard(props.artwork?.prompt?.prompt || "");
    showInfoAlert("Copied to clipboard");
  };

  const ArtworkFormInstance = (
    <ArtworkForm
      artwork={props.artwork}
      showForm={props.showForm}
      setShowForm={props.setShowForm}
      refreshArtworks={props.refreshArtworks}
    />
  );

  return props.artwork ? (
    <div className="w-full max-w-[420px] h-full max-md:ml-0 max-md:mt-6 md:max-w-[600px] md:ml-0 md:mt-6">
      {isMobile && ArtworkFormInstance}

      <div>
        {props.artwork.title && (
          <h3 className="headline-3 white mb-6 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
            {props.artwork.title}
          </h3>
        )}

        <div className="w-full rounded-2xl">
          <p className="body-2 white">{props.artwork?.prompt?.prompt}</p>

          <div className="w-auto mt-2 flex flex-row justify-center items-center px-4 py-3 rounded-lg border border-[#6D6D94] cursor-pointer flex-1 hover:text-white max-md:max-w-full" onClick={handleCopy}>
            <CopyIcon />
            <p className="base-1 white ml-4">Copy Prompt</p>
          </div>
        </div>

        <div className="mt-6 flex flex-row flex-wrap max-md:flex-col">
          {config.map((item) => (
            <div key={item.key} className="w-1/2 mt-4">
              <p className="base-2 secondary">{item.key}</p>
              <p className="body-2 white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {!isMobile && ArtworkFormInstance}
    </div>
  ) : null;
};

export default ArtworkDetails;
