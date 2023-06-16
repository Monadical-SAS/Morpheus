import { useRouter } from "next/router";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  CheckboxState,
  initializeCheckbox,
} from "../components/Inputs/InputCheckbox/InputCheckbox";
import {
  initializeNumber,
  NumberState,
} from "../components/Inputs/InputNumber/InputNumber";
import {
  initializeText,
  TextState,
} from "../components/Inputs/InputText/InputText";
import { Prompt } from "../models/models";
import { getAvailableModels } from "../services/models";
import { getAvailableSamplers } from "../services/samplers";
import { getRandomStringFromArray } from "../utils/arrays";
import { checkIfValueInEnum, filterObjectsByProperty } from "../utils/object";
import { generateRandomNumber } from "../utils/random";

export enum SDOption {
  Empty = "",
  Text2Image = "text2img",
  Image2Image = "img2img",
  Inpainting = "inpainting",
  ControlNet = "controlnet",
  Pix2Pix = "pix2pix",
}

export interface IDiffusionContext {
  selectedOption: SDOption;
  validSDModels: any[];
  selectedSDModel: string;
  setSelectedSDModel: (model: string) => void;
  SDSamplers: any[];
  sampler: string;
  setSampler: (sampler: string) => void;
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
  buildPrompt: () => any;
  restartSDSettings: () => void;
}

const DEFAULT_NEGATIVE_PROMPT =
  "(((deformed))), (extra_limb), (long body :1.3), (mutated hands and fingers:1.5), (mutation poorly drawn :1.2), " +
  "(poorly drawn hands), (ugly), Images cut out at the top, anatomical nonsense, bad anatomy, bad anatomy, " +
  "bad breasts, bad composition, bad ears, bad hands, bad proportions, bad shadow, blurred, blurry, blurry imag, " +
  "bottom, broken legs, cloned face, colorless, cropped, deformed, deformed body feature, dehydrated, " +
  "disappearing arms, disappearing calf, disappearing legs, disappearing thigh, disfigure, disfigured, " +
  "duplicate, error, extra arms, extra breasts, extra ears, extra fingers, extra legs, extra limbs, " +
  "fused ears, fused fingers, fused hand, gross proportions, heavy breasts, heavy ears, left, liquid body, " +
  "liquid breasts, liquid ears, liquid tongue, long neck, low quality, low res, low resolution, lowers, " +
  "malformed, malformed hands, malformed limbs, messy drawing, missing arms, missing breasts, missing ears, " +
  "missing hand, missing legs, morbid, mutated, mutated body part, mutated hands, mutation, mutilated, " +
  "old photo, out of frame, oversaturate, poor facial detail, poorly Rendered fac, poorly drawn fac, " +
  "poorly drawn face, poorly drawn hand, poorly drawn hands, poorly rendered hand, right, signature, " +
  "text font ui, too many fingers, ugly, uncoordinated body, unnatural body, username, watermark, worst quality";

const PROMPTS = [
  "An astronaut cycling on the moon, Abstract Expressionism",
  "A Man looking at the Starry Sky by Vincent Van Gogh",
  "A giant panda in between a celestial war by Anna Dittmann, trending on artstation",
  "A stag standing on top of the world, Pencil drawing",
  "A landscape view of a river from a forest cave, Classicism painting",
  "A war scene from the ancient times",
  "A person transported to another world through a wormhole",
  "A futuristic landscape of a city",
  "A photographic image of a village in Japan",
  "A Beautiful landscaping drawings from an anime",
  "A huge road in between mountains with a futuristic automobile",
  "A Greek Statue made from clay, Renaissance style",
  "A temple in ruins, forest, stairs, columns, cinematic, detailed, atmospheric, epic, concept art, " +
    "matte painting, background, mist, photo-realistic, concept art, volumetric light, cinematic epic, 8k.",
  "A dog in a hat looking like a vintage portrait",
  "Baby Yoda playing on a beach, Digital art Behance, concept art",
  "Scarlett Johansson in a painting of Vermeer",
  "An ancient Greek character in a golden helmet",
  "A sleeping baby wrapped in flowers by Jean Delville, Baroque style",
  "A detailed digital image of a man standing in a huge ship, trending on artstation",
  "A water butterfly, Surrealism painting",
  "A fantastical, otherworldly landscape in the style of Roger Dean",
  "A magical, dreamlike forest in the style of Hayao Miyazaki",
  "Lost astronaut in Jupiter, epic scene,displaying in the background the moon and other planets and stars, " +
    "kilian eng vibrant colours, dynamic lighting, digital art, winning award masterpiece, fantastically beautiful, " +
    "illustration, aesthetically, trending on artstation, art by Zdzisław Beksiński e Romero Britto",
  "Infinite hyperbolic intricate maze, futuristic, twisted house, 3D printed canopy, hyper-realistic, " +
    "photorealism, octane render, unreal engine, 4k",
  "forest wanderer by dominic mayer, anthony jones, Loish, painterly style by Gerald parel, craig mullins, " +
    "marc simonetti, mike mignola, flat colors illustration, bright and colorful, high contrast, Mythology, " +
    "cinematic, detailed, atmospheric, epic , concept art, Matte painting, Lord of the rings, Game of Thrones, " +
    "shafts of lighting, mist, , photorealistic, concept art, volumetric light, " +
    "cinematic epic + rule of thirds | 35mm| octane render, 8k, corona render, movie concept art, octane render, " +
    "8k, corona render, cinematic, trending on artstation, movie concept art, cinematic composition , " +
    "ultra detailed, realistic , hiperealistic , volumetric lighting , 8k",
];

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
};

const defaultState = {
  selectedOption: SDOption.Text2Image,
  validSDModels: [],
  selectedSDModel: initialConfig.model,
  setSelectedSDModel: () => {},
  SDSamplers: [],
  sampler: initialConfig.sampler,
  setSampler: () => {},
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
  buildPrompt: () => {},
  restartSDSettings: () => {},
};

const DiffusionContext = createContext<IDiffusionContext>(defaultState);

const DiffusionProvider = (props: { children: ReactNode }) => {
  const router = useRouter();

  const [selectedOption, setSelectedOption] = useState<SDOption>(
    SDOption.Text2Image
  );
  // Stable Diffusion Models
  const [SDModels, setSDModels] = useState<any[]>([]);
  const [validSDModels, setValidSDModels] = useState<any[]>([]);
  const [selectedSDModel, setSelectedSDModel] = useState<string>(
    initialConfig.model
  );

  // Sampler settings
  const [SDSamplers, setSDSamplers] = useState<any[]>([]);
  const [sampler, setSampler] = useState<string>(initialConfig.sampler);

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

  useEffect(() => {
    // Fetch Stable Diffusion models
    getAvailableModels("/models").then((response) => {
      if (response.success && response.data) {
        setSDModels(response.data || []);
      }
    });

    // Fetch Stable Diffusion samplers
    getAvailableSamplers().then((response) => {
      if (response.success && response.data) {
        const samplersData = response.data || [];
        setSDSamplers(samplersData);
      }
    });
  }, []);

  useEffect(() => {
    const currentPath = router.pathname.split("/").pop() as SDOption;
    if (
      currentPath !== SDOption.Empty &&
      checkIfValueInEnum(SDOption, currentPath)
    ) {
      setSelectedOption(currentPath);
    } else {
      setSelectedOption(SDOption.Empty);
    }
  }, [router.pathname]);

  useEffect(() => {
    if (SDModels.length === 0) {
      setSelectedSDModel("No models available");
      return;
    }

    const validModels = filterObjectsByProperty(
      SDModels,
      selectedOption as string,
      true
    );

    if (validModels.length > 0) {
      setValidSDModels(validModels);
      if (!validModels.find((model) => model.source === selectedSDModel)) {
        setSelectedSDModel(validModels[0].source);
      }
      setSelectedSDModel(validModels[0].source);
    }
  }, [SDModels, selectedOption]);

  const buildPrompt = (): Prompt => {
    const width = parseInt(imageSize.split("x")[1]);
    const height = parseInt(imageSize.split("x")[0]);
    return {
      prompt: prompt.value,
      model: selectedSDModel,
      sampler: sampler,
      width: width,
      height: height,
      num_inference_steps: steps.value,
      guidance_scale: scale.value,
      num_images_per_prompt: amount.value,
      generator: Number(seed.value),
      strength: strength.value,
      negative_prompt: negativePrompt.value,
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
        selectedOption,
        validSDModels,
        SDSamplers,
        selectedSDModel,
        setSelectedSDModel,
        sampler,
        setSampler,
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
