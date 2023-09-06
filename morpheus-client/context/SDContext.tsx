/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, ReactNode, useContext, useState } from "react";
import { useRouter } from "next/router";
import {
  CheckboxState,
  initializeCheckbox,
} from "@/components/Inputs/InputCheckbox/InputCheckbox";
import {
  initializeNumber,
  NumberState,
} from "@/components/Inputs/InputNumber/InputNumber";
import {
  initializeText,
  TextState,
} from "@/components/Inputs/InputText/InputText";
import { getRandomStringFromArray } from "@/utils/arrays";
import { generateRandomNumber } from "@/utils/random";
import { useModels } from "@/context/ModelsContext";
import { Prompt } from "@/models/models";
import { PROMPTS, DEFAULT_NEGATIVE_PROMPT } from "@/utils/constants";

export interface IDiffusionContext {
  prompt: TextState;
  setPrompt: (value: TextState) => void;
  negativePrompt: TextState;
  setNegativePrompt: (value: TextState) => void;
  imageSize: string;
  setImageSize: (imageHeight: string) => void;
  scale: NumberState;
  setScale: (scale: NumberState) => void;
  strength: NumberState;
  setStrength: (strength: NumberState) => void;
  steps: NumberState;
  setSteps: (steps: NumberState) => void;
  amount: NumberState;
  setAmount: (amount: NumberState) => void;
  seed: TextState;
  setSeed: (seed: TextState) => void;
  randomizeSeed: CheckboxState;
  setRandomizeSeed: (randomize: CheckboxState) => void;
  embeddingPath: TextState;
  setEmbeddingPath: (embeddingPath: TextState) => void;
  useEmbedding: CheckboxState;
  setEmbedding: (lora: CheckboxState) => void;
  loraPath: TextState;
  setLoraPath: (loraPath: TextState) => void;
  useLora: CheckboxState;
  setLora: (lora: CheckboxState) => void;
  loraScale: NumberState;
  setLoraScale: (loraScale: NumberState) => void;
  buildPrompt: () => any;
  restartSDSettings: () => void;
}


const initialConfig = {
  model: "stabilityai/stable-diffusion-2",
  sampler: "PNDMScheduler",
  prompt: initializeText(getRandomStringFromArray(PROMPTS)),
  negativePrompt: initializeText(DEFAULT_NEGATIVE_PROMPT),
  size: "768x768",
  scale: initializeNumber(10),
  steps: initializeNumber(50),
  amount: initializeNumber(1),
  seed: initializeText(String(generateRandomNumber(20))),
  randomizeSeed: initializeCheckbox(true),
  strength: initializeNumber(0.5),
  embeddingPath: initializeText(String("")),
  useEmbedding: initializeCheckbox(false),
  loraPath: initializeText(String("")),
  useLora: initializeCheckbox(false),
  loraScale: initializeNumber(1.0),
};

const defaultState = {
  prompt: initialConfig.prompt,
  setPrompt: () => {},
  negativePrompt: initialConfig.negativePrompt,
  setNegativePrompt: () => {},
  imageSize: initialConfig.size,
  setImageSize: () => {},
  scale: initialConfig.scale,
  setScale: () => {},
  strength: initialConfig.strength,
  setStrength: () => {},
  steps: initialConfig.steps,
  setSteps: () => {},
  amount: initialConfig.amount,
  setAmount: () => {},
  seed: initialConfig.seed,
  setSeed: () => {},
  randomizeSeed: initialConfig.randomizeSeed,
  setRandomizeSeed: () => {},
  embeddingPath: initialConfig.embeddingPath,
  setEmbeddingPath: () => {},
  useEmbedding: initialConfig.useEmbedding,
  setEmbedding: () => {},
  loraPath: initialConfig.loraPath,
  setLoraPath: () => {},
  useLora: initialConfig.useLora,
  setLora: () => {},
  loraScale: initialConfig.scale,
  setLoraScale: () => {},
  buildPrompt: () => {},
  restartSDSettings: () => {},
};

const DiffusionContext = createContext<IDiffusionContext>(defaultState);

const DiffusionProvider = (props: { children: ReactNode }) => {
  const { selectedModel, sampler } = useModels();

  // Common settings
  const [prompt, setPrompt] = useState<TextState>(initialConfig.prompt);
  const [negativePrompt, setNegativePrompt] = useState<TextState>(
    initialConfig.negativePrompt
  );
  const [imageSize, setImageSize] = useState<string>(initialConfig.size);
  const [scale, setScale] = useState<NumberState>(initialConfig.scale);
  const [strength, setStrength] = useState<NumberState>(initialConfig.strength);
  const [steps, setSteps] = useState<NumberState>(initialConfig.steps);
  const [amount, setAmount] = useState<NumberState>(initialConfig.amount);
  const [seed, setSeed] = useState<TextState>(initialConfig.seed);
  const [randomizeSeed, setRandomizeSeed] = useState<CheckboxState>(
    initialConfig.randomizeSeed
  );
  const [embeddingPath, setEmbeddingPath] = useState<TextState>(
    initialConfig.embeddingPath
  );
  const [useEmbedding, setEmbedding] = useState<CheckboxState>(
    initialConfig.useEmbedding
  );
  const [loraPath, setLoraPath] = useState<TextState>(initialConfig.loraPath);
  const [useLora, setLora] = useState<CheckboxState>(initialConfig.useLora);
  const [loraScale, setLoraScale] = useState<NumberState>(
    initialConfig.loraScale
  );

  const buildPrompt = (): Prompt => {
    const width = parseInt(imageSize.split("x")[1]);
    const height = parseInt(imageSize.split("x")[0]);
    return {
      prompt: prompt.value,
      model: selectedModel.source,
      sampler: sampler,
      width: width,
      height: height,
      num_inference_steps: steps.value,
      guidance_scale: scale.value,
      num_images_per_prompt: amount.value,
      generator: Number(seed.value),
      strength: strength.value,
      negative_prompt: negativePrompt.value,
      use_lora: useLora.value,
      lora_path: loraPath.value,
      use_embedding: useEmbedding.value,
      embedding_path: embeddingPath.value,
      lora_scale: loraScale.value,
    };
  };

  const restartSDSettings = () => {
    if (randomizeSeed.value) {
      setSeed(initializeText(String(generateRandomNumber(20))));
    }
  };

  return (
    <DiffusionContext.Provider
      value={{
        prompt,
        setPrompt,
        negativePrompt,
        setNegativePrompt,
        imageSize: imageSize,
        setImageSize: setImageSize,
        scale,
        setScale,
        strength,
        setStrength,
        steps,
        setSteps,
        amount,
        setAmount,
        seed,
        setSeed,
        randomizeSeed,
        setRandomizeSeed,
        embeddingPath,
        setEmbeddingPath,
        useEmbedding,
        setEmbedding,
        loraPath,
        setLoraPath,
        useLora,
        setLora,
        loraScale,
        setLoraScale,
        buildPrompt,
        restartSDSettings,
      }}
    >
      {props.children}
    </DiffusionContext.Provider>
  );
};

const useDiffusion = () => {
  const context = useContext(DiffusionContext);
  if (context === undefined) {
    throw new Error("useDiffusion must be used within a DiffusionProvider");
  }
  return context;
};

export { DiffusionProvider, useDiffusion };
