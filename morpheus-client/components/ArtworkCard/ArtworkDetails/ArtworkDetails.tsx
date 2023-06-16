import React, { useEffect, useState } from "react";
import ArtworkForm from "../ArtworkForm/ArtworkForm";
import { CopyIcon } from "../../icons/copy";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import { useToastContext } from "@/context/ToastContext";
import { ArtWork } from "@/models/models";
import styles from "./ArtworkDetails.module.scss";

interface ArtworkDetailProps {
  artwork?: ArtWork;
  toggleModal?: () => void;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  refreshArtworks?: () => void;
}

const ArtworkDetails = (props: ArtworkDetailProps) => {
  const { copyToClipboard } = useCopyToClipboard();
  const { showInfoAlert } = useToastContext();

  const [config, setConfig] = useState<any[]>([]);

  useEffect(() => {
    if (props.artwork && props.artwork.prompt) {
      const prompt = props.artwork.prompt;
      const promptConfig = [
        { key: "Model", value: prompt.model },
        { key: "Sampler", value: prompt.sampler },
        { key: "size", value: `${prompt.width}x${prompt.height}` },
        { key: "Steps", value: prompt.num_inference_steps },
        { key: "Guidance Scale", value: prompt.guidance_scale },
        { key: "Seed", value: prompt.generator },
      ];
      setConfig(promptConfig);
    }
  }, [props.artwork]);

  const handleCopy = async () => {
    await copyToClipboard(props.artwork?.prompt?.prompt || "");
    showInfoAlert("Copied to clipboard");
  };

  return props.artwork ? (
    <div className={styles.artworkInfo}>
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

      <ArtworkForm
        artwork={props.artwork}
        showForm={props.showForm}
        setShowForm={props.setShowForm}
        refreshArtworks={props.refreshArtworks}
      />
    </div>
  ) : null;
};

export default ArtworkDetails;
