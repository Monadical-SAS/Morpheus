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

export interface ActiveLink {
  model: Model;
  feature: ModelFeature;
}

export interface IModelsContext {
  models: Model[];
  selectedModel: Model;
  setSelectedModel: (model: Model) => void;
  samplers: any[];
  sampler: string;
  setSampler: (sampler: string) => void;
  activeLink: ActiveLink;
  setActiveLink: (option: ActiveLink) => void;
  findValidModelForFeature: (feature: ModelFeature) => Model;
}

const initialConfig = {
  model: undefined,
  sampler: "PNDMScheduler",
  initialFeatures: [ModelFeature.Text2Image, ModelFeature.Image2Image],
};

const defaultState = {
  models: [],
  selectedModel: {} as Model,
  setSelectedModel: () => console.log("setSelectedSDModel"),
  samplers: [],
  sampler: initialConfig.sampler,
  setSampler: () => console.log("setSampler"),
  activeLink: {} as ActiveLink,
  setActiveLink: () => console.log("setActiveLink"),
  findValidModelForFeature: () => ({} as Model),
};

const mapModelBooleanFeaturesToStringFeatures = (model: Model) => {
  const features = [];
  if (model.text2img) features.push(ModelFeature.Text2Image);
  if (model.img2img) features.push(ModelFeature.Image2Image);
  if (model.inpainting) features.push(ModelFeature.Inpainting);
  if (model.controlnet) features.push(ModelFeature.ControlNet);
  if (model.pix2pix) features.push(ModelFeature.Pix2Pix);
  if (model.upscaling) features.push(ModelFeature.Upscaling);
  return features;
};

const ModelsContext = createContext<IModelsContext>(defaultState);

const ModelsProvider = (props: { children: ReactNode }) => {
  // Stable Diffusion Models
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model>(models[0]);

  // Sampler settings
  const [samplers, setSamplers] = useState<any[]>([]);
  const [sampler, setSampler] = useState<string>(initialConfig.sampler);

  // Selected model and feature
  const [activeLink, setActiveLink] = useState<ActiveLink>({} as ActiveLink);

  useEffect(() => {
    getAvailableModels("/models").then((response) => {
      if (response.success && response.data) {
        if (response.data.length > 0) {
          const modelsWithFeatures = response.data.map((model: Model) => {
            return {
              ...model,
              features: mapModelBooleanFeaturesToStringFeatures(model),
            };
          });
          setModels(modelsWithFeatures || []);
          setActiveLink({
            model: modelsWithFeatures[0],
            feature: modelsWithFeatures[0].features[0],
          });
        }
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
    if (activeLink.model) {
      setSelectedModel(activeLink.model);
    }
  }, [activeLink]);

  const findValidModelForFeature = (feature: ModelFeature) => {
    return (
      models.find((model: Model) => model.features.includes(feature)) ||
      models[0]
    );
  };

  return (
    <ModelsContext.Provider
      value={{
        models,
        selectedModel,
        setSelectedModel,
        samplers,
        sampler,
        setSampler,
        activeLink,
        setActiveLink,
        findValidModelForFeature,
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