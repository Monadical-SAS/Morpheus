import React, { Fragment, useEffect, useState } from "react";
import InputSelect from "../Inputs/InputSelect/InputSelect";
import { Model } from "@/models/models";
import { useModels } from "@/context/ModelsContext";

const ModelSelect = () => {
  const { models, selectedModel, setSelectedModel } = useModels();
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [localSelectedModel, setLocalSelectedModel] = useState<string>(
    models.find((m) => m.source === selectedModel.name)?.name || ""
  );

  useEffect(() => {
    if (models && models.length > 0) {
      setModelOptions(models.map((model: Model) => model.name) || []);
    }
  }, [models]);

  useEffect(() => {
    if (models && models.length > 0) {
      if (localSelectedModel && localSelectedModel !== selectedModel.name) {
        const selected = models.find(
          (m: Model) => m.name === localSelectedModel
        );
        setSelectedModel(selected as Model);
      }
    }
  }, [localSelectedModel]);

  return (
    <Fragment>
      {modelOptions.length > 0 && (
        <InputSelect
          options={modelOptions}
          selected={localSelectedModel}
          setSelected={setLocalSelectedModel}
        />
      )}
    </Fragment>
  );
};

export default ModelSelect;
