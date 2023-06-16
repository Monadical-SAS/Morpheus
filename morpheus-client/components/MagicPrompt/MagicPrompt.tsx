import { CSSProperties, useState } from "react";
import Loader from "../Loaders/LoaderCircle/Loader";
import AppTooltip from "@/components/Tooltip/AppTooltip";
import { MagicPromptIcon } from "../icons/magicPrompt";
import { useDiffusion } from "@/context/SDContext";
import { useToastContext } from "@/context/ToastContext";
import {
  generateMagicPrompt,
  getGeneratedMagicPromptWithRetry,
} from "@/services/sdiffusion";
import { getInputValidators } from "../Inputs/validators";
import styles from "./MagicPrompt.module.scss";

interface MagicPromptProps {
  styles?: CSSProperties;
}

const MagicPrompt = (props: MagicPromptProps) => {
  const { showInfoAlert, showWarningAlert, showErrorAlert } = useToastContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { prompt, setPrompt } = useDiffusion();

  let newPrompt = prompt.value + " ";
  let timer: any;

  const handleClick = async () => {
    if (!prompt.value) return;

    setIsLoading(true);
    const response = await generateMagicPrompt({
      prompt: prompt.value,
    });
    if (!response.success) {
      setIsLoading(false);
      showErrorAlert(response.message || "Error generating prompt");
      return;
    }

    showInfoAlert(
      response.message || "MagicPrompt request queued successfully!"
    );
    const taskId = response.data;
    const responseMagicPrompt = await getGeneratedMagicPromptWithRetry(taskId);

    if (!responseMagicPrompt.success) {
      setIsLoading(false);
      showErrorAlert(
        responseMagicPrompt.message ||
          "Something went wrong while generating MagicPrompt"
      );
      return;
    }

    let generatedPrompt = responseMagicPrompt.data;
    generatedPrompt = generatedPrompt.replace(prompt.value, "");

    if (generatedPrompt.length === 0) {
      showWarningAlert(
        "Magic Prompt did not generate a new prompt. " +
          "Please try again to get a new proposal or rewrite your prompt"
      );
      setIsLoading(false);
      return;
    }

    // To show result with typewriter effect
    let i = -1;
    timer = setInterval(() => {
      i++;
      if (i === generatedPrompt.length - 1) {
        clearInterval(timer);
        setIsLoading(false);
      }
      newPrompt = newPrompt + generatedPrompt[i];
      setPrompt({
        value: newPrompt,
        validators: getInputValidators(newPrompt, true),
      });
    }, 30);
  };

  return (
    <AppTooltip
      content={
        "MagicPrompt augments your prompt to be more descriptive for more detailed, styled and interesting images"
      }
      direction={"top"}
    >
      <span className={styles.magicPrompt}>
        {isLoading ? (
          <Loader
            isLoading={isLoading}
            width={25}
            height={25}
            styles={props.styles}
          />
        ) : (
          <span
            onClick={handleClick}
            className={`${!prompt.value && styles.disabled}`}
          >
            <MagicPromptIcon />
          </span>
        )}
      </span>
    </AppTooltip>
  );
};

export default MagicPrompt;
