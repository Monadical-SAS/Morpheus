import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { getAvailableModels } from "@/services/models";
import { getAvailableSamplers } from "@/services/samplers";
import { Model } from "@/models/models";

export enum ModelFeature {
  Empty = "",
  Text2Image = "text2img",
  Image2Image = "img2img",
  Inpainting = "inpainting",
  ControlNet = "controlnet",
  Pix2Pix = "pix2pix",
  Upscaling = "upscaling",
}

export interface IModelsContext {
  models: Model[];
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  samplers: any[];
  sampler: string;
  setSampler: (sampler: string) => void;
  modelFeatures: ModelFeature[];
}

const initialConfig = {
  model: "stabilityai/stable-diffusion-2",
  sampler: "PNDMScheduler",
  initialFeatures: [ModelFeature.Text2Image, ModelFeature.Image2Image],
};

const defaultState = {
  models: [],
  selectedModel: initialConfig.model,
  setSelectedModel: () => console.log("setSelectedSDModel"),
  samplers: [],
  sampler: initialConfig.sampler,
  setSampler: () => console.log("setSampler"),
  modelFeatures: initialConfig.initialFeatures,
};

const ModelsContext = createContext<IModelsContext>(defaultState);

const ModelsProvider = (props: { children: ReactNode }) => {
  // Stable Diffusion Models
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(
    initialConfig.model
  );
  const [modelFeatures, setModelFeatures] = useState<ModelFeature[]>(
    initialConfig.initialFeatures
  );

  // Sampler settings
  const [samplers, setSamplers] = useState<any[]>([]);
  const [sampler, setSampler] = useState<string>(initialConfig.sampler);

  useEffect(() => {
    getAvailableModels("/models").then((response) => {
      if (response.success && response.data) {
        console.log(response.data);
        setModels(response.data || []);
      }
    });

    getAvailableSamplers().then((response) => {
      if (response.success && response.data) {
        const samplersData = response.data || [];
        setSamplers(samplersData);
      }
    });
  }, []);

  useEffect(() => {
    if (models.length === 0) {
      setSelectedModel("No models available");
      return;
    }
    const modelFeatures = models.map((model: Model) => {
      const features = [];
      if (model.text2img) features.push(ModelFeature.Text2Image);
      if (model.img2img) features.push(ModelFeature.Image2Image);
      if (model.inpainting) features.push(ModelFeature.Inpainting);
      if (model.controlnet) features.push(ModelFeature.ControlNet);
      if (model.pix2pix) features.push(ModelFeature.Pix2Pix);
      if (model.upscaling) features.push(ModelFeature.Upscaling);
      return features;
    });
    setModelFeatures(modelFeatures.flat());
  }, [models, selectedModel]);

  return (
    <ModelsContext.Provider
      value={{
        models,
        selectedModel,
        setSelectedModel,
        samplers,
        sampler,
        setSampler,
        modelFeatures,
      }}
    >
      {props.children}
    </ModelsContext.Provider>
  );
};

const useModels = () => {
  const context = useContext(ModelsContext);
  if (context === undefined) {
    throw new Error("useModels must be used within a ModelsProvider");
  }
  return context;
};

export { ModelsProvider, useModels };
