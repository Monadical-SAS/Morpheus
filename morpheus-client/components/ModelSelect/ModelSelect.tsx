import React, { Fragment, useEffect, useState } from "react";
import InputSelect from "../Inputs/InputSelect/InputSelect";
import { Model } from "@/models/models";
import { useModels } from "@/context/ModelsContext";

const ModelSelect = () => {
  const { models, selectedModel, activeLink, setActiveLink } = useModels();

  const compatibleModels = models.filter((m: Model) =>
    m.categories.some((c) => c.name === activeLink.feature)
  );

  const modelOptions = compatibleModels.map((m: Model) => m.name);

  const [localSelected, setLocalSelected] = useState<string>(
    selectedModel?.name || ""
  );

  useEffect(() => {
    if (selectedModel?.name) {
      setLocalSelected(selectedModel.name);
    }
  }, [selectedModel]);

  useEffect(() => {
    if (!localSelected || localSelected === selectedModel?.name) return;
    const model = models.find((m: Model) => m.name === localSelected);
    if (model) {
      setActiveLink({ model, feature: activeLink.feature });
    }
  }, [localSelected]);

  return (
    <Fragment>
      {modelOptions.length > 0 && (
        <InputSelect
          label="Model"
          options={modelOptions}
          selected={localSelected}
          setSelected={setLocalSelected}
          triggerClassName="w-auto border-0 shadow-none focus:ring-0 px-0 gap-2"
        />
      )}
    </Fragment>
  );
};

export default ModelSelect;