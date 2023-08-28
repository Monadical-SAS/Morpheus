import React, { Fragment, useEffect, useState } from "react";
import InputSelect from "../Inputs/InputSelect/InputSelect";
import { Sampler } from "@/models/models";
import { useModels } from "@/context/ModelsContext";

const SamplerSelect = () => {
  const { samplers, sampler, setSampler } = useModels();
  const [samplerOptions, setSamplerOptions] = useState<string[]>([]);
  const [selectedSampler, setSelectedSampler] = useState<string>(
    samplers.find((s) => s.id === sampler)?.name || ""
  );

  useEffect(() => {
    if (samplers && samplers.length > 0) {
      setSamplerOptions(samplers.map((s: Sampler) => s.name));
    }
  }, [samplers]);

  useEffect(() => {
    if (samplers && samplers.length > 0) {
      if (selectedSampler && selectedSampler !== sampler) {
        const selected = samplers.find(
          (s: Sampler) => s.name === selectedSampler
        );
        setSampler(selected?.id || "");
      }
    }
  }, [selectedSampler]);

  return (
    <Fragment>
      {samplerOptions.length > 0 && (
        <InputSelect
          options={samplerOptions}
          selected={selectedSampler}
          setSelected={setSelectedSampler}
        />
      )}
    </Fragment>
  );
};

export default SamplerSelect;
