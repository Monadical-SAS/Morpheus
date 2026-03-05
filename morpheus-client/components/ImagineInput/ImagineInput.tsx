import ButtonPrimary from "../buttons/ButtonPrimary/ButtonPrimary";
import InputTextArea from "../Inputs/InputTextArea/InputTextArea";
import { initialText, TextState } from "../Inputs/InputText/InputText";
import MagicPrompt from "../MagicPrompt/MagicPrompt";
import { useDiffusion } from "@/context/DiffusionContext";
import { useImagine } from "@/context/ImagineContext";
import { useModels } from "@/context/ModelsContext";
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
    <div className="w-full pr-6 pb-6 pt-4 bg-[#252238] max-md:h-auto max-md:px-0 max-md:pb-2 max-md:rounded-b-lg">
      <div className="w-full flex flex-row flex-wrap mt-6 gap-4 max-md:h-auto max-md:flex-col max-md:mt-0 max-md:p-4">
        <div className="flex-1 min-w-[300px]">
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

        <div className="flex flex-row justify-between items-end max-md:gap-3 max-md:w-full max-md:mt-4">
          <ButtonPrimary
            loading={isLoading}
            onClick={props.handleGenerate}
            disabled={!isRequestValid}
            text={"Generate"}
            className="!w-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default ImagineInput;