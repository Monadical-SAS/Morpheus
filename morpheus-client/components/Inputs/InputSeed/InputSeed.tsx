import React, { Fragment } from "react";
import { useDiffusion } from "@/context/SDContext";
import { generateRandomNumber } from "@/utils/random";
import { RefreshIcon } from "../../icons/refresh";
import InputCheckbox from "../InputCheckbox/InputCheckbox";
import InputText from "../InputText/InputText";

const InputSeed = () => {
  const { seed, setSeed, randomizeSeed, setRandomizeSeed } = useDiffusion();

  const generateRandomSeed = () => {
    const randomSeed = String(generateRandomNumber(20));
    setSeed({
      value: randomSeed,
      validators: [],
    });
  };

  const Icon = (
    <span onClick={generateRandomSeed}>
      <RefreshIcon />
    </span>
  );

  return (
    <Fragment>
      <InputText
        id="inputTextSeed"
        iconRight={Icon}
        text={seed}
        setText={setSeed}
        isRequired={true}
        disabled={false}
      />

      <InputCheckbox
        checked={randomizeSeed}
        setChecked={setRandomizeSeed}
        id={"randomizeSeed"}
        label={"Randomize the seed for each generation"}
        styles={{ marginTop: "24px" }}
      />
    </Fragment>
  );
};

export default InputSeed;
