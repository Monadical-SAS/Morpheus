import React, { Fragment } from "react";
import { useDiffusion } from "@/context/DiffusionContext";
import InputCheckbox from "../InputCheckbox/InputCheckbox";
import InputText from "../InputText/InputText";

const InputLora = () => {
  const { embeddingPath, setEmbeddingPath, useEmbedding, setEmbedding } =
    useDiffusion();

  return (
    <Fragment>
      <InputText
        id="inputTextEmbedding"
        text={embeddingPath}
        setText={setEmbeddingPath}
        isRequired={false}
        disabled={false}
      />

      <InputCheckbox
        checked={useEmbedding}
        setChecked={setEmbedding}
        id={"useEmbedding"}
        label={"Use embedding"}
        styles={{ marginTop: "24px" }}
      />
    </Fragment>
  );
};

export default InputLora;
