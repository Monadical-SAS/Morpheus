import React, { Fragment, useEffect, useState } from "react";
import InputSelect from "../Inputs/InputSelect/InputSelect";
import { ControlNetModel } from "../../models/models";
import { useControlNet } from "../../context/CNContext";

const ControlNetModelSelect = () => {
  const {
    controlNetModels,
    selectedCNModel,
    setSelectedCNModel,
    setControlNetType,
  } = useControlNet();
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(
    controlNetModels.find((m) => m.source === selectedCNModel)?.name || ""
  );

  useEffect(() => {
    if (controlNetModels && controlNetModels.length > 0) {
      const options = controlNetModels.map(
        (model: ControlNetModel) => model.name
      );
      setModelOptions(options || []);
    }
  }, [controlNetModels]);

  useEffect(() => {
    if (controlNetModels && controlNetModels.length > 0 && selectedModel) {
      if (selectedModel && selectedModel !== selectedCNModel) {
        const selected = controlNetModels.find(
          (m: ControlNetModel) => m.name === selectedModel
        );
        setSelectedCNModel(selected?.source || "");
        setControlNetType(selected.type || "");
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

export default ControlNetModelSelect;
