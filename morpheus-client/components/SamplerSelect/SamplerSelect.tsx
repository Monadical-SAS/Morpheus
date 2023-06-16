import React, { Fragment, useEffect, useState } from "react";
import InputSelect from "../Inputs/InputSelect/InputSelect";
import { useDiffusion } from "../../context/SDContext";
import { Sampler } from "../../models/models";

const SamplerSelect = () => {
  const { SDSamplers, sampler, setSampler } = useDiffusion();
  const [samplerOptions, setSamplerOptions] = useState<string[]>([]);
  const [selectedSampler, setSelectedSampler] = useState<string>(
    SDSamplers.find((s) => s.id === sampler)?.name || ""
  );

  useEffect(() => {
    if (SDSamplers && SDSamplers.length > 0) {
      setSamplerOptions(SDSamplers.map((s: Sampler) => s.name));
    }
  }, [SDSamplers]);

  useEffect(() => {
    if (SDSamplers && SDSamplers.length > 0) {
      if (selectedSampler && selectedSampler !== sampler) {
        const selected = SDSamplers.find(
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
