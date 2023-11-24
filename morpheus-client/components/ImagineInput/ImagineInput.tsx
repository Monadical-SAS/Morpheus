import { useState } from "react";

import ButtonPrimary from "../buttons/ButtonPrimary/ButtonPrimary";
import InputTextArea from "../Inputs/InputTextArea/InputTextArea";
import { initialText, TextState } from "../Inputs/InputText/InputText";
import MagicPrompt from "../MagicPrompt/MagicPrompt";
import ImagineSettings from "../ImagineSettings/ImagineSettings";
import { useDiffusion } from "@/context/SDContext";
import { useImagine } from "@/context/ImagineContext";
import { useModels } from "@/context/ModelsContext";
import styles from "./ImagineInput.module.scss";
import { PROMPTS } from "@/utils/constants";

interface ImagineInputProps {
  isFormValid: boolean;
  handleGenerate: () => void;
}

interface PromptProps {
  prompt: TextState;
  setPrompt: (value: any) => void;
}

const clearPrompt = (props: PromptProps) => {
  if (PROMPTS.includes(props.prompt?.value)) {
    props.setPrompt(initialText);
  }
};

const ImagineInput = (props: ImagineInputProps) => {
  const { selectedModel } = useModels();
  const { prompt, setPrompt } = useDiffusion();
  const { isLoading } = useImagine();
  const isRequestValid = props.isFormValid && !!selectedModel;
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
            onClick={() => clearPrompt({ prompt, setPrompt })}
            automaticValidation={false}
            inputStyles={{ backgroundColor: "#14172D" }}
          />
        </div>

        <div className={styles.ImagineActions}>
          <ButtonPrimary
            loading={isLoading}
            onClick={props.handleGenerate}
            disabled={!isRequestValid}
            text={"Generate"}
          />
          <ImagineSettings />
        </div>
      </div>
    </div>
  );
};

export default ImagineInput;
