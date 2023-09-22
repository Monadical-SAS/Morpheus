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

export enum ModelCategory {
  Empty = "",
  Text2Image = "text2img",
  Image2Image = "img2img",
  Inpainting = "inpainting",
  ControlNet = "controlnet",
  Pix2Pix = "pix2pix",
  Upscaling = "upscaling",
  Processing = "processing",
}

const categories = [
  ModelCategory.Text2Image,
  ModelCategory.Image2Image,
  ModelCategory.Inpainting,
  ModelCategory.ControlNet,
  ModelCategory.Pix2Pix,
  ModelCategory.Upscaling,
];

export interface ActiveLink {
  model: Model;
  feature: ModelCategory;
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
  findValidModelForFeature: (feature: ModelCategory) => Model;
}

const initialConfig = {
  model: undefined,
  sampler: "PNDMScheduler",
  initialFeatures: [ModelCategory.Text2Image, ModelCategory.Image2Image],
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
  for (let category of categories) {
    if (
      model.categories.some((modelCategory) => modelCategory.name === category)
    ) {
      features.push(category);
    }
  }
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
          const filteredModels = response.data.filter((model: any) =>
            model.categories.every(
              (category: any) => category.name !== ModelCategory.Processing
            )
          );
          const modelsWithFeatures = filteredModels.map((model: Model) => {
            return {
              ...model,
              features: mapModelBooleanFeaturesToStringFeatures(model),
            };
          });
          setModels(modelsWithFeatures || []);
          setActiveLink({
            model: modelsWithFeatures[0],
            feature: modelsWithFeatures[0].categories[0].name,
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

  const findValidModelForFeature = (feature: ModelCategory) => {
    return (
      models.find((model: Model) =>
        model.categories.some((category) => category.name === feature)
      ) || models[0]
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
