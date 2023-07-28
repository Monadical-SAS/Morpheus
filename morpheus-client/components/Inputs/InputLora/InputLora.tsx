import React, { Fragment } from "react";
import { useDiffusion } from "@/context/SDContext";
import { generateRandomNumber } from "@/utils/random";
import { RefreshIcon } from "../../icons/refresh";
import InputCheckbox from "../InputCheckbox/InputCheckbox";
import InputText from "../InputText/InputText";

const InputLora = () => {
  const { loraPath, setLoraPath, useLora, setLora} = useDiffusion();

  return (
    <Fragment>
      <InputText
        id="inputTextLora"
        text={loraPath}
        setText={setLoraPath}
        isRequired={false}
        disabled={false}
      />

      <InputCheckbox
        checked={useLora}
        setChecked={setLora}
        id={"useLora"}
        label={"Use LoRA"}
        styles={{ marginTop: "24px" }}
      />
    </Fragment>
  );
};

export default InputLora;