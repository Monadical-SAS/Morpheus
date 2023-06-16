import React, { Fragment, useEffect, useState } from "react";
import InputSelect from "../Inputs/InputSelect/InputSelect";
import { useDiffusion } from "../../context/SDContext";
import { Model } from "../../models/models";

const ModelSelect = () => {
  const { validSDModels, selectedSDModel, setSelectedSDModel } = useDiffusion();
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(
    validSDModels.find((m) => m.source === selectedSDModel)?.name || ""
  );

  useEffect(() => {
    if (validSDModels && validSDModels.length > 0) {
      setModelOptions(validSDModels.map((model: Model) => model.name) || []);
    }
  }, [validSDModels]);

  useEffect(() => {
    if (validSDModels && validSDModels.length > 0) {
      if (selectedModel && selectedModel !== selectedSDModel) {
        const selected = validSDModels.find(
          (m: Model) => m.name === selectedModel
        );
        setSelectedSDModel(selected?.source || "");
      }
    }
  }, [selectedModel]);

  return (
    <Fragment>
      {modelOptions.length > 0 && (
        <InputSelect
          options={modelOptions}
          selected={selectedModel}
          setSelected={setSelectedModel}
        />
      )}
    </Fragment>
  );
};

export default ModelSelect;
