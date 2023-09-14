import React, { useEffect, useState } from "react";
import ArtworkForm from "../ArtworkForm/ArtworkForm";
import { CopyIcon } from "../../icons/copy";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import { useToastContext } from "@/context/ToastContext";
import { ArtWork } from "@/models/models";
import styles from "./ArtworkDetails.module.scss";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { MOBILE_SCREEN_WIDTH } from "@/utils/constants";

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
  const { width } = useWindowDimensions();
  const isMobile = width <= MOBILE_SCREEN_WIDTH;

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
    <div className={styles.artworkInfo}>
      {isMobile && ArtworkFormInstance}

      <div>
        {props.artwork.title && (
          <h3 className={`headline-3 white ${styles.title}`}>
            {props.artwork.title}
          </h3>
        )}

        <div className={styles.prompt}>
          <p className="body-2 white">{props.artwork?.prompt?.prompt}</p>

          <div className={styles.copyContent} onClick={handleCopy}>
            <CopyIcon />
            <p className="base-1 white">Copy Prompt</p>
          </div>
        </div>

        <div className={styles.configuration}>
          {config.map((item) => (
            <div key={item.key} className={styles.configItem}>
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
