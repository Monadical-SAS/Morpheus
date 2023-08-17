import { useState } from "react";

import ButtonPrimary from "../buttons/ButtonPrimary/ButtonPrimary";
import InputTextArea from "../Inputs/InputTextArea/InputTextArea";
import { initialText } from "../Inputs/InputText/InputText";
import MagicPrompt from "../MagicPrompt/MagicPrompt";
import ImagineSettings from "../ImagineSettings/ImagineSettings";
import { useDiffusion } from "@/context/SDContext";
import { useImagine } from "@/context/ImagineContext";
import styles from "./ImagineInput.module.scss";

interface ImagineInputProps {
  isFormValid: boolean;
  handleGenerate: () => void;
}

interface PromptProps {
  isPromptEmpty: boolean;
  setIsPromptEmpty: (value: boolean) => void;
  setPrompt: (value: any) => void;
}

const clearPrompt = (props: PromptProps) => {
  if (!props.isPromptEmpty) {
    props.setIsPromptEmpty(true);
    props.setPrompt(initialText);
  }
};

const ImagineInput = (props: ImagineInputProps) => {
  const { prompt, setPrompt } = useDiffusion();
  const { isLoading } = useImagine();
  const [isPromptEmpty, setIsPromptEmpty] = useState(false);

  return (
    <div className={styles.imagineInputWrapper}>
      <div className={styles.imagineInputContainer}>
        <div className={styles.inputText}>
          <InputTextArea
            id="textAreaImagine"
            autoFocus={true}
            text={prompt}
            placeholder="Write your prompt here"
            setText={setPrompt}
            isRequired={true}
            rightIcon={<MagicPrompt />}
            disableGrammarly={true}
            onClick={() => clearPrompt({ isPromptEmpty, setIsPromptEmpty, setPrompt })}
            automaticValidation={false}
          />
        </div>

        <div className={styles.ImagineActions}>
          <ButtonPrimary
            loading={isLoading}
            onClick={props.handleGenerate}
            disabled={!props.isFormValid}
            text={"Generate"}
          />
          <ImagineSettings />
        </div>
      </div>
    </div>
  );
};

export default ImagineInput;
